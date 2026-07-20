/**
 * SocialBoost Engine - Real-time Task Exchange System
 * 
 * This engine powers the SocialBoost platform by:
 * 1. Managing task queues for social media engagement
 * 2. Distributing tasks to workers in real-time
 * 3. Handling credit exchange between users
 * 4. Anti-fraud detection and prevention
 * 
 * Port: 3003
 * @version 1.1.0 - Enhanced with validation, rate limiting, anti-fraud
 */

import { createServer } from "http";
import { Server, Socket } from "socket.io";

const PORT = 3003;
const MAIN_API_URL = "http://localhost:3000";
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Rate limiting per worker (requests per minute)
  TASK_REQUEST_RATE_LIMIT: 10,
  TASK_COMPLETE_RATE_LIMIT: 30,
  
  // Task timeout (ms)
  TASK_TIMEOUT_MS: 120000, // 2 minutes
  
  // Anti-fraud thresholds
  MIN_TASK_COMPLETION_TIME_MS: 3000, // Minimum time to complete a task (bot detection)
  MAX_TASKS_PER_SESSION: 100, // Max tasks before requiring re-auth
  
  // Queue limits
  MAX_QUEUE_SIZE: 10000,
  MAX_TASKS_PER_USER: 50, // Max pending tasks per creator
};

// Create HTTP server and Socket.io instance
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'socialboost-engine', 
      port: PORT,
      version: '1.1.0',
      environment: ENVIRONMENT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      stats: {
        queueLength: taskQueue.length,
        activeWorkers: activeWorkers.size,
        totalTasksProcessed: engineStats.totalTasksProcessed,
        fraudAlerts: fraudAlerts.length
      }
    }));
    return;
  }
  
  // Admin endpoint for fraud alerts (basic - should be protected in production)
  if (req.url === '/admin/fraud-alerts') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getFraudAlertsSummary()));
    return;
  }
  
  // Admin endpoint for detailed stats
  if (req.url === '/admin/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...getQueueStats(),
      fraudAlerts: getFraudAlertsSummary(),
      config: {
        taskTimeoutMs: CONFIG.TASK_TIMEOUT_MS,
        maxQueueSize: CONFIG.MAX_QUEUE_SIZE,
        maxTasksPerSession: CONFIG.MAX_TASKS_PER_SESSION
      },
      rateLimits: {
        activeEntries: workerRateLimits.size
      }
    }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'socialboost-engine', port: PORT }));
});

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

// ============================================================================
// IN-MEMORY TASK QUEUE (Redis-like functionality)
// ============================================================================

interface QueuedTask {
  id: string;
  campaignId?: string;
  creatorId: string;
  platform: string;
  serviceType: string;
  targetUrl: string;
  targetId: string;
  rewardCredits: number;
  priority: number;
  createdAt: Date;
  expiresAt?: Date;
}

interface ActiveWorker {
  socketId: string;
  userId: string;
  currentTaskId: string | null;
  lastHeartbeat: Date;
  tasksCompleted: number;
  ip?: string;
  name?: string;
}

// Task Queue State
const taskQueue: QueuedTask[] = [];
const activeWorkers: Map<string, ActiveWorker> = new Map();
const workerTasks: Map<string, string> = new Map(); // socketId -> currentTaskId

// Per-worker rate limiting store
const workerRateLimits: Map<string, { taskRequests: number; taskCompletes: number; windowStart: number }> = new Map();

// Anti-fraud tracking
interface FraudAlert {
  userId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: Record<string, unknown>;
}
const fraudAlerts: FraudAlert[] = [];
const MAX_FRAUD_ALERTS = 100;

// Statistics
const engineStats = {
  totalTasksProcessed: 0,
  totalCreditsExchanged: 0,
  peakConcurrentUsers: 0,
  startTime: new Date(),
  tasksCreatedToday: 0,
  tasksCompletedToday: 0,
  uptime: () => Math.floor((Date.now() - engineStats.startTime.getTime()) / 1000),
  resetDailyCounters: function() {
    this.tasksCreatedToday = 0;
    this.tasksCompletedToday = 0;
  }
};

// ============================================================================
// TASK QUEUE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Add a task to the queue
 */
function addTaskToQueue(task: QueuedTask): void {
  // Insert maintaining priority order (higher priority first)
  const insertIndex = taskQueue.findIndex(t => t.priority < task.priority);
  if (insertIndex === -1) {
    taskQueue.push(task);
  } else {
    taskQueue.splice(insertIndex, 0, task);
  }
  
  console.log(`[Engine] Task added to queue: ${task.id} (${task.platform}/${task.serviceType})`);
  engineStats.tasksCreatedToday++;
  
  // Notify waiting workers about new task
  emitTaskAvailable();
}

/**
 * Get next available task for a worker
 * Includes race condition protection - removes task from queue atomically
 */
function getNextTaskAndRemove(workerUserId: string, preferredPlatform?: string): QueuedTask | null {
  // Filter out own tasks and expired tasks
  const now = new Date();
  let taskIndex = -1;
  let selectedTask: QueuedTask | null = null;
  
  // Find best task (prefer platform if specified)
  for (let i = 0; i < taskQueue.length; i++) {
    const task = taskQueue[i];
    if (task.creatorId !== workerUserId && (!task.expiresAt || task.expiresAt > now)) {
      if (preferredPlatform) {
        if (task.platform === preferredPlatform) {
          taskIndex = i;
          selectedTask = task;
          break; // Found preferred platform task
        }
      } else {
        taskIndex = i;
        selectedTask = task;
        break; // Found first available task
      }
    }
  }
  
  // Atomically remove from queue to prevent double-assignment
  if (taskIndex !== -1 && selectedTask) {
    taskQueue.splice(taskIndex, 1);
    return selectedTask;
  }
  
  return null;
}

/**
 * Remove task from queue
 */
function removeFromQueue(taskId: string): boolean {
  const index = taskQueue.findIndex(t => t.id === taskId);
  if (index !== -1) {
    taskQueue.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Get queue statistics
 */
function getQueueStats() {
  const tasksByPlatform = taskQueue.reduce((acc, t) => {
    acc[t.platform] = (acc[t.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const tasksByService = taskQueue.reduce((acc, t) => {
    const key = `${t.platform}/${t.serviceType}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    queueLength: taskQueue.length,
    activeWorkers: activeWorkers.size,
    tasksByPlatform,
    tasksByService,
    engineUptime: engineStats.uptime(),
    totalTasksProcessed: engineStats.totalTasksProcessed,
    totalCreditsExchanged: engineStats.totalCreditsExchanged,
    tasksCreatedToday: engineStats.tasksCreatedToday,
    tasksCompletedToday: engineStats.tasksCompletedToday,
    peakConcurrentUsers: engineStats.peakConcurrentUsers
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Re-queue a task back to the queue (unified helper to avoid code duplication)
 */
async function reQueueTask(taskId: string): Promise<void> {
  try {
    const taskResponse = await callMainAPI(`/api/tasks/${taskId}`);
    
    if (taskResponse && taskResponse.task) {
      const task = taskResponse.task;
      
      // Only re-queue if still pending
      if (task.status === 'pending') {
        addTaskToQueue({
          id: task.id,
          campaignId: task.campaignId,
          creatorId: task.creatorId,
          platform: task.platform,
          serviceType: task.serviceType,
          targetUrl: task.targetUrl,
          targetId: task.targetId,
          rewardCredits: task.rewardCredits,
          priority: task.priority || 1,
          createdAt: new Date(task.createdAt),
          expiresAt: task.expiresAt ? new Date(task.expiresAt) : undefined
        });
        console.log(`[Engine] Task re-queued: ${taskId}`);
      }
    }
  } catch (error) {
    console.error(`[Engine] Error re-queuing task ${taskId}:`, error);
  }
}

/**
 * Clear worker's current task and optionally re-queue it
 */
async function clearWorkerTask(worker: ActiveWorker, socketId: string, shouldReQueue: boolean = true): Promise<void> {
  if (worker.currentTaskId) {
    const taskId = worker.currentTaskId;
    
    // Abandon task via API first
    try {
      await callMainAPI(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'abandon', userId: worker.userId })
      });
    } catch (e) {
      console.error(`[Engine] Error abandoning task ${taskId}:`, e);
    }
    
    // Re-queue if requested
    if (shouldReQueue) {
      await reQueueTask(taskId);
    }
    
    // Clear local state
    worker.currentTaskId = null;
    workerTasks.delete(socketId);
  }
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function emitTaskAvailable(): void {
  io.emit("task:available", { 
    queueLength: taskQueue.length,
    timestamp: Date.now()
  });
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate userId format (basic CUID check)
 */
function isValidUserId(userId: string): boolean {
  // CUID format: starts with 'c', followed by alphanumeric, 25 chars total
  return typeof userId === 'string' && /^[a-z0-9]{20,30}$/i.test(userId);
}

/**
 * Validate platform value
 */
function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'];
  return typeof platform === 'string' && validPlatforms.includes(platform.toLowerCase());
}

/**
 * Validate service type
 */
function isValidServiceType(serviceType: string): boolean {
  const validTypes = ['views', 'subscribers', 'likes', 'comments', 'followers', 
                      'reels_views', 'story_views', 'shares', 'retweets'];
  return typeof serviceType === 'string' && validTypes.includes(serviceType.toLowerCase());
}

/**
 * Sanitize string input (prevent injection)
 */
function sanitize(str: string, maxLength: number = 500): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength).replace(/[<>\"'&\\]/g, '');
}

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Check if worker is within rate limits
 * Returns { allowed: boolean, retryAfter?: number }
 */
function checkWorkerRateLimit(socketId: string, action: 'taskRequest' | 'taskComplete'): { 
  allowed: boolean; 
  retryAfter?: number;
} {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  let limits = workerRateLimits.get(socketId);
  
  // Reset window if expired or doesn't exist
  if (!limits || now - limits.windowStart > windowMs) {
    limits = { taskRequests: 0, taskCompletes: 0, windowStart: now };
    workerRateLimits.set(socketId, limits);
  }
  
  if (action === 'taskRequest') {
    if (limits.taskRequests >= CONFIG.TASK_REQUEST_RATE_LIMIT) {
      const retryAfter = Math.ceil((limits.windowStart + windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(1, retryAfter) };
    }
    limits.taskRequests++;
  } else if (action === 'taskComplete') {
    if (limits.taskCompletes >= CONFIG.TASK_COMPLETE_RATE_LIMIT) {
      const retryAfter = Math.ceil((limits.windowStart + windowMs - now) / 1000);
      return { allowed: false, retryAfter: Math.max(1, retryAfter) };
    }
    limits.taskCompletes++;
  }
  
  return { allowed: true };
}

/**
 * Clean up stale rate limit entries (call periodically)
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  for (const [socketId, limits] of workerRateLimits.entries()) {
    if (now - limits.windowStart > windowMs * 2) { // Remove after 2 minutes of inactivity
      workerRateLimits.delete(socketId);
    }
  }
}

// ============================================================================
// ANTI-FRAUD FUNCTIONS
// ============================================================================

/**
 * Record a fraud alert for investigation
 */
function recordFraudAlert(
  userId: string, 
  reason: string, 
  severity: 'low' | 'medium' | 'high',
  details: Record<string, unknown> = {}
): void {
  const alert: FraudAlert = {
    userId,
    reason,
    severity,
    timestamp: new Date(),
    details
  };
  
  fraudAlerts.push(alert);
  
  // Keep only recent alerts
  if (fraudAlerts.length > MAX_FRAUD_ALERTS) {
    fraudAlerts.shift();
  }
  
  // Log high severity alerts immediately
  if (severity === 'high' || severity === 'medium') {
    console.warn(`[FRAUD ALERT] [${severity.toUpperCase()}] User ${userId}: ${reason}`, details);
  }
}

/**
 * Check for suspicious completion speed (potential bot)
 */
function checkCompletionSpeed(worker: ActiveWorker, timeSpentMs: number): boolean {
  if (timeSpentMs < CONFIG.MIN_TASK_COMPLETION_TIME_MS) {
    recordFraudAlert(worker.userId, 'Suspiciously fast task completion', 'medium', {
      timeSpentMs,
      threshold: CONFIG.MIN_TASK_COMPLETION_TIME_MS,
      tasksCompleted: worker.tasksCompleted
    });
    return false; // Block suspicious completions
  }
  return true;
}

/**
 * Get fraud alerts summary (for admin monitoring)
 */
function getFraudAlertsSummary() {
  const now = Date.now();
  const lastHour = fraudAlerts.filter(a => now - a.getTime() < 60 * 60 * 1000);
  return {
    total: fraudAlerts.length,
    lastHour: lastHour.length,
    bySeverity: {
      high: lastHour.filter(a => a.severity === 'high').length,
      medium: lastHour.filter(a => a.severity === 'medium').length,
      low: lastHour.filter(a => a.severity === 'low').length
    },
    recent: fraudAlerts.slice(-10).map(a => ({
      userId: a.userId.slice(0, 8) + '...', // Partial ID for privacy
      reason: a.reason,
      severity: a.severity,
      timestamp: a.timestamp
    }))
  };
}

function getCreatorSocket(creatorId: string): string {
  for (const [socketId, worker] of activeWorkers.entries()) {
    if (worker.userId === creatorId) {
      return socketId;
    }
  }
  return '';
}

async function callMainAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${MAIN_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return await response.json();
  } catch (error) {
    console.error(`[Engine] API call failed: ${endpoint}`, error);
    return null;
  }
}

// ============================================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================================

io.on("connection", async (socket: Socket) => {
  console.log(`[Engine] Worker connected: ${socket.id}`);
  
  /**
   * Worker authentication and registration
   */
  socket.on("worker:register", async (data: { userId: string; token?: string; ip?: string }) => {
    try {
      // Validate input
      if (!data || typeof data !== 'object') {
        socket.emit("error", { code: "INVALID_INPUT", message: "Invalid registration data" });
        socket.disconnect();
        return;
      }
      
      if (!isValidUserId(data.userId)) {
        socket.emit("error", { code: "INVALID_USER_ID", message: "Invalid user ID format" });
        socket.disconnect();
        return;
      }
      
      const sanitizedUserId = sanitize(data.userId, 30);
      
      // Check if already registered (prevent duplicate connections)
      for (const [existingSocketId, existingWorker] of activeWorkers.entries()) {
        if (existingWorker.userId === sanitizedUserId) {
          // Disconnect old connection
          console.log(`[Engine] Duplicate connection detected for user ${sanitizedUserId}, disconnecting old session`);
          io.sockets.sockets.get(existingSocketId)?.disconnect(true);
          break;
        }
      }
      
      // Verify user exists via main API
      const userResponse = await callMainAPI(`/api/user?userId=${sanitizedUserId}`);
      
      if (!userResponse || !userResponse.user || !userResponse.user.isActive) {
        socket.emit("error", { code: "AUTH_FAILED", message: "Invalid user or account inactive" });
        socket.disconnect();
        return;
      }
      
      const user = userResponse.user;
      
      // Register worker
      const worker: ActiveWorker = {
        socketId: socket.id,
        userId: sanitizedUserId,
        currentTaskId: null,
        lastHeartbeat: new Date(),
        tasksCompleted: 0,
        ip: data.ip ? sanitize(data.ip, 45) : undefined,
        name: user.name ? sanitize(user.name, 50) : (user.email ? sanitize(user.email.split('@')[0], 50) : 'User')
      };
      
      activeWorkers.set(socket.id, worker);
      
      // Track peak users
      if (activeWorkers.size > engineStats.peakConcurrentUsers) {
        engineStats.peakConcurrentUsers = activeWorkers.size;
      }
      
      socket.emit("worker:registered", {
        success: true,
        stats: getQueueStats(),
        user: { credits: user.credits, name: worker.name }
      });
      
      // Broadcast updated online count
      io.emit("stats:online", { count: activeWorkers.size });
      
      console.log(`[Engine] Worker registered: ${socket.id} (User: ${sanitizedUserId})`);
      
    } catch (error) {
      console.error("[Engine] Registration error:", error);
      socket.emit("error", { code: "SERVER_ERROR", message: "Registration failed" });
    }
  });
  
  /**
   * Request a task from the queue
   * Includes retry logic for race condition handling
   */
  socket.on("task:request", async (data: { userId: string; platform?: string }) => {
    try {
      const worker = activeWorkers.get(socket.id);
      if (!worker || worker.userId !== data.userId) {
        socket.emit("error", { code: "NOT_REGISTERED", message: "Please register first" });
        return;
      }
      
      // Check rate limit
      const rateLimitResult = checkWorkerRateLimit(socket.id, 'taskRequest');
      if (!rateLimitResult.allowed) {
        socket.emit("error", { 
          code: "RATE_LIMITED", 
          message: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter 
        });
        return;
      }
      
      // Check if worker already has a task
      if (worker.currentTaskId) {
        socket.emit("error", { code: "HAS_TASK", message: "Complete current task first" });
        return;
      }
      
      // Validate platform if provided
      if (data.platform && !isValidPlatform(data.platform)) {
        socket.emit("error", { code: "INVALID_PLATFORM", message: "Invalid platform specified" });
        return;
      }
      
      // Check session task limit (anti-fraud)
      if (worker.tasksCompleted >= CONFIG.MAX_TASKS_PER_SESSION) {
        socket.emit("error", { code: "SESSION_LIMIT", message: "Session limit reached. Please re-connect to continue." });
        // Don't disconnect, let them finish naturally
        return;
      }
      
      // Get next available task and atomically remove from queue
      const task = getNextTaskAndRemove(data.userId, data.platform);
      
      if (!task) {
        socket.emit("task:empty", { message: "No tasks available", retryIn: 5000 });
        return;
      }
      
      // Claim the task via API (with retry for race conditions)
      const MAX_RETRIES = 2;
      let claimResult: any = null;
      let claimed = false;
      
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        claimResult = await callMainAPI(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ action: 'claim', userId: data.userId })
        });
        
        if (claimResult && claimResult.success) {
          claimed = true;
          break;
        }
        
        // If claim failed due to status conflict, task was already claimed by another worker
        if (claimResult?.error?.includes('cannot claim') || claimResult?.currentStatus) {
          console.log(`[Engine] Task ${task.id} already claimed (attempt ${attempt + 1}), trying next task`);
          
          // Try to get another task
          const nextTask = getNextTaskAndRemove(data.userId, data.platform);
          if (nextTask) {
            Object.assign(task, nextTask); // Update task reference
            continue; // Retry with new task
          } else {
            socket.emit("task:empty", { message: "No tasks available", retryIn: 5000 });
            return;
          }
        }
        
        // Small delay before retry
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
      
      if (!claimed) {
        socket.emit("error", { code: "CLAIM_FAILED", message: claimResult?.error || "Failed to claim task after retries" });
        return;
      }
      
      // Update local state
      worker.currentTaskId = task.id;
      workerTasks.set(socket.id, task.id);
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Send task to worker
      socket.emit("task:assigned", {
        id: task.id,
        platform: task.platform,
        serviceType: task.serviceType,
        targetUrl: task.targetUrl,
        targetId: task.targetId,
        rewardCredits: task.rewardCredits,
        verificationCode,
        timeout: 120000 // 2 minutes to complete
      });
      
      // Notify task creator that work has started
      const creatorSocket = getCreatorSocket(task.creatorId);
      if (creatorSocket) {
        io.to(creatorSocket).emit("task:update", {
          taskId: task.id,
          status: "claimed",
          message: "A worker has started on your task"
        });
      }
      
      console.log(`[Engine] Task assigned: ${task.id} -> Worker ${socket.id}`);
      
    } catch (error) {
      console.error("[Engine] Task request error:", error);
      socket.emit("error", { code: "TASK_ERROR", message: "Failed to get task" });
    }
  });
  
  /**
   * Worker submits task completion
   */
  socket.on("task:complete", async (data: { 
    userId: string; 
    taskId: string; 
    timeSpentMs?: number;
    screenshot?: string;
  }) => {
    try {
      const worker = activeWorkers.get(socket.id);
      if (!worker || worker.userId !== data.userId) {
        socket.emit("error", { code: "NOT_REGISTERED", message: "Please register first" });
        return;
      }
      
      // Validate taskId format
      if (!isValidUserId(data.taskId)) {
        socket.emit("error", { code: "INVALID_TASK_ID", message: "Invalid task ID format" });
        return;
      }
      
      // Check rate limit for completions
      const rateLimitResult = checkWorkerRateLimit(socket.id, 'taskComplete');
      if (!rateLimitResult.allowed) {
        socket.emit("error", { 
          code: "RATE_LIMITED", 
          message: `Completing tasks too fast. Try again in ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter 
        });
        return;
      }
      
      // Anti-fraud: Check completion speed (bot detection)
      const timeSpent = data.timeSpentMs || 0;
      if (timeSpent > 0 && !checkCompletionSpeed(worker, timeSpent)) {
        socket.emit("error", { 
          code: "SUSPICIOUS_ACTIVITY", 
          message: "Task completed too quickly. Please take your time with tasks." 
        });
        // Don't disconnect but log the suspicious activity
        return;
      }
      
      // Complete task via API
      const completeResult = await callMainAPI(`/api/tasks/${data.taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          action: 'complete', 
          userId: data.userId,
          timeSpentMs: data.timeSpentMs 
        })
      });
      
      if (!completeResult || !completeResult.success) {
        socket.emit("error", { code: "COMPLETION_ERROR", message: completeResult?.error || "Failed to complete task" });
        return;
      }
      
      // Clear worker's current task
      worker.currentTaskId = null;
      worker.tasksCompleted++;
      workerTasks.delete(socket.id);
      
      // Update stats
      engineStats.totalTasksProcessed++;
      engineStats.totalCreditsExchanged += completeResult.creditsEarned || 1;
      engineStats.tasksCompletedToday++;
      
      // Send success response to worker
      socket.emit("task:completed", {
        taskId: data.taskId,
        creditsEarned: completeResult.creditsEarned || 1,
        message: `Earned ${completeResult.creditsEarned || 1} credits!`
      });
      
      // Broadcast completion notification
      io.emit("task:verified", {
        taskId: data.taskId,
        status: "completed",
        completerName: worker.name || "Anonymous",
        message: "A task has been completed!"
      });
      
      // Broadcast stats update
      io.emit("stats:update", {
        tasksCompleted: engineStats.totalTasksProcessed,
        creditsExchanged: engineStats.totalCreditsExchanged,
        queueLength: taskQueue.length
      });
      
      console.log(`[Engine] Task completed: ${data.taskId} by User ${data.userId}`);
      
    } catch (error) {
      console.error("[Engine] Task completion error:", error);
      socket.emit("error", { code: "COMPLETION_ERROR", message: "Failed to complete task" });
    }
  });
  
  /**
   * Create new tasks from campaign
   */
  socket.on("tasks:create", async (data: {
    userId: string;
    campaignId: string;
    platform: string;
    serviceType: string;
    targetUrl: string;
    targetId: string;
    quantity: number;
    creditsPerTask: number;
  }) => {
    try {
      // Create tasks via API
      const createResult = await callMainAPI('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!createResult || !createResult.success) {
        socket.emit("error", { code: "CREATION_ERROR", message: createResult?.error || "Failed to create tasks" });
        return;
      }
      
      // Get created tasks and add to queue
      const tasksResponse = await callMainAPI(`/api/tasks?userId=${data.userId}&status=my-created&limit=${data.quantity}`);
      
      if (tasksResponse && tasksResponse.tasks) {
        for (const task of tasksResponse.tasks.slice(-data.quantity)) {
          if (task.status === 'pending') {
            addTaskToQueue({
              id: task.id,
              campaignId: task.campaignId,
              creatorId: task.creatorId,
              platform: task.platform,
              serviceType: task.serviceType,
              targetUrl: task.targetUrl,
              targetId: task.targetId,
              rewardCredits: task.rewardCredits,
              priority: 1,
              createdAt: new Date(task.createdAt),
              expiresAt: task.expiresAt ? new Date(task.expiresAt) : undefined
            });
          }
        }
      }
      
      socket.emit("tasks:created", {
        success: true,
        quantity: data.quantity,
        totalCost: createResult.totalCost,
        creditsRemaining: createResult.creditsRemaining,
        message: `${data.quantity} tasks created and added to queue!`
      });
      
      console.log(`[Engine] Created ${data.quantity} tasks for campaign ${data.campaignId}`);
      
    } catch (error) {
      console.error("[Engine] Task creation error:", error);
      socket.emit("error", { code: "CREATION_ERROR", message: "Failed to create tasks" });
    }
  });
  
  /**
   * Get available tasks count
   */
  socket.on("queue:info", () => {
    socket.emit("queue:info", getQueueStats());
  });
  
  /**
   * Get user's active tasks
   */
  socket.on("tasks:my", async (data: { userId: string }) => {
    try {
      const [createdResponse, completingResponse] = await Promise.all([
        callMainAPI(`/api/tasks?userId=${data.userId}&status=my-created&limit=20`),
        callMainAPI(`/api/tasks?userId=${data.userId}&status=my-completing&limit=10`)
      ]);
      
      socket.emit("tasks:my", { 
        created: createdResponse?.tasks || [], 
        completing: completingResponse?.tasks || [] 
      });
    } catch (error) {
      socket.emit("error", { code: "QUERY_ERROR", message: "Failed to fetch tasks" });
    }
  });
  
  /**
   * Heartbeat / Keep-alive
   */
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: Date.now() });
    
    const worker = activeWorkers.get(socket.id);
    if (worker) {
      worker.lastHeartbeat = new Date();
    }
  });
  
  /**
   * Cancel/abandon current task
   */
  socket.on("task:abandon", async (data: { userId: string; taskId: string }) => {
    try {
      const worker = activeWorkers.get(socket.id);
      if (!worker) return;
      
      // Use unified clearWorkerTask function
      await clearWorkerTask(worker, socket.id, true);
      
      socket.emit("task:abandoned", { taskId: data.taskId });
      console.log(`[Engine] Task abandoned: ${data.taskId}`);
      
    } catch (error) {
      console.error("[Engine] Abandon error:", error);
    }
  });
  
  /**
   * Handle disconnect
   */
  socket.on("disconnect", async () => {
    console.log(`[Engine] Worker disconnected: ${socket.id}`);
    
    const worker = activeWorkers.get(socket.id);
    if (worker) {
      // Use unified clearWorkerTask function to handle task re-queuing
      await clearWorkerTask(worker, socket.id, true);
      
      activeWorkers.delete(socket.id);
      workerTasks.delete(socket.id);
      
      // Broadcast updated online count
      io.emit("stats:online", { count: activeWorkers.size });
      
      console.log(`[Engine] Worker removed: ${socket.id} (Active workers: ${activeWorkers.size})`);
    }
  });
});

// ============================================================================
// PERIODIC TASKS
// ============================================================================

// Clean up expired tasks every 30 seconds
setInterval(async () => {
  const now = new Date();
  const expiredIndices: number[] = [];
  
  for (let i = 0; i < taskQueue.length; i++) {
    if (taskQueue[i].expiresAt && taskQueue[i].expiresAt <= now) {
      expiredIndices.push(i);
    }
  }
  
  // Remove expired tasks (reverse order to maintain indices)
  for (let i = expiredIndices.length - 1; i >= 0; i--) {
    const task = taskQueue[expiredIndices[i]];
    taskQueue.splice(expiredIndices[i], 1);
    
    // Mark in database
    await callMainAPI(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel', userId: task.creatorId })
    }).catch(() => {});
  }
  
  if (expiredIndices.length > 0) {
    console.log(`[Engine] Cleaned up ${expiredIndices.length} expired tasks`);
  }
}, 30000);

// Clean up stale rate limit entries every 2 minutes
setInterval(() => {
  cleanupRateLimits();
}, 2 * 60 * 1000);

// Stale worker tracking with progressive warnings
const workerWarnings = new Map<string, number>(); // socketId -> warning count

// Check for stale workers (with progressive timeout)
setInterval(() => {
  const baseStaleTime = 2 * 60 * 1000; // 2 minutes base
  const now = Date.now();
  
  for (const [socketId, worker] of activeWorkers.entries()) {
    const timeSinceHeartbeat = now - worker.lastHeartbeat.getTime();
    const warningCount = workerWarnings.get(socketId) || 0;
    
    // Progressive timeout: 2min, 3min, 4min (max)
    const staleTime = baseStaleTime + (warningCount * 60 * 1000);
    
    if (timeSinceHeartbeat > staleTime) {
      if (warningCount < 2) {
        // Send warning first
        const newWarningCount = warningCount + 1;
        workerWarnings.set(socketId, newWarningCount);
        console.log(`[Engine] Warning ${newWarningCount} for stale worker: ${socketId}`);
        io.to(socketId).emit("warning", {
          code: "STALE_CONNECTION",
          message: "Connection appears unstable. Please check your network.",
          warningCount: newWarningCount
        });
      } else {
        // Disconnect after warnings
        console.log(`[Engine] Disconnecting stale worker after warnings: ${socketId}`);
        workerWarnings.delete(socketId);
        io.sockets.sockets.get(socketId)?.disconnect(true);
      }
    }
  }
}, 60000);

// Log stats every 5 minutes
setInterval(() => {
  const stats = getQueueStats();
  console.log(`[Engine Stats] Queue: ${stats.queueLength} | Workers: ${stats.activeWorkers} | Processed: ${stats.totalTasksProcessed} | Credits Exchanged: ${stats.totalCreditsExchanged}`);
}, 5 * 60 * 1000);

// Reset daily counters at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    engineStats.resetDailyCounters();
  }
}, 60000);

// ============================================================================
// GRACEFUL SHUTDOWN HANDLING
// ============================================================================

function gracefulShutdown(signal: string): void {
  console.log(`\n[Engine] Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  io.close(() => {
    console.log('[Engine] Socket.io connections closed');
  });
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('[Engine] HTTP server closed');
    
    // Log final stats
    console.log(`[Engine Final Stats]:
      - Total Tasks Processed: ${engineStats.totalTasksProcessed}
      - Total Credits Exchanged: ${engineStats.totalCreditsExchanged}
      - Peak Concurrent Users: ${engineStats.peakConcurrentUsers}
      - Uptime: ${engineStats.uptime()}s
    `);
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Engine] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Engine] Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Engine] Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================================================
// START SERVER
// ============================================================================

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SocialBoost Engine v1.0                             ║
║   ─────────────────────────────────                       ║
║   Real-time Task Exchange System                          ║
║                                                           ║
║   Port:     ${PORT}                                          ║
║   Status:   ✅ Running                                     ║
║   Started:  ${new Date().toISOString()}         ║
║                                                           ║
║   Events:                                                  ║
║   • worker:register     - Register worker                  ║
║   • task:request       - Get next task                    ║
║   • task:complete      - Submit completion                ║
║   • tasks:create       - Batch create tasks               ║
║   • queue:info         - Get queue stats                  ║
║   • task:abandon       - Abandon current task             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

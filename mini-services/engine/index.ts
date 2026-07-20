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
 */

import { createServer } from "http";
import { Server, Socket } from "socket.io";

const PORT = 3003;
const MAIN_API_URL = "http://localhost:3000";

// Create HTTP server and Socket.io instance
const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'socialboost-engine', 
      port: PORT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
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
      // Verify user exists via main API
      const userResponse = await callMainAPI(`/api/user?userId=${data.userId}`);
      
      if (!userResponse || !userResponse.user || !userResponse.user.isActive) {
        socket.emit("error", { code: "AUTH_FAILED", message: "Invalid user or account inactive" });
        socket.disconnect();
        return;
      }
      
      const user = userResponse.user;
      
      // Register worker
      const worker: ActiveWorker = {
        socketId: socket.id,
        userId: data.userId,
        currentTaskId: null,
        lastHeartbeat: new Date(),
        tasksCompleted: 0,
        ip: data.ip,
        name: user.name || user.email?.split('@')[0]
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
      
      console.log(`[Engine] Worker registered: ${socket.id} (User: ${user.email})`);
      
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
      
      // Check if worker already has a task
      if (worker.currentTaskId) {
        socket.emit("error", { code: "HAS_TASK", message: "Complete current task first" });
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

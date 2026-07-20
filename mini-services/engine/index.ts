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
 */
function getNextTask(workerUserId: string, preferredPlatform?: string): QueuedTask | null {
  // Filter out own tasks and expired tasks
  const now = new Date();
  const availableTasks = taskQueue.filter(task => 
    task.creatorId !== workerUserId && 
    (!task.expiresAt || task.expiresAt > now)
  );
  
  // Prefer requested platform if specified
  if (preferredPlatform) {
    const platformTask = availableTasks.find(t => t.platform === preferredPlatform);
    if (platformTask) return platformTask;
  }
  
  return availableTasks[0] || null;
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
      
      // Get next available task
      const task = getNextTask(data.userId, data.platform);
      
      if (!task) {
        socket.emit("task:empty", { message: "No tasks available", retryIn: 5000 });
        return;
      }
      
      // Claim the task via API
      const claimResult = await callMainAPI(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'claim', userId: data.userId })
      });
      
      if (!claimResult || !claimResult.success) {
        socket.emit("error", { code: "CLAIM_FAILED", message: claimResult?.error || "Failed to claim task" });
        return;
      }
      
      // Update local state
      removeFromQueue(task.id);
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
      
      // Abandon task via API
      await callMainAPI(`/api/tasks/${data.taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'abandon', userId: data.userId })
      });
      
      // Get task details to re-queue
      const taskResponse = await callMainAPI(`/api/tasks/${data.taskId}`);
      
      if (taskResponse && taskResponse.task) {
        const task = taskResponse.task;
        
        // Re-queue if still pending
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
            priority: task.priority,
            createdAt: new Date(task.createdAt),
            expiresAt: task.expiresAt ? new Date(task.expiresAt) : undefined
          });
        }
      }
      
      // Clear worker state
      worker.currentTaskId = null;
      workerTasks.delete(socket.id);
      
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
      // If worker had an active task, re-queue it
      if (worker.currentTaskId) {
        try {
          // Abandon task via API
          await callMainAPI(`/api/tasks/${worker.currentTaskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'abandon', userId: worker.userId })
          });
          
          // Get task to re-queue
          const taskResponse = await callMainAPI(`/api/tasks/${worker.currentTaskId}`);
          
          if (taskResponse && taskResponse.task) {
            const task = taskResponse.task;
            
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
                priority: task.priority,
                createdAt: new Date(task.createdAt),
                expiresAt: task.expiresAt ? new Date(task.expiresAt) : undefined
              });
            }
          }
        } catch (e) {
          console.error("[Engine] Error re-queuing task on disconnect:", e);
        }
      }
      
      activeWorkers.delete(socket.id);
      workerTasks.delete(socket.id);
      
      // Broadcast updated online count
      io.emit("stats:online", { count: activeWorkers.size });
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

// Check for stale workers (no heartbeat for 2 minutes)
setInterval(() => {
  const staleTime = 2 * 60 * 1000; // 2 minutes
  const now = Date.now();
  
  for (const [socketId, worker] of activeWorkers.entries()) {
    if (now - worker.lastHeartbeat.getTime() > staleTime) {
      console.log(`[Engine] Disconnecting stale worker: ${socketId}`);
      io.sockets.sockets.get(socketId)?.disconnect(true);
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

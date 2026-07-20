// SocialBoost Type Definitions
// This file contains all shared TypeScript types for the project

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  name: string | null
  password: string | null
  credits: number
  plan: 'free' | 'pro' | 'business' | 'enterprise'
  isActive: boolean
  lastActiveAt: Date
  totalEarned: number
  totalSpent: number
  tasksCompleted: number
  tasksCreated: number
  createdAt: Date
  updatedAt: Date
}

export interface UserPublic {
  id: string
  email: string
  name: string | null
  credits: number
  plan: string
  isActive: boolean
}

export interface AuthState {
  isLoggedIn: boolean
  user: UserPublic | null
  token?: string
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook'

export type ServiceType = 
  | 'views' 
  | 'subscribers' 
  | 'likes' 
  | 'comments' 
  | 'followers' 
  | 'reels_views' 
  | 'story_views'
  | 'shares'
  | 'retweets'

export type CampaignStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'

export type DeliverySpeed = 'slow' | 'normal' | 'fast' | 'instant'

export interface Campaign {
  id: string
  userId: string
  platform: Platform
  serviceType: ServiceType
  targetUrl: string
  targetId: string
  quantity: number
  completedCount: number
  status: CampaignStatus
  speed: DeliverySpeed
  geoTarget: string | null
  dailyLimit: number | null
  creditsSpent: number
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: date
  tasks?: Task[]
}

export interface CampaignCreateInput {
  platform: Platform
  serviceType: ServiceType
  targetUrl: string
  quantity: number
  speed?: DeliverySpeed
  geoTarget?: string
}

// ============================================================================
// TASK TYPES (Engine)
// ============================================================================

export type TaskStatus = 'pending' | 'claimed' | 'in_progress' | 'completed' | 'verified' | 'failed' | 'cancelled'

export interface Task {
  id: string
  campaignId: string | null
  creatorId: string
  completerId: string | null
  platform: Platform
  serviceType: ServiceType
  targetUrl: string
  targetId: string
  rewardCredits: number
  status: TaskStatus
  priority: number
  claimedAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
  expiresAt: Date | null
  verificationCode: string | null
  verifiedAt: Date | null
  verificationMethod: string | null
  workerIp: string | null
  workerFingerprint: string | null
  timeSpentMs: number | null
  createdAt: Date
  updatedAt: Date
}

export interface QueuedTask {
  id: string
  campaignId?: string
  creatorId: string
  platform: Platform
  serviceType: ServiceType
  targetUrl: string
  targetId: string
  rewardCredits: number
  priority: number
  createdAt: Date
  expiresAt?: Date
}

export interface TaskCreateInput {
  userId: string
  campaignId?: string
  platform: Platform
  serviceType: ServiceType
  targetUrl: string
  targetId: string
  quantity: number
  creditsPerTask: number
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface Session {
  id: string
  userId: string
  socketId: string | null
  isActive: boolean
  lastHeartbeat: Date
  currentTaskId: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ENGINE TYPES
// ============================================================================

export interface ActiveWorker {
  socketId: string
  userId: string
  currentTaskId: string | null
  lastHeartbeat: Date
  tasksCompleted: number
  ip?: string
  name?: string
}

export interface QueueStats {
  queueLength: number
  activeWorkers: number
  tasksByPlatform: Record<string, number>
  tasksByService: Record<string, number>
  engineUptime: number
  totalTasksProcessed: number
  totalCreditsExchanged: number
  tasksCreatedToday: number
  tasksCompletedToday: number
  peakConcurrentUsers: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TasksResponse extends ApiResponse<Task[]> {
  counts?: {
    available: number
    myCreated: number
    myCompleting: number
  }
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardUser {
  id?: string
  name: string
  email: string
  credits: number
  plan?: string
}

export interface DashboardCampaign {
  id: string
  name: string
  platform: Platform
  serviceType: string
  targetUrl: string
  quantity: number
  completedCount: number
  status: CampaignStatus
  creditsSpent: number
  createdAt: string
  progress: number
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface RegisterInput {
  email: string
  name: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ValidationError {
  field: string
  message: string
}

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { 
  Play, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  Instagram, 
  Youtube,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  BarChart3,
  Target,
  Lock,
  Rocket,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Gift,
  Award,
  Headphones,
  Crown,
  Infinity,
  Check,
  Mail,
  ArrowDown,
  Activity,
  Timer,
  Flame,
  Building2,
  Send,
  Loader2,
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  Coins,
  Video,
  Image as ImageIcon,
  Pause,
  PlayCircle,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  User,
  Bell,
  Search,
  ChevronDown,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Share2,
  UserPlus,
  Footprints,
  ShieldCheck,
  BadgeCheck,
  Headphones as HeadphonesIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

// Types
interface Service {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  platform: 'youtube' | 'instagram'
  price: number
  popular?: boolean
}

interface FAQ {
  question: string
  answer: string
}

interface PricingPlan {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  icon: React.ReactNode
}

// Dashboard Types
interface Campaign {
  id: string
  name: string
  platform: 'youtube' | 'instagram'
  serviceType: string
  targetUrl: string
  quantity: number
  completedCount: number
  status: 'active' | 'paused' | 'completed' | 'pending'
  creditsSpent: number
  createdAt: string
  progress: number
}

interface UserStats {
  totalCredits: number
  usedCredits: number
  activeCampaigns: number
  totalCampaigns: number
  totalViews: number
  totalFollowers: number
  engagementRate: number
}

// Data
const youtubeServices: Service[] = [
  {
    id: 'views',
    name: 'Video Views',
    description: 'Boost your video watch count with real user views. Improve your video ranking and visibility.',
    icon: <Eye className="w-6 h-6" />,
    platform: 'youtube',
    price: 1,
    popular: true
  },
  {
    id: 'subscribers',
    name: 'Subscribers',
    description: 'Grow your channel with genuine subscribers who engage with your content.',
    icon: <Users className="w-6 h-6" />,
    platform: 'youtube',
    price: 5
  },
  {
    id: 'likes',
    name: 'Video Likes',
    description: 'Increase engagement signals with authentic likes from real users.',
    icon: <Heart className="w-6 h-6" />,
    platform: 'youtube',
    price: 2
  },
  {
    id: 'comments',
    name: 'Comments',
    description: 'Spark conversations and boost engagement with meaningful comments.',
    icon: <MessageCircle className="w-6 h-6" />,
    platform: 'youtube',
    price: 3
  }
]

const instagramServices: Service[] = [
  {
    id: 'followers',
    name: 'Followers',
    description: 'Expand your Instagram presence with real, active followers.',
    icon: <Users className="w-6 h-6" />,
    platform: 'instagram',
    price: 5,
    popular: true
  },
  {
    id: 'likes',
    name: 'Post Likes',
    description: 'Increase your post engagement and reach more users.',
    icon: <Heart className="w-6 h-6" />,
    platform: 'instagram',
    price: 2
  },
  {
    id: 'comments',
    name: 'Comments',
    description: 'Drive authentic conversations on your posts.',
    icon: <MessageCircle className="w-6 h-6" />,
    platform: 'instagram',
    price: 3
  },
  {
    id: 'reels_views',
    name: 'Reels Views',
    description: 'Boost your Reels visibility and reach the Explore page.',
    icon: <Play className="w-6 h-6" />,
    platform: 'instagram',
    price: 1
  },
  {
    id: 'story_views',
    name: 'Story Views',
    description: 'Get more eyes on your Stories for better engagement.',
    icon: <Eye className="w-6 h-6" />,
    platform: 'instagram',
    price: 1
  }
]

const faqs: FAQ[] = [
  {
    question: "How can I get free YouTube or Instagram growth?",
    answer: "Simply sign up for a free account and you'll receive complimentary credits to start promoting your content. You can earn more credits by engaging with other users' content through our exchange system."
  },
  {
    question: "Are the followers and engagement real?",
    answer: "Yes! All engagement comes from real, active users in our community. We use advanced verification systems to ensure authenticity and maintain high-quality interactions."
  },
  {
    question: "Is it safe to use this platform?",
    answer: "Absolutely. We use industry-standard security measures including anti-bot detection, traffic validation, and encrypted connections. Your account safety is our top priority."
  },
  {
    question: "Why does engagement improve visibility?",
    answer: "Social media algorithms prioritize content with high engagement. When your posts receive more likes, comments, and views, platforms recognize it as valuable content and show it to more people."
  },
  {
    question: "Do I need to pay to start?",
    answer: "No! Our platform is free to use. You get bonus credits upon signup and can earn more by participating in our community. Premium plans are available for faster results."
  },
  {
    question: "How fast can I see results?",
    answer: "Results begin within hours of starting a campaign. Delivery speed depends on your chosen settings and current network activity. Most campaigns show significant progress within 24-48 hours."
  },
  {
    question: "What targeting options are available?",
    answer: "We offer geo-targeting to specific countries, delivery speed controls (slow/normal/fast), daily limits, and quality filters to ensure you reach your ideal audience."
  },
  {
    question: "Can I run multiple campaigns at once?",
    answer: "Yes! You can run multiple campaigns across different platforms and services simultaneously. Your dashboard gives you full control over all active campaigns."
  }
]

const features = [
  {
    icon: <Globe className="w-8 h-8 text-warm-600" />,
    title: "Geo-Targeted Traffic",
    description: "Reach audiences from specific regions based on your content strategy.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Shield className="w-8 h-8 text-warm-600" />,
    title: "Quality & Trust",
    description: "Multiple verification systems ensure authentic engagement.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: <Zap className="w-8 h-8 text-warm-600" />,
    title: "Instant Start",
    description: "Campaigns begin processing immediately after creation.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: <Headphones className="w-8 h-8 text-warm-600" />,
    title: "24/7 Support",
    description: "Our team is always here to help you succeed.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: <Gift className="w-8 h-8 text-warm-600" />,
    title: "Free Credits",
    description: "Start with bonus credits - no payment required.",
    gradient: "from-red-500 to-rose-500"
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-warm-600" />,
    title: "Real Growth",
    description: "Organic-looking growth that algorithms love.",
    gradient: "from-indigo-500 to-violet-500"
  }
]

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for trying out our platform",
    features: [
      "500 free credits monthly",
      "Basic analytics",
      "Email support",
      "3 active campaigns",
      "Standard delivery speed"
    ],
    cta: "Get Started Free",
    icon: <Gift className="w-6 h-6" />
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    description: "For serious content creators",
    features: [
      "10,000 credits monthly",
      "Advanced analytics & insights",
      "Priority support",
      "Unlimited campaigns",
      "Fast delivery speed",
      "Geo-targeting included",
      "API access"
    ],
    cta: "Start Pro Trial",
    popular: true,
    icon: <Zap className="w-6 h-6" />
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For agencies and large creators",
    features: [
      "50,000 credits monthly",
      "White-label dashboard",
      "Dedicated account manager",
      "Unlimited everything",
      "Lightning-fast delivery",
      "Custom integrations",
      "SLA guarantee",
      "Team collaboration"
    ],
    cta: "Contact Sales",
    icon: <Building2 className="w-6 h-6" />
  }
]

const stats = [
  { value: 50, suffix: 'M+', label: 'Views Delivered', icon: <Eye className="w-5 h-5" /> },
  { value: 5, suffix: 'M+', label: 'Followers Gained', icon: <Users className="w-5 h-5" /> },
  { value: 100, suffix: 'K+', label: 'Happy Creators', icon: <Star className="w-5 h-5" /> },
  { value: 99.9, suffix: '%', label: 'Uptime', icon: <Activity className="w-5 h-5" /> }
]

// Dashboard Mock Data
const mockUserStats: UserStats = {
  totalCredits: 1250,
  usedCredits: 425,
  activeCampaigns: 3,
  totalCampaigns: 12,
  totalViews: 45230,
  totalFollowers: 3280,
  engagementRate: 8.7
}

const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Product Review Video',
    platform: 'youtube',
    serviceType: 'views',
    targetUrl: 'https://youtube.com/watch?v=example1',
    quantity: 10000,
    completedCount: 7234,
    status: 'active',
    creditsSpent: 72,
    createdAt: '2024-01-15',
    progress: 72
  },
  {
    id: 'camp2',
    name: 'Summer Collection Post',
    platform: 'instagram',
    serviceType: 'followers',
    targetUrl: 'https://instagram.com/p/example2',
    quantity: 5000,
    completedCount: 5000,
    status: 'completed',
    creditsSpent: 250,
    createdAt: '2024-01-10',
    progress: 100
  },
  {
    id: 'camp3',
    name: 'Tutorial Series Ep.5',
    platform: 'youtube',
    serviceType: 'subscribers',
    targetUrl: 'https://youtube.com/watch?v=example3',
    quantity: 2000,
    completedCount: 1456,
    status: 'active',
    creditsSpent: 73,
    createdAt: '2024-01-18',
    progress: 73
  },
  {
    id: 'camp4',
    name: 'Behind the Scenes Reel',
    platform: 'instagram',
    serviceType: 'reels_views',
    targetUrl: 'https://instagram.com/reel/example4',
    quantity: 15000,
    completedCount: 8920,
    status: 'active',
    creditsSpent: 89,
    createdAt: '2024-01-20',
    progress: 59
  },
  {
    id: 'camp5',
    name: 'Q&A Live Stream',
    platform: 'youtube',
    serviceType: 'comments',
    targetUrl: 'https://youtube.com/watch?v=example5',
    quantity: 500,
    completedCount: 0,
    status: 'paused',
    creditsSpent: 15,
    createdAt: '2024-01-22',
    progress: 0
  }
]

const chartDataViews = [
  { date: 'Mon', views: 4200, followers: 120 },
  { date: 'Tue', views: 5800, followers: 180 },
  { date: 'Wed', views: 4500, followers: 95 },
  { date: 'Thu', views: 7200, followers: 250 },
  { date: 'Fri', views: 6100, followers: 210 },
  { date: 'Sat', views: 8900, followers: 320 },
  { date: 'Sun', views: 7500, followers: 280 },
]

const chartDataEngagement = [
  { name: 'Likes', value: 4500, color: '#ef4444' },
  { name: 'Comments', value: 850, color: '#f59e0b' },
  { name: 'Shares', value: 320, color: '#10b981' },
  { name: 'Saves', value: 180, color: '#8b5cf6' },
]

const chartDataWeekly = [
  { name: 'Week 1', youtube: 4200, instagram: 3100 },
  { name: 'Week 2', youtube: 5800, instagram: 4200 },
  { name: 'Week 3', youtube: 6500, instagram: 4800 },
  { name: 'Week 4', youtube: 7800, instagram: 5200 },
]

// Animated Counter Component
function AnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(value * easeOutQuart)

      if (now < endTime) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums">
      {Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)}{suffix}
    </div>
  )
}

// Live Activity Component
function LiveActivity() {
  const activities = [
    { user: 'Sarah M.', action: 'received 1,250 views', time: 'Just now' },
    { user: 'Mike T.', action: 'gained 89 followers', time: '2 min ago' },
    { user: 'Emily R.', action: 'got 342 likes', time: '4 min ago' },
    { user: 'Alex K.', action: 'earned 150 credits', time: '5 min ago' },
  ]

  const [currentActivities, setCurrentActivities] = useState(activities.slice(0, 3))

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivities(prev => {
        const next = [...prev.slice(1), activities[Math.floor(Math.random() * activities.length)]]
        return next
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-3">
      {currentActivities.map((activity, i) => (
        <div 
          key={`${activity.user}-${i}`}
          className="flex items-center gap-3 p-3 bg-white/80 rounded-lg backdrop-blur-sm animate-fadeIn"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white text-xs font-bold">
            {activity.user[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              <span className="text-warm-700">{activity.user}</span>{' '}
              <span className="text-gray-600">{activity.action}</span>
            </p>
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ==================== DASHBOARD COMPONENT ====================
interface DashboardProps {
  user: { name: string; email: string }
  onLogout: () => void
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview')
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'youtube' as 'youtube' | 'instagram',
    serviceType: 'views',
    targetUrl: '',
    quantity: 1000,
    speed: 'normal',
    geoTarget: 'all'
  })

  // Stats calculations
  const availableCredits = mockUserStats.totalCredits - mockUserStats.usedCredits
  const creditsPercentage = Math.round((mockUserStats.usedCredits / mockUserStats.totalCredits) * 100)

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.targetUrl) {
      toast.error('Please fill in all required fields')
      return
    }

    const creditsNeeded = Math.ceil(newCampaign.quantity / 100)
    if (creditsNeeded > availableCredits) {
      toast.error(`Insufficient credits. You need ${creditsNeeded} but have ${availableCredits}`)
      return
    }

    const campaign: Campaign = {
      id: `camp${Date.now()}`,
      name: newCampaign.name,
      platform: newCampaign.platform,
      serviceType: newCampaign.serviceType,
      targetUrl: newCampaign.targetUrl,
      quantity: newCampaign.quantity,
      completedCount: 0,
      status: 'pending',
      creditsSpent: creditsNeeded,
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0
    }

    setCampaigns([campaign, ...campaigns])
    setIsNewCampaignOpen(false)
    toast.success('Campaign created successfully!', { description: `${newCampaign.name} is now processing` })
    
    // Reset form
    setNewCampaign({
      name: '',
      platform: 'youtube',
      serviceType: 'views',
      targetUrl: '',
      quantity: 1000,
      speed: 'normal',
      geoTarget: 'all'
    })
  }

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id 
        ? { ...c, status: c.status === 'active' ? 'paused' : c.status === 'paused' ? 'active' : c.status }
        : c
    ))
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id))
    toast.success('Campaign deleted')
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 border-green-200',
      paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return styles[status] || styles.pending
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'youtube' 
      ? <Youtube className="w-4 h-4 text-red-500" />
      : <Instagram className="w-4 h-4 text-pink-500" />
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-screen z-40`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg gradient-text">SocialBoost</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: <LayoutDashboard />, label: 'Overview', id: 'overview' },
            { icon: <Target />, label: 'Campaigns', id: 'campaigns' },
            { icon: <BarChart3 />, label: 'Analytics', id: 'analytics' },
            { icon: <Coins />, label: 'Credits', id: 'credits' },
            { icon: <Settings />, label: 'Settings', id: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveDashboardTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeDashboardTab === item.id 
                  ? 'bg-warm-500/20 text-warm-400 font-medium' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            )}
            <button onClick={onLogout} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold capitalize">{activeDashboardTab}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </Button>
              <Button 
                size="sm" 
                className="gradient-bg text-white border-0 gap-2"
                onClick={() => setIsNewCampaignOpen(true)}
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeDashboardTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Credits</p>
                        <p className="text-3xl font-bold mt-1">{availableCredits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{creditsPercentage}% used</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-400 to-orange-500 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full gradient-bg rounded-full" style={{ width: `${creditsPercentage}%` }}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Campaigns</p>
                        <p className="text-3xl font-bold mt-1">{mockUserStats.activeCampaigns}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-3 h-3" /> +2 this week
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-3xl font-bold mt-1">{(mockUserStats.totalViews / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-3 h-3" /> +18% vs last week
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        <p className="text-3xl font-bold mt-1">{mockUserStats.engagementRate}%</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="w-3 h-3" /> +2.3% improvement
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Views Chart */}
                <Card className="lg:col-span-2 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Views & Followers Trend</CardTitle>
                      <Select defaultValue="7d">
                        <SelectTrigger className="w-28 h-8 text-xs" />
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartDataViews}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Engagement Pie Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Engagement Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartDataEngagement}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartDataEngagement.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {chartDataEngagement.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Campaign Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="text-warm-600">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b">
                          <th className="pb-3 font-medium">Campaign</th>
                          <th className="pb-3 font-medium">Platform</th>
                          <th className="pb-3 font-medium">Progress</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.slice(0, 5).map((campaign) => (
                          <tr key={campaign.id} className="border-b last:border-0">
                            <td className="py-3">
                              <div>
                                <p className="font-medium text-sm">{campaign.name}</p>
                                <p className="text-xs text-muted-foreground">{campaign.createdAt}</p>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                {getPlatformIcon(campaign.platform)}
                                <span className="text-sm capitalize">{campaign.serviceType}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full gradient-bg rounded-full" 
                                    style={{ width: `${campaign.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-muted-foreground">{campaign.progress}%</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline" className={getStatusBadge(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleToggleCampaignStatus(campaign.id)}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                                >
                                  {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeDashboardTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Filters Bar */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search campaigns..." className="pl-9" />
                    </div>
                    <Select defaultValue="all-platforms">
                      <SelectTrigger className="w-40" />
                      <SelectContent>
                        <SelectItem value="all-platforms">All Platforms</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-statuses">
                      <SelectTrigger className="w-36" />
                      <SelectContent>
                        <SelectItem value="all-statuses">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" /> More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Campaigns Table */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">All Campaigns</CardTitle>
                      <Badge variant="secondary">{campaigns.length} total</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Export
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b bg-gray-50">
                          <th className="p-3 font-medium w-10">
                            <input type="checkbox" className="rounded" />
                          </th>
                          <th className="p-3 font-medium">Campaign Name</th>
                          <th className="p-3 font-medium">Platform</th>
                          <th className="p-3 font-medium">Service Type</th>
                          <th className="p-3 font-medium">Target URL</th>
                          <th className="p-3 font-medium">Progress</th>
                          <th className="p-3 font-medium">Credits</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium">Created</th>
                          <th className="p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b hover:bg-gray-50/50 transition-colors group">
                            <td className="p-3">
                              <input 
                                type="checkbox" 
                                checked={selectedCampaigns.includes(campaign.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCampaigns([...selectedCampaigns, campaign.id])
                                  } else {
                                    setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id))
                                  }
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-sm">{campaign.name}</p>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {getPlatformIcon(campaign.platform)}
                                <span className="text-sm capitalize">{campaign.platform}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">{campaign.serviceType.replace('_', ' ')}</span>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              <a href={campaign.targetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-warm-600 hover:text-warm-700 flex items-center gap-1 truncate" title={campaign.targetUrl}>
                                <span className="truncate">{campaign.targetUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{campaign.completedCount.toLocaleString()} / {campaign.quantity.toLocaleString()}</span>
                                  <span>{campaign.progress}%</span>
                                </div>
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      campaign.progress === 100 ? 'bg-green-500' : 'gradient-bg'
                                    }`}
                                    style={{ width: `${campaign.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium">{campaign.creditsSpent}</span>
                              <Coins className="w-3 h-3 inline ml-1 text-warm-500" />
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={getStatusBadge(campaign.status)}>
                                {campaign.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {campaign.createdAt}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleToggleCampaignStatus(campaign.id)}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                                  title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                                >
                                  {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : campaign.status === 'paused' ? <PlayCircle className="w-4 h-4" /> : null}
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {campaigns.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground mb-4">No campaigns yet</p>
                      <Button onClick={() => setIsNewCampaignOpen(true)} className="gradient-bg text-white border-0">
                        Create Your First Campaign
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeDashboardTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Weekly Performance Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Performance by Platform</CardTitle>
                    <CardDescription>Compare YouTube and Instagram growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartDataWeekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Bar dataKey="youtube" name="YouTube" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="instagram" name="Instagram" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Growth Metrics */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Growth Metrics</CardTitle>
                    <CardDescription>Your account performance overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Total Views Delivered', value: '45,230', change: '+23%', positive: true },
                      { label: 'Followers Gained', value: '3,280', change: '+15%', positive: true },
                      { label: 'Avg. Engagement Rate', value: '8.7%', change: '+2.3%', positive: true },
                      { label: 'Credits Used', value: '425 / 1250', change: '-34%', positive: false },
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="text-lg font-semibold">{metric.value}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-600' : 'text-red-500'}`}>
                          {metric.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Timeline */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Engagement Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartDataViews}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CREDITS TAB */}
          {activeDashboardTab === 'credits' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Credit Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-warm-100 to-orange-100 mb-4">
                        <Coins className="w-12 h-12 text-warm-600" />
                      </div>
                      <p className="text-5xl font-black gradient-text">{availableCredits.toLocaleString()}</p>
                      <p className="text-muted-foreground mt-2">credits available</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starting Balance</span>
                        <span className="font-medium">{mockUserStats.totalCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used</span>
                        <span className="font-medium text-red-500">-{mockUserStats.usedCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>Remaining</span>
                        <span className="text-warm-600">{availableCredits.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Get More Credits</CardTitle>
                    <CardDescription>Choose a package to continue growing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { credits: 1000, price: '$9.99', popular: false, savings: '' },
                      { credits: 5000, price: '$39.99', popular: true, savings: 'Save 20%' },
                      { credits: 15000, price: '$99.99', popular: false, savings: 'Save 33%' },
                      { credits: 50000, price: '$299.99', popular: false, savings: 'Save 40%' },
                    ].map((pkg, i) => (
                      <div 
                        key={i} 
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          pkg.popular 
                            ? 'border-warm-500 bg-warm-50/50' 
                            : 'border-gray-200 hover:border-warm-300'
                        }`}
                      >
                        {pkg.popular && (
                          <Badge className="absolute -top-2 right-2 gradient-bg text-white border-0">Best Value</Badge>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{pkg.credits.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">credits</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-warm-600">{pkg.price}</p>
                            {pkg.savings && <p className="text-xs text-green-600">{pkg.savings}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button className="w-full gradient-bg text-white border-0" onClick={() => toast.info('Payment integration coming soon!')}>
                      Purchase Credits
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Credit History */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Spent', amount: -72, desc: 'Product Review Video views campaign', date: 'Today' },
                      { type: 'Earned', amount: 150, desc: 'Daily engagement bonus', date: 'Today' },
                      { type: 'Spent', amount: -89, desc: 'Behind the Scenes Reel views campaign', date: 'Yesterday' },
                      { type: 'Earned', amount: 500, desc: 'Welcome bonus', date: 'Jan 22' },
                      { type: 'Spent', amount: -250, desc: 'Summer Collection followers campaign', date: 'Jan 18' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.amount > 0 
                              ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                              : <ArrowUpRight className="w-5 h-5 text-red-500" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.desc}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeDashboardTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input defaultValue={user.email} type="email" />
                    </div>
                  </div>
                  <Button className="gradient-bg text-white border-0" onClick={() => toast.success('Profile updated!')}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Email notifications for campaign updates', defaultChecked: true },
                    { label: 'Push notifications for new features', defaultChecked: true },
                    { label: 'Weekly performance reports', defaultChecked: false },
                    { label: 'Marketing emails and offers', defaultChecked: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <span className="text-sm">{pref.label}</span>
                      <Switch defaultChecked={pref.defaultChecked} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button variant="destructive" onClick={() => onLogout()}>Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* New Campaign Dialog */}
      <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-warm-600" />
              Create New Campaign
            </DialogTitle>
            <DialogDescription>Set up your campaign to start gaining engagement</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input 
                placeholder="e.g., Summer Product Launch Video"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              />
            </div>

            {/* Platform & Service Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select 
                  value={newCampaign.platform} 
                  onValueChange={(v) => setNewCampaign({...newCampaign, platform: v as 'youtube' | 'instagram'})}
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> YouTube</div>
                    </SelectItem>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select 
                  value={newCampaign.serviceType} 
                  onValueChange={(v) => setNewCampaign({...newCampaign, serviceType: v})}
                >
                  <SelectTrigger />
                  <SelectContent>
                    {(newCampaign.platform === 'youtube' ? [
                      { value: 'views', label: 'Video Views' },
                      { value: 'subscribers', label: 'Subscribers' },
                      { value: 'likes', label: 'Video Likes' },
                      { value: 'comments', label: 'Comments' },
                    ] : [
                      { value: 'followers', label: 'Followers' },
                      { value: 'likes', label: 'Post Likes' },
                      { value: 'comments', label: 'Comments' },
                      { value: 'reels_views', label: 'Reels Views' },
                      { value: 'story_views', label: 'Story Views' },
                    ]).map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target URL */}
            <div className="space-y-2">
              <Label>Target URL *</Label>
              <Input 
                placeholder={newCampaign.platform === 'youtube' ? "https://youtube.com/watch?v=..." : "https://instagram.com/p/..."}
                value={newCampaign.targetUrl}
                onChange={(e) => setNewCampaign({...newCampaign, targetUrl: e.target.value})}
              />
            </div>

            {/* Quantity & Speed */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity * ({Math.ceil(newCampaign.quantity / 100)} credits)</Label>
                <Input 
                  type="number"
                  min={100}
                  step={100}
                  value={newCampaign.quantity}
                  onChange={(e) => setNewCampaign({...newCampaign, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delivery Speed</Label>
                <Select 
                  value={newCampaign.speed} 
                  onValueChange={(v) => setNewCampaign({...newCampaign, speed: v})}
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="slow">Slow (Natural look)</SelectItem>
                    <SelectItem value="normal">Normal (Recommended)</SelectItem>
                    <SelectItem value="fast">Fast (Quick results)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Geo Targeting */}
            <div className="space-y-2">
              <Label>Geo Targeting</Label>
              <Select 
                value={newCampaign.geoTarget} 
                onValueChange={(v) => setNewCampaign({...newCampaign, geoTarget: v})}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="all">Worldwide</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="asia">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium mb-3">Campaign Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="capitalize">{newCampaign.platform} {newCampaign.serviceType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{newCampaign.quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="capitalize">{newCampaign.speed}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Credits Required</span>
                  <span className="text-warm-600">{Math.ceil(newCampaign.quantity / 100)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsNewCampaignOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 gradient-bg text-white border-0" 
                onClick={handleCreateCampaign}
              >
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== END DASHBOARD COMPONENT ====================

// Theme Toggle Component
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted state after first render (not in effect)
  if (!mounted && typeof window !== 'undefined') {
    setTimeout(() => setMounted(true), 0)
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "relative w-9 h-9 rounded-lg border transition-all duration-300",
        "border-border hover:border-warm-400 hover:bg-muted flex items-center justify-center"
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-slate-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

// Demo Dashboard Preview Button
function DemoDashboardButton() {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 text-warm-600 border-warm-200 hover:bg-warm-50"
        onClick={() => setShowDashboard(true)}
      >
        <LayoutDashboard className="w-4 h-4" />
        Preview Dashboard
      </Button>
      
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-warm-600" />
                SocialBoost Dashboard - Preview
              </DialogTitle>
              <Badge variant="secondary" className="bg-warm-100 text-warm-700">
                Demo Mode
              </Badge>
            </div>
            <DialogDescription>
              This is a preview of what your dashboard looks like after signing up.
              All data shown is for demonstration purposes.
            </DialogDescription>
          </DialogHeader>
          
          {/* Mini Dashboard Preview */}
          <Dashboard 
            user={{ name: 'Demo User', email: 'demo@socialboost.app' }} 
            onLogout={() => setShowDashboard(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('youtube')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' })
  
  // Newsletter handler
  const handleNewsletterSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Successfully subscribed!', {
      description: 'You\'ll receive our latest updates and tips.'
    })
    setNewsletterEmail('')
    setIsLoading(false)
  }, [newsletterEmail])

  // Sign up handler
  const handleSignUp = useCallback(async () => {
    if (!email || !password || !name) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully!', {
          description: `Welcome aboard, ${name}! You received 500 free credits.`
        })
        setIsSignUpOpen(false)
        // Set user as logged in
        setIsLoggedIn(true)
        setCurrentUser({ name, email })
        setEmail('')
        setPassword('')
        setName('')
      } else {
        toast.error(data.error || 'Failed to create account')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }, [email, password, name])

  // Sign in handler
  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Welcome back!', {
          description: `Logged in as ${data.user.name || data.user.email}`
        })
        setIsSignInOpen(false)
        // Set user as logged in
        setIsLoggedIn(true)
        setCurrentUser({ 
          name: data.user.name || data.user.email.split('@')[0], 
          email: data.user.email 
        })
        setEmail('')
        setPassword('')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }, [email, password])

  // Logout handler
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setCurrentUser({ name: '', email: '' })
    toast.success('Logged out successfully')
  }, [])

  // If logged in, show Dashboard
  if (isLoggedIn) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />
  }

  // Otherwise, show Landing Page

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-warm-200">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:inline">SocialBoost</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {['services', 'how-it-works', 'pricing', 'features', 'faq'].map((item) => (
                <a 
                  key={item}
                  href={`#${item}`} 
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
                >
                  {item === 'pricing' ? 'Pricing' : item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <DemoDashboardButton />
              <ThemeToggle />
              <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-muted">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-warm-600" />
                      Welcome Back
                    </DialogTitle>
                    <DialogDescription>Sign in to manage your campaigns</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input 
                        id="signin-email" 
                        type="email" 
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input 
                        id="signin-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                      />
                    </div>
                    <Button className="w-full" onClick={handleSignIn}>
                      Sign In
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-bg text-white border-0 hover:opacity-90 shadow-lg shadow-warm-200 hover:shadow-warm-300 transition-shadow">
                    Get Started Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-warm-600" />
                      Create Account
                    </DialogTitle>
                    <DialogDescription>Start growing your social media today</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input 
                        id="signup-name" 
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-bg text-white border-0 hover:opacity-90 shadow-lg" 
                      onClick={handleSignUp}
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Gift className="w-3 h-3 text-warm-500" />
                      Get 500 free credits upon signup!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t animate-slideDown">
              <nav className="flex flex-col gap-1">
                {['services', 'how-it-works', 'pricing', 'features', 'faq'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item}`} 
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </a>
                ))}
                <Separator className="my-2" />
                <div className="flex gap-3 px-3">
                  <Button variant="outline" className="flex-1" onClick={() => {setIsSignInOpen(true); setIsMenuOpen(false)}}>Sign In</Button>
                  <Button className="flex-1 gradient-bg text-white border-0" onClick={() => {setIsSignUpOpen(true); setIsMenuOpen(false)}}>Get Started</Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-warm-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-warm-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-warm-100 to-warm-200 text-warm-800 hover:from-warm-200 hover:to-warm-300 border-warm-300 transition-all duration-300 shadow-sm animate-fadeIn">
              <Flame className="w-4 h-4 mr-2 text-orange-500" />
              #1 Social Media Growth Platform
              <Sparkles className="w-4 h-4 ml-2 text-yellow-500" />
            </Badge>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight animate-fadeInUp">
              Get Free{' '}
              <span className="gradient-text relative inline-block">
                YouTube & Instagram
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C50 2 150 2 198 8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>{' '}
              <br className="hidden sm:block" />
              Growth from Real Users
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              Boost your social media presence with authentic views, followers, likes, and comments. 
              Our platform connects your content with <span className="font-semibold text-foreground">real users</span> who actively engage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <Button 
                size="lg" 
                className="gradient-bg text-white border-0 hover:opacity-90 text-lg px-8 py-6 h-auto animate-pulse-glow group relative overflow-hidden"
                onClick={() => setIsSignUpOpen(true)}
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Start Growing Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 h-auto border-2 hover:border-warm-400 hover:bg-warm-50 transition-all duration-300"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Services
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              {[
                { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: 'No credit card required' },
                { icon: <Shield className="w-5 h-5 text-green-500" />, text: '100% safe & secure' },
                { icon: <Users className="w-5 h-5 text-green-500" />, text: '100K+ happy creators' },
                { icon: <Timer className="w-5 h-5 text-green-500" />, text: 'Instant delivery' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-border/50">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-600 via-warm-500 to-orange-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <div className="text-warm-100 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-red-100 to-pink-100 text-red-700">
              Our Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Choose Your{' '}
              <span className="gradient-text">Growth Platform</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Select from our comprehensive range of services designed to boost your social media presence
            </p>
          </div>

          {/* Platform Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 p-1 bg-muted rounded-xl">
              <TabsTrigger 
                value="youtube" 
                className="gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
                YouTube
              </TabsTrigger>
              <TabsTrigger 
                value="instagram" 
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </TabsTrigger>
            </TabsList>

            {/* YouTube Services */}
            <TabsContent value="youtube" className="animate-fadeIn">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {youtubeServices.map((service, idx) => (
                  <Card 
                    key={service.id} 
                    className={`relative cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${service.popular ? 'ring-2 ring-red-500 ring-offset-2' : ''} group`}
                    onClick={() => setSelectedService(service.id)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {service.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-red-500 text-white px-3 py-1 shadow-lg animate-bounce">
                          <Star className="w-3 h-3 mr-1" /> Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className={`mx-auto w-16 h-16 rounded-2xl ${service.popular ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-red-100'} flex items-center justify-center ${service.popular ? 'text-white shadow-lg shadow-red-200' : 'text-red-600'} mb-3 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(service.icon as React.ReactElement, { className: "w-7 h-7" })}
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-6">
                      <CardDescription className="text-center mb-4 text-sm leading-relaxed">
                        {service.description}
                      </CardDescription>
                      <div className="text-center mb-4">
                        <span className={`text-3xl font-black ${service.popular ? 'text-red-600' : 'text-red-500'}`}>Free</span>
                        <p className="text-xs text-muted-foreground mt-1">with credits</p>
                      </div>
                      <Button 
                        className={`w-full ${service.popular ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-2 border-red-500 text-red-600 hover:bg-red-50'}`}
                        onClick={() => setIsSignUpOpen(true)}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Instagram Services */}
            <TabsContent value="instagram" className="animate-fadeIn">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {instagramServices.map((service, idx) => (
                  <Card 
                    key={service.id} 
                    className={`relative cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${service.popular ? 'ring-2 ring-pink-500 ring-offset-2' : ''} group`}
                    onClick={() => setSelectedService(service.id)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {service.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 shadow-lg">
                          <Star className="w-3 h-3 mr-1" /> Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-pink-200 mb-3 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(service.icon as React.ReactElement, { className: "w-7 h-7" })}
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-6">
                      <CardDescription className="text-center mb-4 text-sm leading-relaxed">
                        {service.description}
                      </CardDescription>
                      <div className="text-center mb-4">
                        <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Free</span>
                        <p className="text-xs text-muted-foreground mt-1">with credits</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-pink-200"
                        onClick={() => setIsSignUpOpen(true)}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Start growing your social media in just 3 simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection line (desktop only) */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-warm-300 via-warm-400 to-warm-500"></div>

              {/* Step 1 */}
              <div className="text-center relative group">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-4xl font-black">01</div>
                    <UserIcon className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-warm-200 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <h3 className="text-xl font-semibold mb-3">Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up for free and receive <span className="text-warm-600 font-semibold">500 bonus credits</span> to start your first campaign instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative group">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-4xl font-black">02</div>
                    <Target className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-warm-200 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <h3 className="text-xl font-semibold mb-3">Create Campaign</h3>
                <p className="text-muted-foreground">
                  Add your video or profile URL, choose your target audience, and configure delivery settings.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative group">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-4xl font-black">03</div>
                    <TrendingUp className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-warm-200 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <h3 className="text-xl font-semibold mb-3">Watch Growth</h3>
                <p className="text-muted-foreground">
                  Sit back as real users engage with your content. Watch your metrics soar!
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="gradient-bg text-white border-0 hover:opacity-90 px-8 shadow-lg shadow-warm-200 hover:shadow-warm-300 transition-shadow"
                onClick={() => setIsSignUpOpen(true)}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Now - It's Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800">
              <Crown className="w-3 h-3 mr-1" />
              Flexible Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'ring-2 ring-warm-500 ring-offset-4 scale-105 shadow-2xl' 
                    : 'hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warm-500 to-orange-500"></div>
                )}
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-white border-0 shadow-lg z-10">
                    <Star className="w-3 h-3 mr-1" /> Most Popular
                  </Badge>
                )}
                
                <CardContent className="pt-8 pb-8">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${plan.popular ? 'gradient-bg text-white' : 'bg-muted'} ${!plan.popular && 'text-muted-foreground'}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-end justify-center gap-1">
                      {plan.price === 0 ? (
                        <>
                          <span className="text-5xl font-black gradient-text">Free</span>
                        </>
                      ) : (
                        <>
                          <span className="text-5xl font-black">${plan.price}</span>
                          <span className="text-muted-foreground mb-2">/{plan.period}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-warm-500' : 'text-green-500'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'gradient-bg text-white border-0 hover:opacity-90 shadow-lg' 
                        : plan.price === 0 
                          ? 'border-2 border-warm-500 text-warm-600 hover:bg-warm-50'
                          : ''
                    }`}
                    onClick={() => plan.price === 0 ? setIsSignUpOpen(true) : toast.info(`${plan.name} plan coming soon!`)}
                  >
                    {plan.cta}
                    {!plan.popular && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features + Live Demo Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Features That <span className="gradient-text">Set Us Apart</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced tools and security measures for optimal growth
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {/* Features Grid - 3 columns */}
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-card overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}></div>
                  <CardContent className="pt-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <div className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Activity Panel - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-warm-500 to-orange-500 text-white overflow-hidden h-full">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 animate-pulse" />
                      <span className="text-sm font-medium opacity-90">Live Activity Feed</span>
                    </div>
                    <p className="text-sm opacity-75">Real-time growth happening now</p>
                  </div>
                  
                  <LiveActivity />

                  <div className="mt-auto pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="opacity-75">Online users:</span>
                      <span className="font-bold text-lg">12,847</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Features Banner */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-7 h-7 text-warm-400" />
                      Advanced Campaign Controls
                    </h3>
                    <ul className="space-y-3">
                      {[
                        'Variable watch duration for natural patterns',
                        'Delivery speed control (slow/normal/fast)',
                        'Traffic quality filtering',
                        'Daily limit management',
                        'Geo-targeting by country'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 group">
                          <div className="w-6 h-6 rounded-full bg-warm-500/20 flex items-center justify-center group-hover:bg-warm-500/40 transition-colors">
                            <Check className="w-4 h-4 text-warm-400" />
                          </div>
                          <span className="group-hover:translate-x-1 transition-transform inline-block">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="relative">
                      <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-warm-500/20 to-orange-500/20 flex items-center justify-center">
                        <BarChart3 className="w-28 h-28 text-warm-400/50" />
                      </div>
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-warm-500 flex items-center justify-center animate-float shadow-lg">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1s' }}>
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800">
                  <Lock className="w-3 h-3 mr-1" />
                  Security First
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Traffic Quality &{' '}
                  <span className="gradient-text">Security</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Multiple verification systems ensure interactions come from real users 
                  and maintain authentic engagement signals.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: <Shield />, title: 'Anti-Bot Detection', desc: 'Blocks automated and non-human traffic', color: 'red' },
                    { icon: <Globe />, title: 'Connection Filtering', desc: 'Restricts suspicious or low-quality sources', color: 'blue' },
                    { icon: <Eye />, title: 'Traffic Validation', desc: 'Ensures realistic viewing behavior patterns', color: 'green' },
                    { icon: <Lock />, title: 'Device Verification', desc: 'Confirms unique user sessions', color: 'purple' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center text-${item.color}-600 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-warm-200 to-warm-300 opacity-20 blur-3xl"></div>
                  <div className="relative h-full rounded-3xl bg-gradient-to-br from-warm-50 to-warm-100 border border-warm-200 p-8 flex flex-col justify-center shadow-xl">
                    <div className="space-y-4">
                      {[
                        { label: 'Active Users Online', value: '12,847', change: '+23%', color: 'text-green-600' },
                        { label: 'Campaigns Running', value: '3,291', change: '+156', color: 'text-blue-600' },
                        { label: 'Success Rate', value: '99.9%', change: '↑ 0.1%', color: 'text-warm-600' },
                        { label: 'Avg. Response Time', value: '< 2s', change: '-0.3s', color: 'text-purple-600' }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all group">
                          <div>
                            <span className="text-muted-foreground text-sm">{stat.label}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">{stat.change}</span>
                            </div>
                          </div>
                          <Activity className={`w-8 h-8 ${stat.color} opacity-30 group-hover:opacity-60 transition-opacity`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              <Award className="w-3 h-3 mr-1" />
              Trusted by Creators
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Sarah M.',
                role: 'YouTuber • 250K subscribers',
                content: 'SocialBoost helped me grow my channel from 10K to 250K subscribers in just 6 months. The engagement is real and the support is amazing!',
                rating: 5,
                avatar: 'S',
                gradient: 'from-pink-500 to-rose-500'
              },
              {
                name: 'Mike T.',
                role: 'Instagram Influencer • 1M followers',
                content: 'I was skeptical at first, but this platform delivers real results. My engagement rates have never been higher. Highly recommend!',
                rating: 5,
                avatar: 'M',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                name: 'Emily R.',
                role: 'Content Creator • Multi-platform',
                content: 'The best investment for my social media growth. Easy to use, great results, and excellent customer service. 10/10 would recommend!',
                rating: 5,
                avatar: 'E',
                gradient: 'from-purple-500 to-violet-500'
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="pt-8 pb-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-warm-400 text-warm-400 group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                  <Separator className="mb-6" />
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
                Got Questions?
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our platform
              </p>
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-card rounded-2xl px-6 shadow-sm border-0 hover:shadow-md transition-shadow data-[state=open]:shadow-lg"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline text-base py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 overflow-hidden max-w-4xl mx-auto shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-warm-500 via-orange-400 to-warm-500"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            
            <CardContent className="relative p-8 md:p-12 text-center text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Updated with Tips
              </h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                Join our newsletter and get exclusive growth tips, feature updates, and special offers delivered straight to your inbox.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/95 text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-2 focus-visible:ring-white/50 h-14 px-6 text-base"
                  required
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-foreground text-white hover:bg-foreground/90 border-0 h-14 px-8 font-semibold whitespace-nowrap"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Subscribe <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              
              <p className="mt-4 text-sm opacity-75 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-warm-500 rounded-full blur-3xl opacity-10"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-10"></div>
            </div>
            
            <CardContent className="relative p-8 md:p-16 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Rocket className="w-4 h-4 text-warm-400" />
                <span className="text-sm font-medium">Join 100,000+ Creators</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Grow Your{' '}
                <span className="gradient-text">Social Media?</span>
              </h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto mb-10">
                Join thousands of creators who are already using SocialBoost to accelerate their growth. 
                Start for free today!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-gray-100 border-0 text-lg px-10 py-7 h-auto font-bold shadow-2xl shadow-white/20 group"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  <Rocket className="w-6 h-6 mr-2 group-hover:translate-x-1 transition-transform" />
                  Get Started Free
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10 py-7 h-auto"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Contact Sales
                </Button>
              </div>
              
              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm opacity-70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-warm-400" />
                  <span>500 free credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Gift className="w-3 h-3 mr-1" />
                Earn Rewards
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Refer & <span className="gradient-text">Earn Free Credits</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Invite friends and earn bonus credits for every successful referral. It's a win-win!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Referral Info Card */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600"></div>
                <CardContent className="relative p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Gift className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Referral Program</h3>
                      <p className="text-white/80 text-sm">Unlimited earning potential</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      { step: '1', title: 'Share Your Link', desc: 'Get your unique referral code', icon: Share2, color: 'bg-white/20' },
                      { step: '2', title: 'Friend Signs Up', desc: 'They get 500 bonus credits', icon: UserPlus, color: 'bg-white/20' },
                      { step: '3', title: 'You Both Win', desc: 'You earn 250 credits per referral', icon: Coins, color: 'bg-yellow-400/30' }
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-sm text-white/70">{item.desc}</div>
                        </div>
                        <Badge className="bg-white/20 text-white border-0">Step {item.step}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="text-sm text-white/70 mb-2">Your Referral Code (Demo)</div>
                    <div className="flex gap-2">
                      <Input 
                        value="SOCIALBOOST2024" 
                        readOnly 
                        className="bg-white/20 border-0 text-white font-mono text-lg"
                      />
                      <Button variant="secondary" size="icon" className="bg-white text-green-600 hover:bg-gray-100 shrink-0">
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Stats & Tiers */}
              <div className="space-y-6">
                {/* Referral Stats */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Referral Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total Referrals', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { label: 'Credits Earned', value: '6,000', icon: Coins, color: 'text-warm-600', bg: 'bg-warm-100' },
                        { label: 'Pending', value: '3', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' }
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div className="text-xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reward Tiers */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-warm-600" />
                      Reward Tiers
                    </h3>
                    <div className="space-y-3">
                      {[
                        { tier: 'Bronze', referrals: '1-5', reward: '250 credits', icon: Medal, color: 'from-orange-400 to-orange-600', textColor: 'text-orange-600' },
                        { tier: 'Silver', referrals: '6-15', reward: '350 credits', icon: Medal, color: 'from-gray-300 to-gray-500', textColor: 'text-gray-600' },
                        { tier: 'Gold', referrals: '16-50', reward: '500 credits', icon: Trophy, color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-600' },
                        { tier: 'Platinum', referrals: '50+', reward: '750 credits + VIP', icon: Gem, color: 'from-cyan-400 to-blue-600', textColor: 'text-cyan-600' }
                      ].map((tier) => (
                        <div key={tier.tier} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                            <tier.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              {tier.tier}
                              <span className="text-xs text-muted-foreground">({tier.referrals} refs)</span>
                            </div>
                            <div className={`text-sm font-medium ${tier.textColor}`}>{tier.reward}/referral</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements / Gamification Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Award className="w-3 h-3 mr-1" />
                Gamification
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Unlock <span className="gradient-text">Achievements</span> & Badges
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete milestones and earn exclusive badges as you grow your social presence.
              </p>
            </div>

            {/* Achievement Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  category: 'First Steps',
                  icon: Footprints,
                  achievements: [
                    { name: 'Welcome Aboard', desc: 'Create an account', unlocked: true, progress: 100 },
                    { name: 'First Campaign', desc: 'Launch your first campaign', unlocked: true, progress: 100 },
                    { name: 'Early Bird', desc: 'Sign up in first month', unlocked: false, progress: 75 }
                  ],
                  gradient: 'from-blue-500 to-cyan-500'
                },
                {
                  category: 'Growth Master',
                  icon: Rocket,
                  achievements: [
                    { name: 'View Collector', desc: 'Get 10K total views', unlocked: true, progress: 100 },
                    { name: 'Rising Star', desc: 'Get 100K total views', unlocked: false, progress: 65 },
                    { name: 'Viral Champion', desc: 'Get 1M total views', unlocked: false, progress: 12 }
                  ],
                  gradient: 'from-warm-500 to-orange-500'
                },
                {
                  category: 'Social Butterfly',
                  icon: Heart,
                  achievements: [
                    { name: 'Like Magnet', desc: 'Get 1K likes', unlocked: true, progress: 100 },
                    { name: 'Engagement Pro', desc: 'Get 10K engagements', unlocked: false, progress: 45 },
                    { name: 'Community Star', desc: 'Get 100 comments', unlocked: false, progress: 80 }
                  ],
                  gradient: 'from-pink-500 to-rose-500'
                },
                {
                  category: 'Referral Hero',
                  icon: Gift,
                  achievements: [
                    { name: 'Sharing is Caring', desc: 'Make first referral', unlocked: true, progress: 100 },
                    { name: 'Network Builder', desc: 'Refer 10 friends', unlocked: false, progress: 60 },
                    { name: 'Ambassador', desc: 'Refer 50 friends', unlocked: false, progress: 24 }
                  ],
                  gradient: 'from-green-500 to-emerald-500'
                },
                {
                  category: 'Loyal Member',
                  icon: Calendar,
                  achievements: [
                    { name: 'Week Warrior', desc: 'Active for 7 days', unlocked: true, progress: 100 },
                    { name: 'Monthly Master', desc: 'Active for 30 days', unlocked: false, progress: 85 },
                    { name: 'Yearly Legend', desc: 'Active for 365 days', unlocked: false, progress: 15 }
                  ],
                  gradient: 'from-purple-500 to-violet-500'
                },
                {
                  category: 'Power User',
                  icon: Zap,
                  achievements: [
                    { name: 'Multi-Platform', desc: 'Use both YouTube & Instagram', unlocked: true, progress: 100 },
                    { name: 'Campaign Pro', desc: 'Run 10 campaigns', unlocked: false, progress: 40 },
                    { name: 'Credit Millionaire', desc: 'Earn 100K credits', unlocked: false, progress: 8 }
                  ],
                  gradient: 'from-amber-500 to-yellow-500'
                }
              ].map((category) => (
                <Card key={category.category} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${category.gradient}`}></div>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg">{category.category}</h3>
                    </div>
                    <div className="space-y-3">
                      {category.achievements.map((achievement) => (
                        <div key={achievement.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            achievement.unlocked 
                              ? `bg-gradient-to-br ${category.gradient}` 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            {achievement.unlocked ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${!achievement.unlocked && 'text-muted-foreground'}`}>
                              {achievement.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{achievement.desc}</div>
                            {!achievement.unlocked && (
                              <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${category.gradient}`}
                                  style={{ width: `${achievement.progress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          {achievement.unlocked && (
                            <Sparkles className="w-4 h-4 text-warm-500 animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Level Progress */}
            <Card className="border-0 shadow-xl overflow-hidden max-w-3xl mx-auto">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-warm-500 p-1">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold gradient-text">12</div>
                          <div className="text-xs text-muted-foreground">Level</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-warm-500 flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce">
                      ⭐
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h3 className="text-2xl font-bold">Growth Explorer</h3>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">Pro Tier</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">2,450 / 3,000 XP to next level</p>
                    <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-warm-500 transition-all duration-1000 relative"
                        style={{ width: '82%' }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-warm-500" />
                        <span>8 Badges Earned</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>Top 15%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>45 Day Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals / Security Badges */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { icon: ShieldCheck, label: 'SSL Secured', desc: '256-bit encryption' },
              { icon: BadgeCheck, label: 'GDPR Compliant', desc: 'EU data protection' },
              { icon: Lock, label: 'No Password Storage', desc: 'Hashed credentials' },
              { icon: Eye, label: 'Transparent Pricing', desc: 'No hidden fees' },
              { icon: RefreshCw, label: '99.9% Uptime', desc: 'Reliable service' },
              { icon: HeadphonesIcon, label: '24/7 Support', desc: 'Always available' }
            ].map((trust) => (
              <div key={trust.label} className="flex flex-col items-center text-center p-4 rounded-xl bg-card hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <trust.icon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div className="font-semibold text-sm">{trust.label}</div>
                <div className="text-xs text-muted-foreground">{trust.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl shadow-warm-500/30 hover:shadow-warm-500/50 bg-gradient-to-r from-warm-500 to-orange-500 hover:from-warm-600 hover:to-orange-600 text-white border-0 group"
          onClick={() => setIsSignUpOpen(true)}
        >
          <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="sr-only">Get Started</span>
        </Button>
        
        {/* Chat/Help Button */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-full shadow-lg bg-card border-2 border-border hover:border-warm-500 hover:bg-warm-50 dark:hover:bg-warm-950 transition-all group"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-warm-600 transition-colors" />
          <span className="sr-only">Help Chat</span>
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warm-500 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-background">SocialBoost</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                The #1 platform for organic social media growth with real user engagement.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-warm-500 flex items-center justify-center transition-colors group">
                  <Youtube className="w-5 h-5 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-pink-500 flex items-center justify-center transition-colors group">
                  <Instagram className="w-5 h-5 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors group">
                  <TwitterIcon className="w-5 h-5 group-hover:text-white text-gray-400 transition-colors" />
                </a>
              </div>
            </div>

            {/* YouTube Services */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['Video Views', 'Subscribers', 'Video Likes', 'Comments'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-warm-400 transition-colors flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instagram Services */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['Followers', 'Post Likes', 'Comments', 'Reels Views'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-warm-400 transition-colors flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['About Us', 'Blog', 'Careers', 'Contact', 'Press Kit'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-warm-400 transition-colors flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-warm-400 transition-colors flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2024 SocialBoost. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <select className="bg-transparent border-none outline-none cursor-pointer hover:text-white transition-colors">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>for creators</span>
              </div>
            </div>

            {/* Live Stats Banner */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                <LiveUserCounter />
                <div className="text-center">
                  <p className="font-bold text-lg text-white">12.8K+</p>
                  <p className="text-xs opacity-60">Active Users</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-bold text-lg text-white">50M+</p>
                  <p className="text-xs opacity-60">Delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper component for User icon
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// Live User Counter Component
function LiveUserCounter() {
  const [count, setCount] = useState(12847)
  const [isCounting, setIsCounting] = useState(false)

  useEffect(() => {
    // Simulate live counter updates
    const interval = setInterval(() => {
      setIsCounting(true)
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1)
      setTimeout(() => setIsCounting(false), 2000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <p className="flex items-center justify-center gap-1">
        <Users className={`w-4 h-4 ${isCounting ? 'text-green-400 animate-pulse' : 'text-green-500'}`} />
        <span className={isCounting ? 'text-green-400' : 'text-green-500'}>
          {count.toLocaleString()}
        </span>
      </p>
      <p className="text-xs opacity-60">Online Now</p>
    </div>
  )
}

// Twitter/X icon helper
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  )
}

// Medal icon for reward tiers
function Medal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L7.21 0"/>
      <path d="M16.79 15l4.54-7.86a2 2 0 0 0-.13-2.2L16.79 0"/>
      <circle cx="12" cy="15" r="6"/>
      <path d="M12 12v3"/>
    </svg>
  )
}

// Trophy icon for Gold tier
function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  )
}

// Gem icon for Platinum tier
function Gem(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h12l4 6-10 13L2 9Z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
      <path d="M2 9h20"/>
    </svg>
  )
}

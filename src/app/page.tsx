'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
// socket.io-client will be dynamically imported to avoid SSR issues
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  ChevronLeft,
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
  ArrowUp,
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
  Headphones as HeadphonesIcon,
  // Round 8 New Icons
  Calculator,
  Cookie,
  MapPin,
  FastForward,
  GitBranch,
  FileText,
  BookOpen,
  Code,
  CreditCard,
  Twitter,
  Facebook,
  MessageSquare,
  Rss,
  AlertCircle,
  // Round 9 New Icons
  Linkedin,
  Phone,
  Clock as ClockIcon,
  // Engine Icons
  Zap as ZapIcon,
  Radio,
  Wifi,
  Power,
  CircleDot
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
  category: 'all' | 'getting-started' | 'pricing' | 'security' | 'technical'
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
    answer: "Simply sign up for a free account and you'll receive complimentary credits to start promoting your content. You can earn more credits by engaging with other users' content through our exchange system.",
    category: 'getting-started'
  },
  {
    question: "Are the followers and engagement real?",
    answer: "Yes! All engagement comes from real, active users in our community. We use advanced verification systems to ensure authenticity and maintain high-quality interactions.",
    category: 'security'
  },
  {
    question: "Is it safe to use this platform?",
    answer: "Absolutely. We use industry-standard security measures including anti-bot detection, traffic validation, and encrypted connections. Your account safety is our top priority.",
    category: 'security'
  },
  {
    question: "Why does engagement improve visibility?",
    answer: "Social media algorithms prioritize content with high engagement. When your posts receive more likes, comments, and views, platforms recognize it as valuable content and show it to more people.",
    category: 'getting-started'
  },
  {
    question: "Do I need to pay to start?",
    answer: "No! Our platform is free to use. You get bonus credits upon signup and can earn more by participating in our community. Premium plans are available for faster results.",
    category: 'pricing'
  },
  {
    question: "How fast can I see results?",
    answer: "Results begin within hours of starting a campaign. Delivery speed depends on your chosen settings and current network activity. Most campaigns show significant progress within 24-48 hours.",
    category: 'technical'
  },
  {
    question: "What targeting options are available?",
    answer: "We offer geo-targeting to specific countries, delivery speed controls (slow/normal/fast), daily limits, and quality filters to ensure you reach your ideal audience.",
    category: 'technical'
  },
  {
    question: "Can I run multiple campaigns at once?",
    answer: "Yes! You can run multiple campaigns across different platforms and services simultaneously. Your dashboard gives you full control over all active campaigns.",
    category: 'technical'
  },
  // Round 8 - New Technical FAQs
  {
    question: "What's the difference between Fast and Slow delivery?",
    answer: "Fast delivery completes your order within 24 hours but may cost additional credits due to priority processing. Slow delivery takes up to 7 days but costs less and appears more natural to algorithms. Normal delivery (3 days) offers a balanced approach with standard pricing.",
    category: 'technical'
  },
  {
    question: "Can I pause or cancel my campaign?",
    answer: "Yes! You have full control over your campaigns at any time. Paused campaigns retain their progress and can be resumed later without losing any completed engagements. Cancelled campaigns will refund unused credits based on the remaining quantity not yet delivered.",
    category: 'technical'
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a satisfaction guarantee with partial refunds for undelivered orders. If we fail to complete your campaign within the estimated timeframe, you'll automatically receive credit back. For other refund requests, contact our support team within 48 hours of purchase.",
    category: 'pricing'
  },
  {
    question: "How does geo-targeting work?",
    answer: "Geo-targeting allows you to specify which countries or regions your engagement comes from. We maintain a global user pool and route traffic from users in your selected locations. Premium geo-targeted options are available for specific high-value markets like USA, UK, Germany, and Japan with an additional 20% credit cost.",
    category: 'technical'
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

// Magic Number Card Component for Enhanced Stats Section
function MagicNumberCard({ 
  value, 
  suffix, 
  label, 
  icon: Icon, 
  description,
  delay = 0
}: { 
  value: number; 
  suffix: string; 
  label: string; 
  icon: React.ElementType; 
  description?: string;
  delay?: number;
}) {
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
    const duration = 2500
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(value * easeOutQuart)

      if (now < endTime) {
        requestAnimationFrame(animate)
      }
    }

    setTimeout(() => {
      requestAnimationFrame(animate)
    }, delay)
  }, [isVisible, value, delay])

  return (
    <div 
      ref={ref}
      className="glass-card rounded-2xl p-6 text-center group hover:-translate-y-2 transition-all duration-500 counter-glow"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-warm-500/20 to-orange-500/20 mb-4 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-warm-500 group-hover:to-orange-500 transition-all duration-300">
        <Icon className="w-7 h-7 text-warm-500 group-hover:text-white transition-colors" />
      </div>

      {/* Counter */}
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums mb-2">
        {Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)}<span className="text-warm-400">{suffix}</span>
      </div>

      {/* Label */}
      <h4 className="font-semibold text-white/90 mb-1">{label}</h4>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
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

// ============================================
// ROUND 8: INTERACTIVE PRICING CALCULATOR
// ============================================
interface PricingCalculatorProps {
  onSignUp: () => void
}

function PricingCalculator({ onSignUp }: PricingCalculatorProps) {
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube')
  const [serviceType, setServiceType] = useState('views')
  const [quantity, setQuantity] = useState(1000)
  const [deliverySpeed, setDeliverySpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [geoTargeting, setGeoTargeting] = useState(false)

  // Service pricing per unit
  const servicePrices: Record<string, number> = {
    // YouTube
    views: 1,
    subscribers: 5,
    likes: 2,
    comments: 3,
    // Instagram
    followers: 5,
    likes_instagram: 2,
    comments_instagram: 3,
    reels_views: 1,
    story_views: 1
  }

  // Speed multipliers
  const speedMultipliers = {
    slow: 0.8,
    normal: 1,
    fast: 1.5
  }

  // Delivery times in hours
  const deliveryTimes = {
    slow: { youtube: 168, instagram: 168 }, // 7 days
    normal: { youtube: 72, instagram: 72 }, // 3 days
    fast: { youtube: 24, instagram: 24 } // 24 hours
  }

  // Geo-targeting fee (20% extra)
  const geoFee = 0.2

  const getServiceOptions = () => {
    if (platform === 'youtube') {
      return [
        { value: 'views', label: 'Video Views', icon: <Eye className="w-4 h-4" /> },
        { value: 'subscribers', label: 'Subscribers', icon: <Users className="w-4 h-4" /> },
        { value: 'likes', label: 'Video Likes', icon: <Heart className="w-4 h-4" /> },
        { value: 'comments', label: 'Comments', icon: <MessageCircle className="w-4 h-4" /> }
      ]
    }
    return [
      { value: 'followers', label: 'Followers', icon: <Users className="w-4 h-4" /> },
      { value: 'likes_instagram', label: 'Post Likes', icon: <Heart className="w-4 h-4" /> },
      { value: 'comments_instagram', label: 'Comments', icon: <MessageCircle className="w-4 h-4" /> },
      { value: 'reels_views', label: 'Reels Views', icon: <Play className="w-4 h-4" /> },
      { value: 'story_views', label: 'Story Views', icon: <Eye className="w-4 h-4" /> }
    ]
  }

  // Compute default service type based on platform (derived value, not state in effect)
  const getDefaultServiceType = (p: typeof platform) => p === 'youtube' ? 'views' : 'followers'
  
  // Use a key that changes when platform changes - this forces Select to reset
  const selectKey = `${platform}-${serviceType}`

  // Animation state management using ref for timing
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValuesRef = useRef({ quantity, serviceType, deliverySpeed, geoTargeting })
  
  // Check if values changed and trigger animation
  useEffect(() => {
    const prev = prevValuesRef.current
    const valuesChanged = 
      prev.quantity !== quantity || 
      prev.serviceType !== serviceType || 
      prev.deliverySpeed !== deliverySpeed || 
      prev.geoTargeting !== geoTargeting
    
    if (valuesChanged) {
      // Use requestAnimationFrame to avoid synchronous setState
      const rafId = requestAnimationFrame(() => {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 300)
      })
      return () => cancelAnimationFrame(rafId)
    }
    
    prevValuesRef.current = { quantity, serviceType, deliverySpeed, geoTargeting }
  }, [quantity, serviceType, deliverySpeed, geoTargeting])

  // Calculate costs
  const baseCost = Math.ceil((quantity / 100) * (servicePrices[serviceType] || 1))
  const speedCost = Math.round(baseCost * (speedMultipliers[deliverySpeed] - 1))
  const geoCost = geoTargeting ? Math.round(baseCost * geoFee) : 0
  const totalCredits = baseCost + speedCost + geoCost
  const estimatedDelivery = deliveryTimes[deliverySpeed][platform]

  const formatDeliveryTime = (hours: number) => {
    if (hours <= 24) return `${hours} hours`
    if (hours <= 48) return `${Math.round(hours / 24)} days`
    return `${Math.round(hours / 24)} days`
  }

  return (
    <section id="pricing-calculator" className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-warm-100 to-orange-100 text-warm-800 border-0">
            <Calculator className="w-3 h-3 mr-1" />
            Smart Calculator
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Calculate Your <span className="gradient-text">Growth Package</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get instant price estimates for your growth needs
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-2xl overflow-hidden glass-card">
            <CardContent className="p-6 md:p-10">
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left Side - Inputs */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-warm-500" />
                    Configure Your Campaign
                  </h3>

                  {/* Platform Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Platform</Label>
                    <Tabs 
                      value={platform} 
                      onValueChange={(v) => setPlatform(v as 'youtube' | 'instagram')}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="youtube" className="gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </TabsTrigger>
                        <TabsTrigger value="instagram" className="gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Service Type Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Service Type</Label>
                    <Select 
                      key={platform}
                      value={serviceType} 
                      onValueChange={(val) => {
                        // Only set if value is valid for current platform
                        const validOptions = getServiceOptions().map(o => o.value)
                        if (validOptions.includes(val)) {
                          setServiceType(val)
                        } else {
                          // Reset to default if invalid
                          setServiceType(getDefaultServiceType(platform))
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {getServiceOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              {option.icon}
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Quantity ({quantity.toLocaleString()})
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        max={1000000}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(1000000, Math.max(1, Number(e.target.value))))}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(prev => Math.max(1, Math.round(prev / 2)))}
                      >
                        Halve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(prev => Math.min(1000000, prev * 2))}
                      >
                        Double
                      </Button>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={100000}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-warm-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>100K+</span>
                    </div>
                  </div>

                  {/* Delivery Speed Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Delivery Speed</Label>
                    <Tabs 
                      value={deliverySpeed} 
                      onValueChange={(v) => setDeliverySpeed(v as 'slow' | 'normal' | 'fast')}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="slow" className="gap-1 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">Slow<br/>7 days</span>
                        </TabsTrigger>
                        <TabsTrigger value="normal" className="gap-1 py-2 data-[state=active]:bg-warm-500 data-[state=active]:text-white">
                          <Timer className="w-3 h-3" />
                          <span className="text-xs">Normal<br/>3 days</span>
                        </TabsTrigger>
                        <TabsTrigger value="fast" className="gap-1 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                          <FastForward className="w-3 h-3" />
                          <span className="text-xs">Fast<br/>24 hrs</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Geo-targeting Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-warm-500" />
                      <div>
                        <p className="font-medium text-sm">Geo-Targeting</p>
                        <p className="text-xs text-muted-foreground">Target specific regions (+20% cost)</p>
                      </div>
                    </div>
                    <Switch checked={geoTargeting} onCheckedChange={setGeoTargeting} />
                  </div>
                </div>

                {/* Right Side - Results */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5 text-warm-500" />
                    Price Breakdown
                  </h3>

                  {/* Visual Breakdown Card */}
                  <Card className={`border-2 transition-all duration-300 ${isAnimating ? 'neon-border-strong scale-[1.02]' : 'border-warm-200'} bg-gradient-to-br from-warm-50/50 to-orange-50/50`}>
                    <CardContent className="p-6 space-y-4">
                      {/* Base Cost */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-600" />
                          </div>
                          Base Cost
                        </span>
                        <span className={`font-semibold calculator-value ${isAnimating ? 'calculator-value-updating' : ''}`}>
                          {baseCost} credits
                        </span>
                      </div>

                      {/* Speed Adjustment */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            deliverySpeed === 'fast' ? 'bg-red-100' :
                            deliverySpeed === 'normal' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {deliverySpeed === 'fast' ? <FastForward className="w-4 h-4 text-red-600" /> :
                             deliverySpeed === 'normal' ? <Timer className="w-4 h-4 text-yellow-600" /> :
                             <Clock className="w-4 h-4 text-green-600" />}
                          </div>
                          Speed Multiplier
                          <Badge variant="outline" className="text-xs ml-1">
                            x{speedMultipliers[deliverySpeed]}
                          </Badge>
                        </span>
                        <span className={`font-semibold ${speedCost > 0 ? 'text-orange-600' : speedCost < 0 ? 'text-green-600' : ''} calculator-value ${isAnimating ? 'calculator-value-updating' : ''}`}>
                          {speedCost > 0 ? '+' : ''}{speedCost} credits
                        </span>
                      </div>

                      {/* Geo Targeting Fee */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          Geo-Targeting Fee
                        </span>
                        <span className={`font-semibold ${geoTargeting ? 'text-purple-600' : 'text-muted-foreground'} calculator-value ${isAnimating ? 'calculator-value-updating' : ''}`}>
                          {geoTargeting ? `+${geoCost}` : '0'} credits
                        </span>
                      </div>

                      <Separator />

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-base flex items-center gap-2">
                          <Coins className="w-5 h-5 text-warm-500" />
                          Total Credits Required
                        </span>
                        <span className={`text-2xl font-black gradient-text calculator-value ${isAnimating ? 'calculator-value-updating' : ''}`}>
                          {totalCredits.toLocaleString()}
                        </span>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Estimated Delivery:
                          <span className="font-semibold text-foreground ml-auto">
                            {formatDeliveryTime(estimatedDelivery)}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CTA Button */}
                  <Button 
                    className="w-full h-14 text-base font-semibold btn-shine gradient-bg text-white border-0 hover:opacity-90 shadow-lg"
                    onClick={() => {
                      toast.success('Campaign configured!', {
                        description: `${quantity.toLocaleString()} ${getServiceOptions().find(s => s.value === serviceType)?.label} for ${platform} - ${totalCredits} credits`
                      })
                      onSignUp()
                    }}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start This Campaign
                  </Button>

                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-medium">Safe & Secure</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <RefreshCw className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs font-medium">Real-time Updates</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <HeadphonesIcon className="w-5 h-5 mx-auto mb-1 text-warm-500" />
                      <p className="text-xs font-medium">24/7 Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ============================================
// ROUND 8: COOKIE CONSENT BANNER
// ============================================
function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    handleClose()
  }

  const handleNecessaryOnly = () => {
    localStorage.setItem('cookie-consent', 'necessary')
    handleClose()
  }

  const handleCustomize = () => {
    toast.info('Cookie preferences panel coming soon!')
    handleAcceptAll() // For now, just accept all
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 ${isClosing ? 'slide-down-cookie' : 'slide-up-cookie'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon and Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">We value your privacy 🍪</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
              <Button 
                size="sm" 
                onClick={handleNecessaryOnly}
                variant="outline"
                className="text-xs whitespace-nowrap"
              >
                Necessary Only
              </Button>
              <Button 
                size="sm" 
                onClick={handleCustomize}
                variant="ghost"
                className="text-xs whitespace-nowrap hidden sm:flex"
              >
                Customize
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="gradient-bg text-white border-0 text-xs whitespace-nowrap btn-shine"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ROUND 8: SKELETON LOADING COMPONENTS
// ============================================
interface SkeletonProps {
  className?: string
}

function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={`skeleton skeleton-card ${className || ''}`}>
      <div className="space-y-3 pt-2">
        <div className="skeleton skeleton-text w-3/4"></div>
        <div className="skeleton skeleton-text-sm w-full"></div>
        <div className="skeleton skeleton-text-sm w-5/6"></div>
      </div>
    </div>
  )
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className={`skeleton ${i === lines - 1 ? 'skeleton-text-sm' : 'skeleton-text'}`}
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        ></div>
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  return (
    <div className={`skeleton ${sizeClasses[size]} rounded-full`}></div>
  )
}

function SkeletonButton({ width = 'w-24' }: { width?: string }) {
  return <div className={`skeleton skeleton-button ${width}`}></div>
}

// Export a combined Skeleton component with variants
function Skeleton({ variant = 'text', ...props }: SkeletonProps & { variant?: 'card' | 'text' | 'avatar' | 'button' }) {
  switch (variant) {
    case 'card':
      return <SkeletonCard {...props} />
    case 'avatar':
      return <SkeletonAvatar {...props} />
    case 'button':
      return <SkeletonButton {...props} />
    default:
      return <SkeletonText {...props} />
  }
}

// ============================================
// ROUND 8: ENHANCED FAQ WITH SEARCH & CATEGORIES
// ============================================
function EnhancedFAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = [
    { id: 'all', label: 'All', icon: <Filter className="w-3 h-3" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <Rocket className="w-3 h-3" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-3 h-3" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-3 h-3" /> },
    { id: 'technical', label: 'Technical', icon: <Code className="w-3 h-3" /> }
  ]

  // Filter FAQs based on search query and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Highlight matching text in question
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="faq-highlight">{part}</span> : part
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-6 text-base rounded-xl border-2 focus-visible:border-warm-500 transition-colors"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
              selectedCategory === category.id
                ? 'category-pill-active'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-semibold text-foreground">{filteredFaqs.length}</span>
        {' '}of{' '}
        <span className="font-semibold text-foreground">{faqs.length}</span>
        {' '}questions
        {(searchQuery || selectedCategory !== 'all') && (
          <>
            {' '}for "
            <span className="text-warm-600 font-medium">
              {searchQuery || categories.find(c => c.id === selectedCategory)?.label}
            </span>
            "
          </>
        )}
      </p>

      {/* FAQ Accordion */}
      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4 smooth-accordion">
          {filteredFaqs.map((faq, index) => {
            // Find original index for stable accordion values
            const originalIndex = faqs.indexOf(faq)
            return (
              <AccordionItem 
                key={`${faq.category}-${index}`}
                value={`faq-${originalIndex}`}
                className="bg-card rounded-2xl px-6 shadow-sm border-0 hover:shadow-md transition-all data-[state=open]:shadow-lg data-[state=open]:scale-[1.01]"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline text-base py-5">
                  {highlightText(faq.question, searchQuery)}
                  {/* Category Badge */}
                  <Badge variant="outline" className="ml-2 text-xs shrink-0 hidden sm:inline-flex">
                    {categories.find(c => c.id === faq.category)?.icon}
                    <span className="ml-1 capitalize">
                      {categories.find(c => c.id === faq.category)?.label}
                    </span>
                  </Badge>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {highlightText(faq.answer, searchQuery)}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        /* No Results State */
        <Card className="border-dashed border-2 border-muted-foreground/20 p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold text-lg mb-2">No results found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We couldn't find any questions matching "{searchQuery}". Try adjusting your search or selecting a different category.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
          >
            Clear filters
          </Button>
        </Card>
      )}
    </div>
  )
}

// ==================== DASHBOARD COMPONENT ====================
interface DashboardProps {
  user: { name: string; email: string }
  onLogout: () => void
  authToken: string | null
}

function Dashboard({ user, onLogout, authToken }: DashboardProps) {
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
            { icon: <ZapIcon />, label: 'Earn Credits', id: 'earn' },
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

          {/* EARN CREDITS TAB - Engine Integration */}
          {activeDashboardTab === 'earn' && (
            <EarnCreditsPanel 
              user={user} 
              authToken={authToken}
              onCreditsUpdate={(credits) => {
              setUser(prev => ({ ...prev, credits }))
            }} />
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

// ==================== NEW UI COMPONENTS (Defined before Home for proper hoisting) ====================

// Scroll Progress Indicator Component
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-warm-500 via-warm-400 to-yellow-400 shadow-sm scroll-progress"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />
    </div>
  )
}

// Notification Bell Dropdown Component
function NotificationBellDropdown() {
  const [notifications, setNotifications] = useState([
    { id: 1, icon: CheckCircle2, title: 'Campaign completed', desc: 'Your YouTube views campaign finished', time: '2 min ago', read: false, color: 'text-green-500' },
    { id: 2, icon: UserPlus, title: 'New referral joined', desc: 'John D. signed up with your link', time: '15 min ago', read: false, color: 'text-blue-500' },
    { id: 3, icon: Coins, title: 'Credits earned!', desc: '+250 credits from referral bonus', time: '1 hour ago', read: false, color: 'text-warm-500' },
    { id: 4, icon: TrendingUp, title: 'Growth milestone reached', desc: 'Your channel gained 10K views', time: '3 hours ago', read: true, color: 'text-purple-500' },
    { id: 5, icon: Gift, title: 'Daily reward available', desc: 'Claim your free daily credits', time: '5 hours ago', read: true, color: 'text-pink-500' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center badge-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs text-warm-600 hover:text-warm-700"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0 ${
                !notification.read ? 'bg-warm-50/50 dark:bg-warm-900/10' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notification.title}</p>
                <p className="text-xs text-muted-foreground truncate">{notification.desc}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-warm-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t">
          <Button variant="ghost" size="sm" className="w-full text-warm-600 hover:text-warm-700 hover:bg-warm-50">
            View all notifications
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Live Activity Ticker Component
function LiveActivityTicker() {
  const activities = [
    { emoji: '🎉', user: 'John D.', action: 'gained', value: '1,000 YouTube views', color: 'text-red-500' },
    { emoji: '📈', user: 'Sarah M.', action: 'earned', value: '250 credits', color: 'text-warm-500' },
    { emoji: '⭐', user: 'Mike T.', action: 'received', value: '89 new followers', color: 'text-pink-500' },
    { emoji: '🚀', user: 'Emily R.', action: 'boosted', value: 'Instagram post to 5K likes', color: 'text-purple-500' },
    { emoji: '💰', user: 'Alex K.', action: 'claimed', value: 'referral bonus +150 credits', color: 'text-green-500' },
    { emoji: '🎯', user: 'Lisa P.', action: 'completed', value: 'campaign milestone', color: 'text-blue-500' },
    { emoji: '✨', user: 'David L.', action: 'unlocked', value: 'Premium features', color: 'text-indigo-500' },
    { emoji: '🌟', user: 'Amy W.', action: 'reached', value: '10K subscribers!', color: 'text-orange-500' },
  ]

  return (
    <div className="bg-gradient-to-r from-warm-500 via-warm-600 to-orange-500 py-3 overflow-hidden">
      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-warm-500 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-orange-500 to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee flex whitespace-nowrap">
          {[...activities, ...activities].map((activity, i) => (
            <div 
              key={i} 
              className="inline-flex items-center gap-3 mx-4 text-white"
            >
              <span className="text-lg">{activity.emoji}</span>
              <span className="font-medium">{activity.user}</span>
              <span className="opacity-75">{activity.action}</span>
              <span className={`font-bold ${activity.color}`}>{activity.value}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Testimonials Carousel Component
function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  const testimonials = [
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
    },
    {
      name: 'Alex K.',
      role: 'Small Business Owner',
      content: 'SocialBoost transformed our online presence. We went from zero to hero in just a few months. The ROI is incredible!',
      rating: 5,
      avatar: 'A',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Jessica L.',
      role: 'Fitness Coach • TikTok Star',
      content: 'As a fitness coach, visibility is everything. SocialBoost helped me reach thousands of potential clients. Game changer!',
      rating: 5,
      avatar: 'J',
      gradient: 'from-orange-500 to-amber-500'
    }
  ]

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused, testimonials.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.ceil(testimonials.length / 3) - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % Math.ceil(testimonials.length / 3))
  }

  // Calculate which testimonials to show
  const getVisibleTestimonials = () => {
    const startIdx = currentIndex * 3
    return testimonials.slice(startIdx, startIdx + 3)
  }

  const totalPages = Math.ceil(testimonials.length / 3)

  return (
    <div 
      className="relative max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-muted transition-colors border border-border"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {getVisibleTestimonials().map((testimonial, i) => (
          <Card key={`${currentIndex}-${i}`} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group testimonial-enter">
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

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-warm-500 w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// ROUND 9: NEW COMPONENTS
// ============================================

// Blog Article Interface
interface BlogArticle {
  id: number
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
  author: {
    name: string
    initials: string
  }
  featured?: boolean
  gradient: string
}

// Blog Data
const blogArticles: BlogArticle[] = [
  {
    id: 1,
    title: "10 Proven Strategies to Triple Your Instagram Engagement in 30 Days",
    excerpt: "Discover the exact tactics top creators use to skyrocket their engagement rates and build loyal communities that convert.",
    category: "Growth Tips",
    readTime: "8 min read",
    date: "Dec 15, 2024",
    author: { name: "Sarah Miller", initials: "SM" },
    featured: true,
    gradient: "from-warm-600 via-orange-500 to-amber-500"
  },
  {
    id: 2,
    title: "YouTube Algorithm Update: What Changed in Q4 2024",
    excerpt: "Stay ahead of the curve with our comprehensive breakdown of the latest YouTube algorithm changes.",
    category: "Platform Updates",
    readTime: "5 min read",
    date: "Dec 12, 2024",
    author: { name: "David Kim", initials: "DK" },
    gradient: "from-red-600 via-red-500 to-orange-500"
  },
  {
    id: 3,
    title: "From 0 to 100K Followers: A Creator Success Story",
    excerpt: "How Emily Chen built a thriving YouTube channel in just 18 months using organic growth strategies.",
    category: "Success Stories",
    readTime: "6 min read",
    date: "Dec 10, 2024",
    author: { name: "Emma Wilson", initials: "EW" },
    gradient: "from-purple-600 via-pink-500 to-rose-500"
  }
]

// Team Member Interface
interface TeamMember {
  name: string
  role: string
  tagline: string
  initials: string
  gradient: string
}

// Team Data
const teamMembers: TeamMember[] = [
  { name: "Alex Chen", role: "CEO & Founder", tagline: "Building the future of social growth", initials: "AC", gradient: "from-warm-500 to-orange-600" },
  { name: "Sarah Miller", role: "Head of Product", tagline: "Making complex things simple", initials: "SM", gradient: "from-pink-500 to-rose-600" },
  { name: "David Kim", role: "Lead Developer", tagline: "Code is poetry", initials: "DK", gradient: "from-blue-500 to-indigo-600" },
  { name: "Emma Wilson", role: "Marketing Director", tagline: "Growing communities", initials: "EW", gradient: "from-purple-500 to-violet-600" },
  { name: "Michael Brown", role: "Customer Success", tagline: "Your success is our mission", initials: "MB", gradient: "from-green-500 to-emerald-600" },
  { name: "Lisa Zhang", role: "Data Scientist", tagline: "Data-driven decisions", initials: "LZ", gradient: "from-cyan-500 to-teal-600" }
]

// Blog Section Component - Round 9 New Feature
function BlogSection() {
  const featuredArticle = blogArticles.find(a => a.featured)!
  const regularArticles = blogArticles.filter(a => !a.featured)

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Latest <span className="gradient-text">Insights</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, tricks, and news to boost your social media growth
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Featured Article Card */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden group hover-lift cursor-pointer">
            <div className={`relative h-full min-h-[400px] bg-gradient-to-br ${featuredArticle.gradient} p-8 flex flex-col justify-between`}>
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-4 hover:bg-white/30 transition-colors">
                  {featuredArticle.category}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-warm-100 transition-colors">
                  {featuredArticle.title}
                </h3>
                <p className="text-white/80 text-lg mb-6 line-clamp-2">
                  {featuredArticle.excerpt}
                </p>
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-semibold">{featuredArticle.author.initials}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{featuredArticle.author.name}</p>
                    <p className="text-white/70 text-sm">{featuredArticle.date} · {featuredArticle.readTime}</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white group/btn">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Regular Article Cards */}
          {regularArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden group hover-lift cursor-pointer">
              <div className={`relative h-40 bg-gradient-to-br ${article.gradient} p-4`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <Badge className="relative z-10 bg-white/20 backdrop-blur-sm text-white border-0 text-xs">
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-warm-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-100 to-orange-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-warm-700">{article.author.initials}</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">{article.author.name}</p>
                      <p className="text-muted-foreground">{article.readTime}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-warm-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group border-warm-300 hover:border-warm-500 hover:bg-warm-50 text-warm-700 hover:text-warm-800 transition-all">
            View All Articles
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}

// Team Section Component - Round 9 New Feature
function TeamSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The people behind SocialBoost
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 stagger-children">
          {teamMembers.map((member) => (
            <Card key={member.name} className="group text-center p-6 hover-lift cursor-pointer tilt-card">
              <CardContent className="p-0 space-y-4">
                {/* Avatar with pulse animation */}
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center pulse-ring`}>
                  <span className="text-2xl font-bold text-white">{member.initials}</span>
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-bold text-lg group-hover:text-warm-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-warm-600 font-medium mb-1">{member.role}</p>
                  <p className="text-xs text-muted-foreground italic">&quot;{member.tagline}&quot;</p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-2 pt-2">
                  <button 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center social-icon-hover"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center social-icon-hover"
                    aria-label={`${member.name}'s Twitter`}
                  >
                    <Twitter className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Contact Section Component - Round 9 New Feature
function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    
    // Reset form after delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: 'general', message: '' })
      setIsSubmitted(false)
    }, 3000)
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@socialboost.io', href: 'mailto:hello@socialboost.io' },
    { icon: MapPin, label: 'Location', value: 'San Francisco, CA', href: '#' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: ClockIcon, label: 'Hours', value: '24/7 Support', href: '#' }
  ]

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-warm-900 via-warm-800 to-orange-900 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="floating-orb floating-orb-1 opacity-30"></div>
      <div className="floating-orb floating-orb-2 opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get In <span className="text-warm-400">Touch</span>
              </h2>
              <p className="text-warm-200 text-lg">
                Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-warm-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warm-500 to-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-300">{item.label}</p>
                    <p className="font-medium group-hover:text-warm-400 transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold neon-text">
                  <AnimatedCounter value={98} suffix="%" />
                </p>
                <p className="text-warm-300 text-sm">Satisfaction Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold neon-text">
                  <AnimatedCounter value={24} suffix="/7" />
                </p>
                <p className="text-warm-300 text-sm">Support Available</p>
              </div>
              <div>
                <p className="text-3xl font-bold neon-text">
                  <AnimatedCounter value={2} suffix="hr" />
                </p>
                <p className="text-warm-300 text-sm">Avg Response Time</p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-white">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-warm-400 focus:ring-warm-400/50"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-white">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-warm-400 focus:ring-warm-400/50"
                  required
                />
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="contact-subject" className="text-white">Subject *</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-warm-400 focus:ring-warm-400/50">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-warm-900 border-white/20">
                    <SelectItem value="general" className="text-white focus:bg-warm-800">General Inquiry</SelectItem>
                    <SelectItem value="support" className="text-white focus:bg-warm-800">Technical Support</SelectItem>
                    <SelectItem value="sales" className="text-white focus:bg-warm-800">Sales & Partnerships</SelectItem>
                    <SelectItem value="feedback" className="text-white focus:bg-warm-800">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Field with Character Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact-message" className="text-white">Message *</Label>
                  <span className={`text-sm ${formData.message.length > 500 ? 'text-red-400' : 'text-white/60'}`}>
                    {formData.message.length}/500
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value.slice(0, 500) }))}
                  rows={5}
                  maxLength={500}
                  className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 p-3 resize-none focus:border-warm-400 focus:ring-2 focus:ring-warm-400/50 outline-none transition-all"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-warm-500 to-orange-500 hover:from-warm-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-warm-500/30 btn-shine disabled:opacity-70 disabled:cursor-not-allowed transition-all ripple-effect"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}

// Helper Components - Defined before Home for proper hoisting

// User icon helper
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

// Back to Top Button Component
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState<'enter' | 'exit' | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 500
      if (shouldShow !== isVisible) {
        if (shouldShow) {
          setIsAnimating('enter')
          setIsVisible(true)
        } else {
          setIsAnimating('exit')
          setTimeout(() => {
            setIsVisible(false)
            setIsAnimating(null)
          }, 300)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isVisible])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible && !isAnimating) return null

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 left-6 z-50 w-12 h-12 rounded-full gradient-bg text-white shadow-lg shadow-warm-300/30 flex items-center justify-center hover:shadow-xl hover:shadow-warm-400/40 transition-all duration-300 group ${
        isAnimating === 'enter' ? 'back-to-top-enter' : 
        isAnimating === 'exit' ? 'back-to-top-exit' : ''
      }`}
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-200" />
      
      {/* Tooltip */}
      <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Back to top
      </span>
    </button>
  )
}

// ============================================
// FEATURE 1: Quick Start Wizard Component
// ============================================
interface WizardStep {
  id: number
  title: string
  description: string
}

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Select Platform', description: 'Choose your social media platform' },
  { id: 2, title: 'Choose Service', description: 'Pick the service you need' },
  { id: 3, title: 'Enter URL', description: 'Provide your content URL' },
  { id: 4, title: 'Set Quantity', description: 'Set desired amount' },
  { id: 5, title: 'Launch', description: 'Review and start campaign' }
]

function QuickStartWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Form state
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube')
  const [service, setService] = useState('views')
  const [url, setUrl] = useState('')
  const [quantity, setQuantity] = useState(1000)

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' }
  ]

  const services = [
    { id: 'views', name: 'Video Views', icon: Eye, price: '$1 per 1K' },
    { id: 'likes', name: 'Likes', icon: Heart, price: '$2 per 1K' },
    { id: 'subscribers', name: 'Subscribers', icon: Users, price: '$5 per 1K' },
    { id: 'comments', name: 'Comments', icon: MessageCircle, price: '$10 per 1K' }
  ]

  const quantityOptions = [500, 1000, 2500, 5000, 10000, 25000]

  const nextStep = () => {
    if (currentStep < 5) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsTransitioning(false)
      }, 200)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(prev => prev - 1)
        setIsTransitioning(false)
      }, 200)
    }
  }

  const launchCampaign = () => {
    toast.success('🚀 Campaign Launched!', {
      description: `Your ${platform} ${service} campaign for ${quantity.toLocaleString()} units has started.`
    })
    setIsOpen(false)
    // Reset wizard
    setTimeout(() => {
      setCurrentStep(1)
      setPlatform('youtube')
      setService('views')
      setUrl('')
      setQuantity(1000)
    }, 300)
  }

  const selectedServiceData = services.find(s => s.id === service)

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg text-white shadow-lg shadow-warm-300/40 flex items-center justify-center hover:shadow-xl hover:shadow-warm-400/50 hover:scale-110 transition-all duration-300 group animate-bounce-subtle"
        aria-label="Quick Start Wizard"
      >
        <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        
        {/* Pulse ring effect */}
        <span className="absolute inset-0 rounded-full bg-warm-400 animate-ping opacity-30"></span>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Quick Launch ✨
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-scaleIn">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-warm-500 via-orange-400 to-warm-500 p-6 text-white">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.15%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Quick Start Wizard</h2>
                </div>
                <p className="text-white/80 text-sm">{wizardSteps[currentStep - 1].description}</p>
              </div>

              {/* Progress Steps */}
              <div className="relative mt-4 flex items-center justify-between">
                {wizardSteps.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                      currentStep >= step.id 
                        ? "bg-white text-warm-600 scale-105 shadow-lg" 
                        : "bg-white/25 text-white/70"
                    )}>
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {/* Connector Line */}
                    {idx < wizardSteps.length - 1 && (
                      <div className={cn(
                        "absolute top-4 h-0.5 transition-all duration-300",
                        currentStep > step.id + 1 ? "bg-white" : "bg-white/25"
                      )} style={{
                        left: `${((idx + 0.5) / wizardSteps.length) * 100}%`,
                        right: `${((wizardSteps.length - idx - 0.5) / wizardSteps.length) * 100}%`
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className={cn(
              "p-6 transition-all duration-200",
              isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            )}>
              {/* Step 1: Select Platform */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <Label className="text-base font-semibold">Choose Your Platform</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id as typeof platform)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all duration-300 group",
                          platform === p.id 
                            ? "border-warm-500 bg-warm-50 dark:bg-warm-950/30 shadow-md" 
                            : "border-border hover:border-warm-300 hover:bg-muted/50"
                        )}
                      >
                        <p.icon className={cn("w-8 h-8 mx-auto mb-2", 
                          platform === p.id ? "text-warm-600" : "text-muted-foreground group-hover:text-warm-500"
                        )} />
                        <span className={cn("font-medium",
                          platform === p.id ? "text-warm-700 dark:text-warm-300" : ""
                        )}>{p.name}</span>
                        {platform === p.id && (
                          <CheckCircle2 className="w-5 h-5 absolute top-2 right-2 text-warm-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Service */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <Label className="text-base font-semibold">Select a Service</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setService(s.id)}
                        className={cn(
                          "relative p-3 rounded-xl border-2 transition-all duration-300 text-left",
                          service === s.id 
                            ? "border-warm-500 bg-warm-50 dark:bg-warm-950/30 shadow-md" 
                            : "border-border hover:border-warm-300 hover:bg-muted/50"
                        )}
                      >
                        <s.icon className={cn("w-5 h-5 mb-1",
                          service === s.id ? "text-warm-600" : "text-muted-foreground"
                        )} />
                        <p className={cn("font-medium text-sm",
                          service === s.id ? "text-warm-700 dark:text-warm-300" : ""
                        )}>{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.price}</p>
                        {service === s.id && (
                          <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-warm-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Enter URL */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <Label className="text-base font-semibold">Your Content URL</Label>
                  <div className="relative">
                    <Input
                      type="url"
                      placeholder={`https://${platform}.com/...`}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                    <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {platform === 'youtube' && (
                    <p className="text-sm text-muted-foreground">
                      💡 Paste your YouTube video or channel URL
                    </p>
                  )}
                  {platform === 'instagram' && (
                    <p className="text-sm text-muted-foreground">
                      💡 Paste your Instagram post, reel, or profile URL
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Set Quantity */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <Label className="text-base font-semibold">How Many?</Label>
                  
                  {/* Quick select buttons */}
                  <div className="flex flex-wrap gap-2">
                    {quantityOptions.map(q => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={cn(
                          "px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200",
                          quantity === q 
                            ? "border-warm-500 bg-warm-500 text-white" 
                            : "border-border hover:border-warm-300"
                        )}
                      >
                        {(q >= 1000 ? `${q/1000}K` : q)}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div className="relative">
                    <Input
                      type="number"
                      min="100"
                      max="100000"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="pl-4 pr-16 h-12 text-base"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">units</span>
                  </div>

                  {/* Price estimate */}
                  <Card className="bg-gradient-to-r from-warm-50 to-orange-50 dark:from-warm-950/30 dark:to-orange-950/20 border-warm-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        <span className="text-xl font-bold text-warm-600">
                          ${((quantity / 1000) * (selectedServiceData?.id === 'views' ? 1 : selectedServiceData?.id === 'likes' ? 2 : selectedServiceData?.id === 'subscribers' ? 5 : 10)).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 5: Summary & Launch */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-3">
                      <Rocket className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold">Ready to Launch!</h3>
                    <p className="text-sm text-muted-foreground">Review your campaign settings</p>
                  </div>

                  <Card className="border-warm-200 bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Platform</span>
                        <span className="font-medium flex items-center gap-2">
                          {platform === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> : <Instagram className="w-4 h-4 text-pink-500" />}
                          {platform === 'youtube' ? 'YouTube' : 'Instagram'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Service</span>
                        <span className="font-medium capitalize">{selectedServiceData?.name || service}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">URL</span>
                        <span className="font-mono text-xs truncate max-w-[180px]" title={url}>
                          {url || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Quantity</span>
                        <span className="font-bold text-warm-600">{quantity.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                )}

                {currentStep < 5 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={(currentStep === 3 && !url) || (currentStep === 4 && quantity < 100)}
                    className="gradient-bg text-white border-0 gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={launchCampaign}
                    className="gradient-bg text-white border-0 gap-2 shadow-lg shadow-warm-300/30"
                  >
                    <Rocket className="w-4 h-4" /> Launch Campaign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Helper icon for link input
function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}

// ============================================
// FEATURE 2: Achievement Badges Component
// ============================================
interface AchievementBadge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  xpReward: number
  progress?: number
  category: 'campaigns' | 'engagement' | 'loyalty' | 'special'
}

const achievementBadges: AchievementBadge[] = [
  {
    id: 'first-campaign',
    title: 'First Campaign',
    description: 'Launch your first growth campaign',
    icon: <Rocket className="w-8 h-8" />,
    unlocked: true,
    xpReward: 100,
    progress: 100,
    category: 'campaigns'
  },
  {
    id: 'rising-star',
    title: 'Rising Star',
    description: 'Complete 10 successful campaigns',
    icon: <Star className="w-8 h-8" />,
    unlocked: true,
    xpReward: 500,
    progress: 100,
    category: 'campaigns'
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Use services on 3 different platforms',
    icon: <Sparkles className="w-8 h-8" />,
    unlocked: true,
    xpReward: 750,
    progress: 100,
    category: 'engagement'
  },
  {
    id: 'viral-champion',
    title: 'Viral Champion',
    description: 'Reach 1 million total engagements',
    icon: <Flame className="w-8 h-8" />,
    unlocked: false,
    xpReward: 2000,
    progress: 67,
    category: 'engagement'
  },
  {
    id: 'loyal-user',
    title: 'Loyal User',
    description: 'Active member for 30 days straight',
    icon: <Heart className="w-8 h-8" />,
    unlocked: false,
    xpReward: 1500,
    progress: 85,
    category: 'loyalty'
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Spend 10,000 credits in total',
    icon: <Zap className="w-8 h-8" />,
    unlocked: false,
    xpReward: 3000,
    progress: 42,
    category: 'loyalty'
  },
  {
    id: 'influencer',
    title: 'Influencer Elite',
    description: 'Refer 5 friends who sign up',
    icon: <Crown className="w-8 h-8" />,
    unlocked: false,
    xpReward: 2500,
    progress: 20,
    category: 'special'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Join during our beta launch period',
    icon: <Award className="w-8 h-8" />,
    unlocked: true,
    xpReward: 1000,
    progress: 100,
    category: 'special'
  }
]

function AchievementBadges() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  const userXP = achievementBadges
    .filter(b => b.unlocked)
    .reduce((sum, b) => sum + b.xpReward, 0)
  
  const nextLevelXP = 5000
  const levelProgress = Math.min((userXP / nextLevelXP) * 100, 100)
  const currentLevel = Math.floor(userXP / 1000) + 1

  const getCategoryColor = (category: AchievementBadge['category']) => {
    switch (category) {
      case 'campaigns': return 'from-blue-500 to-cyan-500'
      case 'engagement': return 'from-purple-500 to-pink-500'
      case 'loyalty': return 'from-amber-500 to-orange-500'
      case 'special': return 'from-emerald-500 to-teal-500'
      default: return 'from-gray-500 to-gray-400'
    }
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-warm-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
            <Trophy className="w-4 h-4 mr-2" />
            Gamification System
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Your <span className="gradient-text">Achievement Badges</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlock badges as you grow your social presence. Each badge rewards you with XP!
          </p>
        </div>

        {/* XP Progress Bar */}
        <Card className="max-w-2xl mx-auto mb-12 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-500 to-orange-500 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Level {currentLevel}</p>
                  <p className="text-sm text-slate-400">Growth Master</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-warm-400">{userXP.toLocaleString()} XP</p>
                <p className="text-xs text-slate-400">of {nextLevelXP.toLocaleString()} XP</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-warm-500 via-orange-400 to-warm-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-shimmer"></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">
              {(nextLevelXP - userXP).toLocaleString()} XP until next level
            </p>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievementBadges.map((badge) => (
            <Card 
              key={badge.id}
              onMouseEnter={() => setHoveredId(badge.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer group",
                badge.unlocked 
                  ? "border-transparent bg-white shadow-lg hover:shadow-xl hover:-translate-y-1" 
                  : "border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/50",
                hoveredId === badge.id && "ring-2 ring-warm-400 ring-offset-2"
              )}
            >
              {/* Glow effect for unlocked badges */}
              {badge.unlocked && (
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  "bg-gradient-to-br bg-opacity-10",
                  getCategoryColor(badge.category)
                )}></div>
              )}

              <CardContent className="p-6 relative">
                {/* Badge Icon Container */}
                <div className={cn(
                  "w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300",
                  badge.unlocked 
                    ? cn("bg-gradient-to-br text-white shadow-lg group-hover:scale-110", getCategoryColor(badge.category))
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                )}>
                  {badge.unlocked ? badge.icon : <Lock className="w-8 h-8" />}
                </div>

                {/* Status indicator */}
                {badge.unlocked && (
                  <div className="absolute top-3 right-3">
                    <BadgeCheck className="w-5 h-5 text-green-500" />
                  </div>
                )}

                {!badge.unlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                )}

                {/* Badge Info */}
                <div className="text-center">
                  <h3 className={cn(
                    "font-bold mb-1 transition-colors",
                    badge.unlocked ? "text-foreground" : "text-slate-500"
                  )}>
                    {badge.title}
                  </h3>
                  <p className={cn(
                    "text-sm mb-3",
                    badge.unlocked ? "text-muted-foreground" : "text-slate-400"
                  )}>
                    {badge.description}
                  </p>

                  {/* Progress bar for locked badges with partial progress */}
                  {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                    <div className="mb-2">
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    badge.unlocked 
                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    <Zap className="w-3 h-3" />
                    +{badge.xpReward.toLocaleString()} XP
                  </div>
                </div>

                {/* Hover overlay showing more details */}
                {hoveredId === badge.id && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-lg">
                    <p className="text-white text-xs text-center">
                      {badge.unlocked ? '✨ Unlocked!' : `Keep going! ${badge.progress}% complete`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {[
            { label: 'Unlocked', value: `${achievementBadges.filter(b => b.unlocked).length}/${achievementBadges.length}`, icon: Award },
            { label: 'Total XP Earned', value: userXP.toLocaleString(), icon: Zap },
            { label: 'Next Reward', value: '850 XP', icon: Gift }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-muted/50">
              <stat.icon className="w-5 h-5 text-warm-500" />
              <div>
                <p className="font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// FEATURE 3: Live Activity Feed Component
// ============================================
interface ActivityItem {
  id: string
  user: string
  avatar: string
  action: string
  type: 'campaign' | 'earning' | 'milestone' | 'referral'
  timestamp: Date
}

const generateMockActivities = (): ActivityItem[] => {
  const names = ['John D.', 'Sarah M.', 'Mike R.', 'Emma L.', 'Alex K.', 'Lisa T.', 'David P.', 'Nina S.', 'Chris B.', 'Anna W.']
  const actions = [
    { action: 'started a YouTube Views campaign', type: 'campaign' as const },
    { action: 'earned 500 credits', type: 'earning' as const },
    { action: 'unlocked "Rising Star" badge', type: 'milestone' as const },
    { action: 'launched Instagram followers boost', type: 'campaign' as const },
    { action: 'reached 10K milestone!', type: 'milestone' as const },
    { action: 'referred a new friend (+200 XP)', type: 'referral' as const },
    { action: 'completed their first campaign', type: 'milestone' as const },
    { action: 'bought premium package', type: 'earning' as const }
  ]
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `activity-${i}`,
    user: names[i % names.length],
    avatar: names[i % names.length][0],
    action: actions[i % actions.length].action,
    type: actions[i % actions.length].type,
    timestamp: new Date(Date.now() - (i * 120000)) // Every 2 minutes ago
  }))
}

function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(generateMockActivities())
  const [isPaused, setIsPaused] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)

  // Simulate new activities coming in
  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      const newActivities = [...activities]
      const randomNames = ['James H.', 'Sophie K.', 'Ryan L.', 'Mia C.', 'Tom W.', 'Grace F.']
      const randomActions = [
        { action: 'started a new campaign', type: 'campaign' as const },
        { action: 'just joined SocialBoost!', type: 'milestone' as const },
        { action: 'earned bonus credits', type: 'earning' as const },
        { action: 'upgraded to Pro plan', type: 'earning' as const }
      ]
      const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)]
      
      const newActivity: ActivityItem = {
        id: `activity-${Date.now()}`,
        user: randomNames[Math.floor(Math.random() * randomNames.length)],
        avatar: randomNames[Math.floor(Math.random() * randomNames.length)][0],
        action: randomAction.action,
        type: randomAction.type,
        timestamp: new Date()
      }
      
      setActivities([newActivity, ...newActivities.slice(0, 9)])
    }, 8000) // New activity every 8 seconds

    return () => clearInterval(interval)
  }, [isPaused])

  const formatTimestamp = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getActivityTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
      case 'earning': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
      case 'milestone': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
      case 'referral': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAvatarGradient = (initial: string): string => {
    const gradients = [
      'from-red-400 to-pink-500',
      'from-blue-400 to-indigo-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-violet-500',
      'from-cyan-400 to-blue-500',
    ]
    const index = initial.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div 
      ref={feedRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      {/* Feed Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 block rounded-full bg-green-500 animate-pulse"></span>
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50"></span>
          </div>
          <span className="font-semibold text-sm">Live Activity</span>
          <Badge variant="secondary" className="text-xs px-2 py-0">Real-time</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isPaused ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPaused ? 'Paused' : 'Live'}
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
        <div className="divide-y">
          {activities.map((activity, idx) => (
            <div 
              key={activity.id}
              className={cn(
                "flex items-start gap-3 p-3 transition-all duration-300 hover:bg-muted/30",
                idx === 0 && "animate-slideInRight"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
                getAvatarGradient(activity.avatar)
              )}>
                {activity.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-foreground">{activity.user}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getActivityTypeColor(activity.type))}>
                    {activity.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t bg-muted/20 text-center">
        <button className="text-xs text-warm-600 hover:text-warm-700 font-medium flex items-center justify-center gap-1 w-full transition-colors">
          <ExternalLink className="w-3 h-3" />
          View All Activity
        </button>
      </div>
    </div>
  )
}

// ============================================
// FEATURE 4: Platform Statistics Widget
// ============================================
interface MetricData {
  label: string
  value: number
  suffix?: string
  targetValue: number
  color: string
  sparklineData: number[]
}

const initialMetrics: MetricData[] = [
  { label: 'Delivery Rate', value: 98.7, suffix: '%', targetValue: 99.5, color: 'from-green-500 to-emerald-400', sparklineData: [95, 96, 97, 97.5, 98, 98.2, 98.7] },
  { label: 'Satisfaction', value: 99.2, suffix: '%', targetValue: 100, color: 'from-amber-500 to-orange-400', sparklineData: [97, 98, 98.5, 98.8, 99, 99.1, 99.2] },
  { label: 'Uptime', value: 99.9, suffix: '%', targetValue: 100, color: 'from-blue-500 to-cyan-400', sparklineData: [99.5, 99.6, 99.7, 99.8, 99.85, 99.88, 99.9] },
  { label: 'Avg Response', value: 2.4, suffix: 'min', targetValue: 1, color: 'from-purple-500 to-violet-400', sparklineData: [5, 4.5, 3.8, 3.2, 2.8, 2.6, 2.4] }
]

function PlatformStatsWidget() {
  const [metrics, setMetrics] = useState<MetricData[]>(initialMetrics)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState<number[]>(metrics.map(() => 0))
  const widgetRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (widgetRef.current) {
      observer.observe(widgetRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  // Animate counters when visible
  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      
      const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic

      setAnimatedValues(metrics.map(metric => metric.value * eased))

      if (step >= steps) {
        clearInterval(timer)
        setAnimatedValues(metrics.map(m => m.value))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  // Circular progress component
  const CircularProgress = ({ 
    value, 
    maxValue = 100, 
    size = 120, 
    strokeWidth = 8, 
    color 
  }: { 
    value: number; 
    maxValue?: number; 
    size?: number; 
    strokeWidth?: number; 
    color: string 
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - ((value / maxValue) * circumference)

    return (
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.includes('green') ? '#22c55e' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#a855f7'} />
            <stop offset="100%" stopColor={color.includes('green') ? '#10b981' : color.includes('amber') ? '#f97316' : color.includes('blue') ? '#06b6d4' : '#8b5cf6'} />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // Mini sparkline chart using CSS
  const SparklineChart = ({ data, color }: { data: number[]; color: string }) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const points = data.map((val, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((val - min) / range) * 100
    }))
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaD = `${pathD} L${points[points.length - 1].x},100 L0,100 Z`

    return (
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-8">
        <defs>
          <linearGradient id={`area-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.includes('green') ? '#22c55e' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#a855f7'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color.includes('green') ? '#22c55e' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#a855f7'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#area-${color})`} />
        <path d={pathD} fill="none" stroke={color.includes('green') ? '#22c55e' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#a855f7'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <div ref={widgetRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric, idx) => (
        <Card 
          key={metric.label} 
          className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
        >
          {/* Background gradient on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
            metric.color
          )}></div>
          
          <CardContent className="p-5 md:p-6 relative">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-4">
              <CircularProgress 
                value={animatedValues[idx]} 
                size={128} 
                strokeWidth={8}
                color={metric.color}
              />
              
              {/* Value display in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn(
                  "text-2xl md:text-3xl font-bold tabular-nums",
                  metric.color.includes('green') ? 'text-green-500' :
                  metric.color.includes('amber') ? 'text-amber-500' :
                  metric.color.includes('blue') ? 'text-blue-500' :
                  'text-purple-500'
                )}>
                  {animatedValues[idx].toFixed(metric.suffix === '%' ? 1 : 1)}
                  {metric.suffix}
                </span>
              </div>
            </div>

            {/* Label */}
            <h3 className="text-center font-semibold text-foreground mb-1">{metric.label}</h3>
            
            {/* Sparkline Chart */}
            <SparklineChart data={metric.sparklineData} color={metric.color} />

            {/* Target indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Goal: {metric.targetValue}{metric.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// EARN CREDITS PANEL - Real-time Task Exchange Engine Integration
// ============================================================================

interface EarnCreditsProps {
  user: { id?: string; name: string; email: string; credits: number }
  authToken: string | null
  onCreditsUpdate: (credits: number) => void
}

function EarnCreditsPanel({ user, authToken, onCreditsUpdate }: EarnCreditsProps) {
  // Use any type for socket to avoid SSR import issues with socket.io-client
  const socketRef = useRef<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [queueStats, setQueueStats] = useState<any>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  
  // Engine stats
  const [engineOnline, setEngineOnline] = useState(0)
  const [tasksInQueue, setTasksInQueue] = useState(0)
  
  // Reconnection state
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxReconnectAttempts = 5
  const baseReconnectDelay = 1000 // 1 second

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
    const delay = Math.min(baseReconnectDelay * Math.pow(2, attempt), 16000)
    // Add jitter (±25%)
    return delay + Math.random() * delay * 0.5
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempt >= maxReconnectAttempts) {
      console.log('[EarnCredits] Max reconnect attempts reached')
      setIsReconnecting(false)
      toast.error('Connection failed. Please refresh the page to retry.', {
        duration: 5000
      })
      return
    }

    const delay = getReconnectDelay(reconnectAttempt)
    console.log(`[EarnCredits] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`)
    setIsReconnecting(true)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!user.id) return
      
      import('socket.io-client').then((module) => {
        const io = module.io
        
        const newSocket = io('/', {
          query: { XTransformPort: '3003' },
          transports: ['websocket', 'polling'],
          reconnection: false // We handle reconnection manually
        })

        newSocket.on('connect', () => {
          console.log('[EarnCredits] Reconnected successfully!')
          setIsConnected(true)
          setIsReconnecting(false)
          setReconnectAttempt(0)
          
          // Re-register as worker with auth token
          newSocket.emit('worker:register', { 
            userId: user.id, 
            token: authToken // Pass auth token for WebSocket authentication
          })
          
          toast.success('Reconnected to task engine!', {
            description: 'You can continue earning credits'
          })
          
          socketRef.current = newSocket
          setupSocketHandlers(newSocket)
        })

        newSocket.on('connect_error', (error: any) => {
          console.error('[EarnCredits] Reconnect error:', error.message)
          setReconnectAttempt(prev => prev + 1)
          attemptReconnect()
        })

        newSocket.on('disconnect', () => {
          console.log('[EarnCredits] Disconnected after reconnect')
          setIsConnected(false)
        })
        
        socketRef.current = newSocket
      })
    }, delay)
  }, [reconnectAttempt, user.id])

  /**
   * Setup all socket event handlers (unified for initial connect and reconnect)
   */
  const setupSocketHandlers = useCallback((socket: any) => {
    // Handle registration success
    socket.on('worker:registered', (data: any) => {
      if (data.success) {
        setQueueStats(data.stats)
      }
    })

    // Handle task assignment
    socket.on('task:assigned', (task: any) => {
      console.log('[EarnCredits] Task assigned:', task)
      setCurrentTask(task)
      setIsWorking(true)
      setTaskStartTime(new Date())
      setElapsedTime(0)
      setVerificationCode(task.verificationCode || '')
      toast.info('New task assigned!', {
        description: `${task.platform}/${task.serviceType} - +${task.rewardCredits} credits`
      })
    })

    // Handle task completion
    socket.on('task:completed', (data: any) => {
      console.log('[EarnCredits] Task completed:', data)
      setIsWorking(false)
      setCurrentTask(null)
      setTaskStartTime(null)
      setElapsedTime(0)
      setTasksCompleted(prev => prev + 1)
      setTotalEarned(prev => prev + (data.creditsEarned || 1))
      onCreditsUpdate(user.credits + (data.creditsEarned || 1))
      
      // Add to recent activity
      setRecentActivity(prev => [{
        type: 'completed',
        credits: data.creditsEarned || 1,
        timestamp: new Date(),
        message: data.message || 'Task completed!'
      }, ...prev.slice(0, 9)])
      
      toast.success(data.message || 'Task completed! Credits earned!')
    })

    // Handle empty queue
    socket.on('task:empty', (data: any) => {
      toast.info(data.message || 'No tasks available right now')
    })

    // Handle errors
    socket.on('error', (error: any) => {
      console.error('[EarnCredits] Error:', error)
      
      // Provide user-friendly messages for auth-related errors
      if (error.code === 'TOKEN_REQUIRED' || error.code === 'AUTH_FAILED' || 
          error.code === 'INVALID_TOKEN_FORMAT' || error.code === 'AUTH_TIMEOUT') {
        toast.error('Authentication required', {
          description: 'Please login again to connect to the task engine.',
          duration: 5000
        })
        // Trigger logout for auth failures
        setTimeout(() => window.location.reload(), 2000)
        return
      }
      
      if (error.code === 'AUTH_MISMATCH') {
        toast.error('Session conflict detected', {
          description: 'Please login again.',
          duration: 5000
        })
        return
      }
      
      toast.error(error.message || 'An error occurred')
    })
    
    // Handle warnings from engine (stale connection etc.)
    socket.on('warning', (warning: any) => {
      console.warn('[EarnCredits] Warning:', warning)
      toast.warning(warning.message || 'Connection warning', {
        duration: 4000
      })
    })

    // Handle queue updates
    socket.on('stats:online', (data: any) => {
      setEngineOnline(data.count)
    })

    socket.on('stats:update', (data: any) => {
      setTasksInQueue(data.queueLength || 0)
    })

    socket.on('task:available', (data: any) => {
      setTasksInQueue(data.queueLength || 0)
    })
    
    // Handle disconnect
    socket.on('disconnect', (reason: string) => {
      console.log('[EarnCredits] Disconnected from engine:', reason)
      setIsConnected(false)
      setIsWorking(false)
      setCurrentTask(null)
      
      // Only auto-reconnect if not intentional
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setReconnectAttempt(prev => prev + 1)
        attemptReconnect()
      }
    })
  }, [user.credits, onCreditsUpdate, attemptReconnect])

  // Initialize Socket.io connection (dynamically import to avoid SSR issues)
  useEffect(() => {
    if (!user.id) return

    // Dynamic import of socket.io-client for client-side only
    import('socket.io-client').then((module) => {
      const io = module.io
      
      const newSocket = io('/', {
        query: { XTransformPort: '3003' },
        transports: ['websocket', 'polling'],
        reconnection: false, // We handle reconnection manually for better control
        timeout: 10000 // 10s connection timeout
      })

      newSocket.on('connect', () => {
        console.log('[EarnCredits] Connected to engine')
        setIsConnected(true)
        setReconnectAttempt(0)
        setIsReconnecting(false)
        
        // Register as worker with auth token (required by engine v1.2+)
        newSocket.emit('worker:register', { 
          userId: user.id, 
          token: authToken // Pass auth token for WebSocket authentication
        })
      })

      newSocket.on('connect_error', (error: any) => {
        console.error('[EarnCredits] Connection error:', error.message)
        setIsConnected(false)
        
        // Start reconnect attempts
        setReconnectAttempt(prev => prev + 1)
        attemptReconnect()
      })

      // Setup all other handlers
      setupSocketHandlers(newSocket)

      socketRef.current = newSocket

      // Store cleanup function reference
      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        newSocket.disconnect()
        socketRef.current = null
      }
    }).catch((err) => {
      console.error('[EarnCredits] Failed to load socket.io-client:', err)
    })
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user.id])

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorking && taskStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - taskStartTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorking, taskStartTime])

  // Request a new task
  const handleRequestTask = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !isConnected || !user.id) {
      toast.error('Not connected to engine')
      return
    }
    
    if (isWorking) {
      toast.error('Complete current task first')
      return
    }

    socket.emit('task:request', { 
      userId: user.id,
      platform: selectedPlatform !== 'all' ? selectedPlatform : undefined
    })
  }, [isConnected, isWorking, user.id, selectedPlatform])

  // Complete current task
  const handleCompleteTask = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !currentTask || !user.id) return
    
    socket.emit('task:complete', {
      userId: user.id,
      taskId: currentTask.id,
      timeSpentMs: elapsedTime * 1000
    })
  }, [currentTask, user.id, elapsedTime])

  // Abandon current task
  const handleAbandonTask = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !currentTask || !user.id) return
    
    socket.emit('task:abandon', {
      userId: user.id,
      taskId: currentTask.id
    })
    
    setIsWorking(false)
    setCurrentTask(null)
    setTaskStartTime(null)
    toast.info('Task abandoned')
  }, [currentTask, user.id])

  // Get queue info
  const handleGetQueueInfo = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !isConnected) return
    socket.emit('queue:info')
  }, [isConnected])

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Platform icons
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />
      case 'tiktok': return <Radio className="w-5 h-5 text-black dark:text-white" />
      case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />
      default: return <Globe className="w-5 h-5 text-gray-500" />
    }
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'views': return <Eye className="w-4 h-4" />
      case 'likes': return <Heart className="w-4 h-4" />
      case 'followers': case 'subscribers': return <Users className="w-4 h-4" />
      case 'comments': return <MessageCircle className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connection Status */}
        <Card className={`border-0 shadow-sm ${isConnected ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engine Status</p>
                <p className={`text-lg font-bold ${isConnected ? 'text-green-600' : isReconnecting ? 'text-amber-500' : 'text-red-500'}`}>
                  {isConnected ? 'Connected' : isReconnecting ? `Reconnecting... (${reconnectAttempt}/${maxReconnectAttempts})` : 'Disconnected'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100' : isReconnecting ? 'bg-amber-100 animate-pulse' : 'bg-red-100'}`}>
                {isReconnecting ? (
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                ) : (
                  <Wifi className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-red-500'}`} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Workers */}
        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workers Online</p>
                <p className="text-lg font-bold">{engineOnline || '-'}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks in Queue */}
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Available</p>
                <p className="text-lg font-bold">{tasksInQueue || queueStats?.queueLength || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Earnings */}
        <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Session Earnings</p>
                <p className="text-lg font-bold text-green-600">+{totalEarned}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Coins className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Work Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Task Card */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-warm-500 to-warm-600 text-white pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ZapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {isWorking ? 'Current Task' : 'Ready to Work'}
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {isWorking 
                        ? 'Complete the task below to earn credits'
                        : 'Click "Get Task" to start earning credits'
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  {isWorking && (
                    <div className="text-2xl font-mono font-bold">{formatTime(elapsedTime)}</div>
                  )}
                  <Badge variant="secondary" className={cn(
                    "mt-1",
                    isWorking ? "bg-green-500/20 text-green-200" : "bg-gray-500/20 text-gray-200"
                  )}>
                    {isWorking ? 'In Progress' : 'Idle'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {!isWorking ? (
                /* Idle State */
                <div className="text-center py-8 space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center">
                    <Power className="w-12 h-12 text-warm-500" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Earn Credits</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Complete social media engagement tasks to earn free credits. 
                      Watch videos, like posts, follow accounts - each task rewards you with credits!
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Platforms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="youtube">YouTube Only</SelectItem>
                        <SelectItem value="instagram">Instagram Only</SelectItem>
                        <SelectItem value="tiktok">TikTok Only</SelectItem>
                        <SelectItem value="twitter">Twitter Only</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleRequestTask}
                      disabled={!isConnected}
                      size="lg"
                      className="gradient-bg text-white gap-2 px-8"
                    >
                      <ZapIcon className="w-5 h-5" />
                      Get Task
                    </Button>
                  </div>

                  {!isConnected && (
                    <p className="text-sm text-red-500 flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Connecting to engine...
                    </p>
                  )}
                </div>
              ) : (
                /* Working State */
                <div className="space-y-6">
                  {/* Task Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" /> Platform
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        {getPlatformIcon(currentTask?.platform)}
                        <span className="capitalize">{currentTask?.platform}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" /> Task Type
                      </div>
                      <div className="flex items-center gap-2 font-semibold capitalize">
                        {getServiceIcon(currentTask?.serviceType)}
                        {currentTask?.serviceType?.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg space-y-2 col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <Coins className="w-4 h-4" /> Reward
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            +{currentTask?.rewardCredits || 1} Credits
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-700">Verification Code</div>
                          <div className="font-mono text-lg font-bold tracking-wider text-green-800 bg-white px-3 py-1 rounded">
                            {verificationCode || '----'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target URL */}
                  <div className="space-y-2">
                    <Label>Target URL</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <code className="text-sm flex-1 truncate">{currentTask?.targetUrl}</code>
                      <Button variant="outline" size="sm" asChild>
                        <a href={currentTask?.targetUrl} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                      onClick={handleCompleteTask}
                      size="lg"
                      className="flex-1 gradient-bg text-white gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete & Earn Credits
                    </Button>
                    
                    <Button 
                      onClick={handleAbandonTask}
                      variant="outline"
                      size="lg"
                      className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                      Skip
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Click "Complete" after you've engaged with the content. The system will verify your action.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Session Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No activity yet. Start completing tasks!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'completed' 
                          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                          : <Clock className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">
                        +{activity.credits}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Info */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, title: 'Get a Task', desc: 'Click "Get Task" to receive an available task', icon: <ZapIcon className="w-5 h-5" /> },
                { step: 2, title: 'Complete Action', desc: 'Engage with the content (watch, like, follow)', icon: <ExternalLink className="w-5 h-5" /> },
                { step: 3, title: 'Earn Credits', desc: 'Receive instant credits upon verification', icon: <Coins className="w-5 h-5" /> },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0 text-warm-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Your Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Tasks Completed</span>
                <span className="font-bold text-lg">{tasksCompleted}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Total Earned</span>
                <span className="font-bold text-lg text-green-600">+{totalEarned} 🪙</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Current Balance</span>
                <span className="font-bold text-lg text-blue-600">{user.credits} 🪙</span>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleGetQueueInfo}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Queue Info
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-warm-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-warm-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-warm-800">Pro Tip</p>
                  <p className="text-xs text-warm-700 mt-1">
                    Stay active and complete tasks quickly for bonus multipliers! 
                    The faster you work, the more you earn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if there's a saved session on initial render
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('socialboost_auth_token')
    }
    return false
  })
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize user from localStorage (only runs once during initial render)
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('socialboost_user')
      if (savedUser) {
        try {
          return JSON.parse(savedUser)
        } catch {
          return { name: '', email: '' }
        }
      }
    }
    return { name: '', email: '' }
  })
  const [authToken, setAuthToken] = useState<string | null>(() => {
    // Initialize from localStorage (only runs once during initial render)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('socialboost_auth_token')
    }
    return null
  })
  
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
        // Store auth token for WebSocket authentication
        if (data.token) {
          setAuthToken(data.token)
          localStorage.setItem('socialboost_auth_token', data.token)
          localStorage.setItem('socialboost_user', JSON.stringify({ name, email }))
        }
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
        // Store auth token for WebSocket authentication
        if (data.token) {
          setAuthToken(data.token)
          localStorage.setItem('socialboost_auth_token', data.token)
          localStorage.setItem('socialboost_user', JSON.stringify({ 
            name: data.user.name || data.user.email.split('@')[0], 
            email: data.user.email 
          }))
        }
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
    setAuthToken(null)
    localStorage.removeItem('socialboost_auth_token')
    localStorage.removeItem('socialboost_user')
    toast.success('Logged out successfully')
  }, [])

  // If logged in, show Dashboard
  if (isLoggedIn) {
    return <Dashboard user={currentUser} onLogout={handleLogout} authToken={authToken} />
  }

  // Otherwise, show Landing Page

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm glass-header">
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
              <NotificationBellDropdown />
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

      {/* Enhanced Magic Numbers / Metrics Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-y border-warm-500/20">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Particle pattern background */}
        <div className="absolute inset-0 particle-bg opacity-30"></div>
        
        {/* Gradient borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-warm-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-warm-500 to-transparent"></div>
        
        {/* Decorative glow orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-warm-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-900/50 text-warm-200 border-warm-700/50">
              <TrendingUp className="w-3 h-3 mr-1" />
              Our Impact
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Numbers That{' '}
              <span className="text-glow">Speak Volumes</span>
            </h2>
            <p className="text-lg text-gray-400">
              Track our real-time impact on creators worldwide
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { value: 50, suffix: 'M+', label: 'Views Delivered', icon: Eye, description: 'Across all platforms' },
              { value: 250, suffix: 'K+', label: 'Happy Users', icon: Heart, description: 'Active creators' },
              { value: 99.9, suffix: '%', label: 'Uptime Guarantee', icon: Shield, description: '99.9% reliability' },
              { value: 150, suffix: '+', label: 'Countries Served', icon: Globe, description: 'Global reach' }
            ].map((metric, index) => (
              <MagicNumberCard 
                key={index}
                value={metric.value}
                suffix={metric.suffix}
                label={metric.label}
                icon={metric.icon}
                description={metric.description}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-12 border-t border-white/10">
            {[
              { icon: ShieldCheck, text: 'SOC 2 Compliant' },
              { icon: Lock, text: '256-bit Encryption' },
              { icon: BadgeCheck, text: 'GDPR Ready' },
              { icon: HeadphonesIcon, text: '24/7 Support' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                <item.icon className="w-5 h-5 text-green-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Ticker */}
      <LiveActivityTicker />

      {/* Platform Statistics Widget - NEW FEATURE */}
      <section className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200">
              <Activity className="w-4 h-4 mr-1" />
              Real-time Metrics
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Platform <span className="gradient-text">Statistics</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Monitor our platform performance in real-time with live metrics
            </p>
          </div>

          <PlatformStatsWidget />

          {/* Live Activity Feed - NEW FEATURE */}
          <div className="mt-16 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rss className="w-5 h-5 text-warm-500" />
              <h3 className="font-semibold text-lg">Live Community Feed</h3>
            </div>
            <LiveActivityFeed />
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

      {/* How It Works Section - Enhanced */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              <Zap className="w-3 h-3 mr-1" />
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Start growing your social media in just 3 simple steps
            </p>

            {/* Watch Demo Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-warm-300 text-warm-700 hover:bg-warm-50 hover:border-warm-400"
                >
                  <PlayCircle className="w-4 h-4" />
                  Watch Demo Video
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent">
                <div className="video-overlay aspect-video flex items-center justify-center rounded-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95"></div>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.3) 0%, transparent 70%)' }}></div>
                  
                  {/* Play Button */}
                  <div className="relative z-10 text-center">
                    <button className="group cursor-pointer focus:outline-none">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-warm-500 transition-all duration-300 group-hover:scale-110 shadow-2xl">
                        <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-white font-medium text-lg">Click to Play Demo</p>
                      <p className="text-white/60 text-sm mt-2">See SocialBoost in action</p>
                    </button>
                  </div>

                  {/* Close Button */}
                  <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              {/* Animated dashed connection line (desktop only) */}
              <div className="hidden md:block absolute top-[72px] left-[16%] right-[16%] h-0.5 dashed-line-animate"></div>

              {/* Step 1 */}
              <div className="text-center relative group card-3d">
                {/* Pulse ring container */}
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full gradient-bg pulse-ring text-warm-500"></div>
                  <div className="relative z-10 w-32 h-32 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center float-slow">
                      <div className="text-4xl font-black">01</div>
                      <UserIcon className="w-8 h-8 mx-auto mt-1 animate-float" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-warm-200 opacity-15 group-hover:opacity-30 transition-opacity"></div>
                
                <h3 className="text-xl font-semibold mb-3">Create Account</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sign up for free and receive <span className="text-warm-600 font-semibold">500 bonus credits</span> to start your first campaign instantly.
                </p>
                <a href="#" className="inline-flex items-center gap-1 mt-4 text-sm text-warm-600 hover:text-warm-700 font-medium group/link transition-colors">
                  Learn more 
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Step 2 */}
              <div className="text-center relative group card-3d">
                {/* Pulse ring container */}
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full gradient-bg pulse-ring text-warm-500" style={{ animationDelay: '0.7s' }}></div>
                  <div className="relative z-10 w-32 h-32 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center float-slow" style={{ animationDelay: '0.3s' }}>
                      <div className="text-4xl font-black">02</div>
                      <Target className="w-8 h-8 mx-auto mt-1 animate-float" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-warm-200 opacity-15 group-hover:opacity-30 transition-opacity"></div>
                
                <h3 className="text-xl font-semibold mb-3">Create Campaign</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Add your video or profile URL, choose your target audience, and configure delivery settings.
                </p>
                <a href="#" className="inline-flex items-center gap-1 mt-4 text-sm text-warm-600 hover:text-warm-700 font-medium group/link transition-colors">
                  Learn more 
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Step 3 */}
              <div className="text-center relative group card-3d">
                {/* Pulse ring container */}
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full gradient-bg pulse-ring text-warm-500" style={{ animationDelay: '1.4s' }}></div>
                  <div className="relative z-10 w-32 h-32 rounded-full gradient-bg flex items-center justify-center text-white shadow-xl shadow-warm-200 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-center float-slow" style={{ animationDelay: '0.6s' }}>
                      <div className="text-4xl font-black">03</div>
                      <TrendingUp className="w-8 h-8 mx-auto mt-1 animate-float" style={{ animationDelay: '0.6s' }} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-warm-200 opacity-15 group-hover:opacity-30 transition-opacity"></div>
                
                <h3 className="text-xl font-semibold mb-3">Watch Growth</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sit back as real users engage with your content. Watch your metrics soar!
                </p>
                <a href="#" className="inline-flex items-center gap-1 mt-4 text-sm text-warm-600 hover:text-warm-700 font-medium group/link transition-colors">
                  Learn more 
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
              <Button 
                size="lg" 
                className="gradient-bg text-white border-0 hover:opacity-90 px-8 shadow-lg shadow-warm-200 hover:shadow-warm-300 transition-shadow"
                onClick={() => setIsSignUpOpen(true)}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Now - It's Free
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="gap-2 border-2 border-dashed border-warm-300 text-warm-700 hover:border-solid hover:bg-warm-50"
                  >
                    <Video className="w-5 h-5" />
                    See Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent">
                  <div className="video-overlay aspect-video flex items-center justify-center rounded-xl relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95"></div>
                    
                    <div className="relative z-10 text-center">
                      <button className="group cursor-pointer focus:outline-none">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-warm-500 transition-all duration-300 group-hover:scale-110 shadow-2xl">
                          <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-white font-medium text-lg">Click to Play Demo</p>
                        <p className="text-white/60 text-sm mt-2">See SocialBoost in action</p>
                      </button>
                    </div>

                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
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

      {/* ============================================
          ROUND 8: INTERACTIVE PRICING CALCULATOR
          ============================================ */}
      <PricingCalculator onSignUp={() => setIsSignUpOpen(true)} />

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

      {/* Competitor Comparison Table Section */}
      <section id="comparison" className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              <BarChart3 className="w-3 h-3 mr-1" />
              Compare & Decide
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose SocialBoost{' '}
              <span className="gradient-text">Over Others?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how we stack up against the competition. The choice is clear!
            </p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-xl">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                  <th className="p-4 md:p-6 text-left font-semibold min-w-[180px]">Feature</th>
                  <th className="p-4 md:p-6 text-center relative bg-gradient-to-br from-warm-500 to-orange-600">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-lg">SocialBoost</span>
                      <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs font-bold animate-pulse-glow">
                        ★ Best Value
                      </Badge>
                    </div>
                  </th>
                  <th className="p-4 md:p-6 text-center font-semibold text-gray-300">ViewGrip</th>
                  <th className="p-4 md:p-6 text-center font-semibold text-gray-300">SMMPanel</th>
                  <th className="p-4 md:p-6 text-center font-semibold text-gray-300">BoostHill</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Real Users (Not Bots)', socialboost: true, viewgrip: false, smmpanel: false, boosthill: true },
                  { feature: 'Free Credits to Start', socialboost: true, viewgrip: true, smmpanel: false, boosthill: false },
                  { feature: 'YouTube + Instagram', socialboost: true, viewgrip: true, smmpanel: true, boosthill: false },
                  { feature: 'Geo-Targeting', socialboost: true, viewgrip: false, smmpanel: false, boosthill: true },
                  { feature: '24/7 Support', socialboost: true, viewgrip: false, smmpanel: true, boosthill: false },
                  { feature: 'Referral Program', socialboost: true, viewgrip: false, smmpanel: false, boosthill: false },
                  { feature: 'Dashboard Analytics', socialboost: true, viewgrip: false, smmpanel: true, boosthill: false },
                  { feature: 'API Access', socialboost: true, viewgrip: false, smmpanel: true, boosthill: false }
                ].map((row, index) => (
                  <tr 
                    key={index} 
                    className={`comparison-row border-b border-border/50 ${
                      index % 2 === 0 ? 'bg-card' : 'bg-background'
                    }`}
                  >
                    <td className="p-4 md:p-5 font-medium">{row.feature}</td>
                    <td className="p-4 md:p-5 text-center bg-warm-50/50 dark:bg-warm-900/10">
                      {row.socialboost && (
                        <Check className="w-6 h-6 mx-auto text-green-500" />
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      {row.viewgrip ? (
                        <Check className="w-6 h-6 mx-auto text-green-500" />
                      ) : (
                        <X className="w-6 h-6 mx-auto text-red-400 opacity-50" />
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      {row.smmpanel ? (
                        <Check className="w-6 h-6 mx-auto text-green-500" />
                      ) : (
                        <X className="w-6 h-6 mx-auto text-red-400 opacity-50" />
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      {row.boosthill ? (
                        <Check className="w-6 h-6 mx-auto text-green-500" />
                      ) : (
                        <X className="w-6 h-6 mx-auto text-red-400 opacity-50" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button 
              size="lg"
              className="gradient-bg text-white border-0 hover:opacity-90 px-8 shadow-lg shadow-warm-200"
              onClick={() => setIsSignUpOpen(true)}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start with the Best
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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

          <TestimonialsCarousel />
        </div>
      </section>

      {/* Achievement Badges Section - NEW FEATURE */}
      <AchievementBadges />

      {/* Social Proof / As Featured In Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background overflow-hidden border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Trusted Worldwide
            </p>
            <h3 className="text-2xl md:text-3xl font-bold">
              Trusted by <span className="gradient-text">100,000+</span> Creators Worldwide
            </h3>
          </div>

          {/* Logo Marquee */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
            
            <div className="flex animate-marquee hover:[animation-play-state:paused]">
              {[
                { name: 'TechCrunch', style: { fontFamily: 'system-ui', fontWeight: 800, color: '#1a1a1a' } },
                { name: 'Forbes', style: { fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic' } },
                { name: 'Mashable', style: { fontFamily: 'system-ui', fontWeight: 900 } },
                { name: 'The Verge', style: { fontFamily: 'system-ui', fontWeight: 800 } },
                { name: 'WIRED', style: { fontFamily: 'system-ui', fontWeight: 700, letterSpacing: '-0.05em' } },
                { name: 'Entrepreneur', style: { fontFamily: 'system-ui', fontWeight: 600, fontStyle: 'italic' } },
                { name: 'Inc.', style: { fontFamily: 'Georgia, serif', fontWeight: 700 } },
                { name: 'Fast Company', style: { fontFamily: 'system-ui', fontWeight: 600, color: '#0033a0' } }
              ].map((logo, i) => (
                <div
                  key={i}
                  className="featured-logo flex items-center justify-center min-w-[180px] px-8 py-4 mx-4"
                >
                  <span 
                    className="text-xl md:text-2xl text-muted-foreground select-none cursor-default"
                    style={logo.style as React.CSSProperties}
                  >
                    {logo.name}
                  </span>
                </div>
              ))}
              
              {/* Duplicate for seamless loop */}
              {[
                { name: 'TechCrunch', style: { fontFamily: 'system-ui', fontWeight: 800, color: '#1a1a1a' } },
                { name: 'Forbes', style: { fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic' } },
                { name: 'Mashable', style: { fontFamily: 'system-ui', fontWeight: 900 } },
                { name: 'The Verge', style: { fontFamily: 'system-ui', fontWeight: 800 } },
                { name: 'WIRED', style: { fontFamily: 'system-ui', fontWeight: 700, letterSpacing: '-0.05em' } },
                { name: 'Entrepreneur', style: { fontFamily: 'system-ui', fontWeight: 600, fontStyle: 'italic' } },
                { name: 'Inc.', style: { fontFamily: 'Georgia, serif', fontWeight: 700 } },
                { name: 'Fast Company', style: { fontFamily: 'system-ui', fontWeight: 600, color: '#0033a0' } }
              ].map((logo, i) => (
                <div
                  key={`dup-${i}`}
                  className="featured-logo flex items-center justify-center min-w-[180px] px-8 py-4 mx-4"
                >
                  <span 
                    className="text-xl md:text-2xl text-muted-foreground select-none cursor-default"
                    style={logo.style as React.CSSProperties}
                  >
                    {logo.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Enhanced with Search & Categories */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
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

            {/* Search Box */}
            <EnhancedFAQ />
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

      {/* ============================================ */}
      {/* ROUND 9: NEW SECTIONS                      */}
      {/* ============================================ */}

      {/* Blog / Latest News Section - Round 9 New Feature */}
      <BlogSection />

      {/* Team / Meet The Team Section - Round 9 New Feature */}
      <TeamSection />

      {/* Contact Us Section - Round 9 New Feature */}
      <ContactSection />

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

      {/* Footer - Enhanced for Round 8 */}
      <footer className="bg-foreground text-background py-16 mt-auto relative">
        {/* Decorative Gradient Line at Top */}
        <div className="footer-gradient-line absolute top-0 left-0 right-0"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warm-500 flex items-center justify-center neon-border">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-background">SocialBoost</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                The #1 platform for organic social media growth with real user engagement.
              </p>
              {/* Enhanced Social Links Row */}
              <div className="flex flex-wrap gap-3 mb-4">
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-red-500 flex items-center justify-center group" title="YouTube">
                  <Youtube className="w-4 h-4 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-pink-500 flex items-center justify-center group" title="Instagram">
                  <Instagram className="w-4 h-4 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-400 flex items-center justify-center group" title="Twitter/X">
                  <TwitterIcon className="w-4 h-4 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center group" title="Facebook">
                  <Facebook className="w-4 h-4 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-500 flex items-center justify-center group" title="Discord">
                  <MessageSquare className="w-4 h-4 group-hover:text-white text-gray-400 transition-colors" />
                </a>
                <a href="#" className="social-icon-hover w-9 h-9 rounded-lg bg-gray-800 hover:bg-black dark:hover:bg-white flex items-center justify-center group" title="TikTok">
                  <Rss className="w-4 h-4 group-hover:text-inherit text-gray-400 transition-colors rotate-[270deg]" />
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
                {['Followers', 'Post Likes', 'Comments', 'Reels Views', 'Story Views'].map((item) => (
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

          {/* Quick Links Grid - Round 8 New Feature */}
          <Card className="bg-gradient-to-r from-warm-900/40 to-orange-900/30 border border-warm-800/30 p-6 mb-8 rounded-xl">
            <h4 className="font-semibold mb-4 text-center text-background/90 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-warm-400" />
              Quick Links
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Start Free Trial', icon: <Gift className="w-4 h-4" />, onClick: () => setIsSignUpOpen(true) },
                { label: 'View Pricing', icon: <DollarSign className="w-4 h-4" />, href: '#pricing' },
                { label: 'Documentation', icon: <BookOpen className="w-4 h-4" />, href: '#' },
                { label: 'Contact Support', icon: <HeadphonesIcon className="w-4 h-4" />, href: '#' },
                { label: 'API Docs', icon: <Code className="w-4 h-4" />, href: '#' },
                { label: 'Status Page', icon: <Activity className="w-4 h-4" />, href: '#' }
              ].map((link, idx) => {
                if (link.onClick) {
                  return (
                    <button 
                      key={idx} 
                      onClick={link.onClick}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-warm-500/20 border border-white/10 hover:border-warm-500/50 text-sm text-background/80 hover:text-white transition-all duration-300 group"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  )
                }
                return (
                  <a 
                    key={idx} 
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-warm-500/20 border border-white/10 hover:border-warm-500/50 text-sm text-background/80 hover:text-white transition-all duration-300 group"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )
              })}
            </div>
          </Card>

          <Separator className="bg-gray-800 mb-8" />

          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} SocialBoost. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
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
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                <span>for creators</span>
              </div>
            </div>
          </div>

          {/* Live Stats Banner */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <LiveUserCounter />
              <div className="text-center px-4 py-2 rounded-lg bg-white/5">
                <p className="font-bold text-lg text-white neon-text">12.8K+</p>
                <p className="text-xs opacity-60">Active Users</p>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-white/5 hidden sm:block">
                <p className="font-bold text-lg text-white neon-text">50M+</p>
                <p className="text-xs opacity-60">Delivered</p>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-white/5 hidden md:block">
                <p className="font-bold text-lg text-white neon-text">99.9%</p>
                <p className="text-xs opacity-60">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner - Round 8 */}
      <CookieConsentBanner />

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Quick Start Wizard - NEW FEATURE (Floating Widget) */}
      <QuickStartWizard />
    </div>
  )
}

// Helper components moved above Home function for proper hoisting - see above

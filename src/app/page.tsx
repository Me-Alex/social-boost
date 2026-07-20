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
import { Select, SelectContent, SelectItem, SelectSelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

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
        setEmail('')
        setPassword('')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }, [email, password])

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

// Twitter/X icon helper
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  )
}

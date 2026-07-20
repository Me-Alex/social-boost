'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
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
  Headphones
} from 'lucide-react'

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
    description: "Reach audiences from specific regions based on your content strategy."
  },
  {
    icon: <Shield className="w-8 h-8 text-warm-600" />,
    title: "Quality & Trust",
    description: "Multiple verification systems ensure authentic engagement."
  },
  {
    icon: <Zap className="w-8 h-8 text-warm-600" />,
    title: "Instant Start",
    description: "Campaigns begin processing immediately after creation."
  },
  {
    icon: <Headphones className="w-8 h-8 text-warm-600" />,
    title: "24/7 Support",
    description: "Our team is always here to help you succeed."
  },
  {
    icon: <Gift className="w-8 h-8 text-warm-600" />,
    title: "Free Credits",
    description: "Start with bonus credits - no payment required."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-warm-600" />,
    title: "Real Growth",
    description: "Organic-looking growth that algorithms love."
  }
]

const stats = [
  { value: "50M+", label: "Views Delivered", suffix: "" },
  { value: "5M+", label: "Followers Gained", suffix: "" },
  { value: "100K+", label: "Happy Creators", suffix: "" },
  { value: "99.9%", label: "Uptime", suffix: "" }
]

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('youtube')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [campaignUrl, setCampaignUrl] = useState('')
  const [quantity, setQuantity] = useState([1000])
  const [speed, setSpeed] = useState('normal')
  const [geoTarget, setGeoTarget] = useState('all')

  // State for animations (initialized as true)
  const isVisible = true

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SocialBoost</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Welcome Back</DialogTitle>
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
                      />
                    </div>
                    <Button className="w-full" onClick={() => {
                      // Handle sign in
                      alert('Sign in functionality would connect to backend API')
                      setIsSignInOpen(false)
                    }}>
                      Sign In
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-bg text-white border-0 hover:opacity-90">
                    Get Started Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
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
                      />
                    </div>
                    <Button className="w-full gradient-bg text-white border-0 hover:opacity-90" onClick={() => {
                      // Handle sign up
                      alert('Sign up functionality would connect to backend API')
                      setIsSignUpOpen(false)
                    }}>
                      Create Account
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Get 500 free credits upon signup!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsSignInOpen(true)}>Sign In</Button>
                  <Button className="flex-1 gradient-bg text-white border-0" onClick={() => setIsSignUpOpen(true)}>Get Started</Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-warm-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-warm-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-warm-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-warm-100 text-warm-800 hover:bg-warm-200">
              <Sparkles className="w-4 h-4 mr-2" />
              #1 Social Media Growth Platform
            </Badge>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Get Free{' '}
              <span className="gradient-text">YouTube & Instagram</span>{' '}
              Growth from Real Users
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Boost your social media presence with authentic views, followers, likes, and comments. 
              Our platform connects your content with real users who actively engage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="gradient-bg text-white border-0 hover:opacity-90 text-lg px-8 py-6 h-auto animate-pulse-glow"
                onClick={() => setIsSignUpOpen(true)}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Growing Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Services
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span>100% safe & secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-success" />
                <span>100K+ happy creators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-warm-600 via-warm-500 to-warm-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-warm-100 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-warm-100 text-warm-800">
              Our Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Growth Platform</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Select from our comprehensive range of services designed to boost your social media presence
            </p>
          </div>

          {/* Platform Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="youtube" className="gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <Youtube className="w-5 h-5" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="instagram" className="gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                <Instagram className="w-5 h-5" />
                Instagram
              </TabsTrigger>
            </TabsList>

            {/* YouTube Services */}
            <TabsContent value="youtube">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {youtubeServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${service.popular ? 'ring-2 ring-red-500' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-red-500 text-white"><Star className="w-3 h-3 mr-1" /> Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
                        {service.icon}
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center mb-4">
                        {service.description}
                      </CardDescription>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-red-600">Free</span>
                        <p className="text-xs text-muted-foreground mt-1">with credits</p>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => setIsSignUpOpen(true)}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Instagram Services */}
            <TabsContent value="instagram">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {instagramServices.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${service.popular ? 'ring-2 ring-pink-500' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"><Star className="w-3 h-3 mr-1" /> Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center bg-gradient-to-br text-transparent bg-clip-text mb-3" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        <div className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {React.cloneElement(service.icon, { className: "w-6 h-6", style: { color: '#EC4899' } })}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center mb-4">
                        {service.description}
                      </CardDescription>
                      <div className="text-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Free</span>
                        <p className="text-xs text-muted-foreground mt-1">with credits</p>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        onClick={() => setIsSignUpOpen(true)}
                      >
                        Get Started
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
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-warm-300 via-warm-400 to-warm-500"></div>

              {/* Step 1 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-warm-200 relative z-10">
                  <div className="text-center">
                    <div className="text-3xl font-bold">01</div>
                    <UserIcon className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up for free and receive 500 bonus credits to start your first campaign instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-warm-200 relative z-10">
                  <div className="text-center">
                    <div className="text-3xl font-bold">02</div>
                    <Target className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Campaign</h3>
                <p className="text-muted-foreground">
                  Add your video or profile URL, choose your target audience, and configure delivery settings.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-warm-200 relative z-10">
                  <div className="text-center">
                    <div className="text-3xl font-bold">03</div>
                    <TrendingUp className="w-8 h-8 mx-auto mt-1" />
                  </div>
                </div>
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
                className="gradient-bg text-white border-0 hover:opacity-90 px-8"
                onClick={() => setIsSignUpOpen(true)}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Now - It's Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
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

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features Banner */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="border-0 bg-gradient-to-r from-warm-500 to-warm-400 text-white overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
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
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <BarChart3 className="w-24 h-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-28 bg-muted/50">
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
                    { icon: <Shield />, title: 'Anti-Bot Detection', desc: 'Blocks automated and non-human traffic' },
                    { icon: <Globe />, title: 'Connection Filtering', desc: 'Restricts suspicious or low-quality sources' },
                    { icon: <Eye />, title: 'Traffic Validation', desc: 'Ensures realistic viewing behavior patterns' },
                    { icon: <Lock />, title: 'Device Verification', desc: 'Confirms unique user sessions' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-card shadow-sm">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
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
                  <div className="relative h-full rounded-3xl bg-gradient-to-br from-warm-50 to-warm-100 border border-warm-200 p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                      {[
                        { label: 'Active Users Online', value: '12,847', color: 'text-green-600' },
                        { label: 'Campaigns Running', value: '3,291', color: 'text-blue-600' },
                        { label: 'Success Rate', value: '99.9%', color: 'text-warm-600' },
                        { label: 'Avg. Response Time', value: '< 2s', color: 'text-purple-600' }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white shadow-sm">
                          <span className="text-muted-foreground">{stat.label}</span>
                          <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
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
      <section className="py-20 lg:py-28">
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
                rating: 5
              },
              {
                name: 'Mike T.',
                role: 'Instagram Influencer • 1M followers',
                content: 'I was skeptical at first, but this platform delivers real results. My engagement rates have never been higher. Highly recommend!',
                rating: 5
              },
              {
                name: 'Emily R.',
                role: 'Content Creator • Multi-platform',
                content: 'The best investment for my social media growth. Easy to use, great results, and excellent customer service. 10/10 would recommend!',
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-warm-400 text-warm-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
                      {testimonial.name[0]}
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
      <section id="faq" className="py-20 lg:py-28 bg-muted/50">
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
                  className="bg-card rounded-xl px-6 shadow-sm border-0"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-warm-500 via-warm-400 to-warm-500"></div>
            <CardContent className="relative p-8 md:p-16 text-center text-white">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Grow Your Social Media?
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Join over 100,000 creators who are already using SocialBoost to accelerate their growth. 
                Start for free today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-warm-600 hover:bg-gray-100 border-0 text-lg px-8 py-6 h-auto"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Contact Sales
                </Button>
              </div>
              <p className="mt-6 text-sm opacity-75">
                No credit card required • 500 free credits • Cancel anytime
              </p>
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
              <p className="text-gray-400 text-sm mb-4">
                The #1 platform for organic social media growth with real user engagement.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">YouTube Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">YouTube Views</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube Subscribers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube Likes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube Comments</a></li>
              </ul>
            </div>

            {/* Instagram Services */}
            <div>
              <h4 className="font-semibold mb-4">Instagram Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Instagram Followers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram Likes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram Comments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reels Views</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-gray-700 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2024 SocialBoost. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper component for User icon in steps
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

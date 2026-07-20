# 🚀 SocialBoost - Social Media Growth Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
</p>

**SocialBoost** is a comprehensive social media growth platform that provides free YouTube views, Instagram followers, likes, and comments through a real-user credit exchange system.

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Registration & login with credit system (500 free credits on signup)
- 📊 **Dashboard Analytics** - Real-time campaign tracking with beautiful visualizations
- 🎯 **Campaign Management** - Create and manage growth campaigns for multiple platforms
- 💰 **Credit Exchange System** - Earn credits by helping others, spend on your own growth

### Supported Platforms
| Platform | Services |
|----------|----------|
| **YouTube** | Views, Likes, Comments, Subscribers |
| **Instagram** | Followers, Likes, Comments, Reel Views |
| **TikTok** | Followers, Likes, Views, Shares |
| **Twitter/X** | Followers, Likes, Retweets |
| **Facebook** | Page Likes, Post Likes, Followers |

### Advanced Features
- 🌍 **Geo-Targeting** - Target specific countries/regions for your campaigns
- ⚡ **Speed Control** - Choose delivery speed (Slow, Medium, Fast, Instant)
- 🔔 **Real-time Notifications** - Live activity feed and updates
- 📱 **Fully Responsive** - Mobile-first design, works on all devices
- 🎨 **Beautiful UI** - Modern amber/gold theme with smooth animations
- 📈 **Live Statistics** - Real-time user activity and platform stats

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite + Prisma ORM |
| State Management | Zustand + TanStack Query |
| Icons | Lucide React |
| Animations | Custom CSS animations |

## Getting Started

### Prerequisites
- Node.js 18+ 
- Bun or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Me-Alex/social-boost.git

# Navigate to project directory
cd social-boost

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Push database schema
bun run db:push

# Start development server
bun run dev
```

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Project Structure

```
social-boost/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main landing page (4200+ lines)
│   │   ├── globals.css       # Global styles & animations (870+ lines)
│   │   ├── layout.tsx        # Root layout
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/ # Registration API
│   │       │   └── login/    # Login API
│   │       ├── campaigns/    # Campaign CRUD API
│   │       └── user/         # User profile API
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   └── lib/
│       └── db.ts            # Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                   # Static assets
```

## Database Schema

### User Model
- id, email, name, password
- credits (default: 100)
- plan (free/premium/business)
- isActive status

### Campaign Model
- userId, platform, serviceType
- targetUrl, quantity
- status (pending/active/completed/failed)
- speed, geoTarget

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User authentication |
| GET | `/api/user` | Get user profile |
| PUT | `/api/user` | Update user profile |
| GET | `/api/campaigns` | List user campaigns |
| POST | `/api/campaigns` | Create new campaign |

## UI Components (30+)

- HeroSection with animated gradient background
- PlatformSelector with icon cards
- ServiceCards with hover effects
- HowItWorks step-by-step guide
- PricingPlans comparison table
- TestimonialsCarousel
- StatsCounter with animation
- FAQ Accordion
- LiveActivityTicker
- NotificationBellDropdown
- DemoVideoModal
- ComparisonTable
- MagicNumbersShowcase
- And many more...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] NextAuth.js session persistence
- [ ] Payment integration (Stripe)
- [ ] Email verification
- [ ] WebSocket real-time updates
- [ ] Multi-language support (i18n)
- [ ] Admin dashboard
- [ ] Referral system
- [ ] API rate limiting

## License

This project is licensed under the MIT License.

## Links

- **GitHub**: [https://github.com/Me-Alex/social-boost](https://github.com/Me-Alex/social-boost)
- **Live Demo**: Coming soon

---

<p align="center">
  Built with ❤️ using Next.js, React, and Tailwind CSS
</p>

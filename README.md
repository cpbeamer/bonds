# BondScout - Tax-Aware Bond Intelligence Platform

BondScout is a personalized, tax-aware bond scouting application that transforms overwhelming bond searches into ranked, actionable opportunities. It delivers the top 5-10 after-tax yield opportunities daily based on your tax profile and investment preferences.

## Key Features

- **After-Tax Yield Calculations (ATYTW)**: Automatic calculations including OID/premium adjustments
- **Stability Scoring**: Issuer and sector analysis for solvency context
- **Smart Rankings**: Top opportunities from thousands of bonds
- **Daily Email Delivery**: Fresh opportunities at 8 AM ET or your schedule
- **Cross-State Comparisons**: Compare in-state vs national bonds after-tax
- **Watchlist & Alerts**: Track favorite bonds and set price/yield alerts

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Payments**: Stripe
- **Email**: Postmark/SendGrid (configured separately)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication
- Stripe account for payments

### Installation

1. **Clone and install dependencies:**
```bash
cd bondscout-app
npm install
```

2. **Configure environment variables:**

Update `.env.local` with your actual values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bondscout?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
POSTMARK_API_KEY=...
POSTMARK_FROM_EMAIL=bonds@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up the database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Or run migrations (for production)
npm run prisma:migrate
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Setting up Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/onboarding`

### Setting up Stripe

1. Create products and prices in Stripe dashboard
2. Set up webhook endpoint for `/api/stripe/webhook`
3. Configure webhook to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## FINRA Data Integration

BondScout uses FINRA TRACE data to provide real-time bond pricing and market information. **For development, the app includes comprehensive mock data so you can test without needing API access.**

### Mock Data Mode (Development)

The application automatically uses mock data in development mode. The mock data includes:

- **22 realistic bonds** across different sectors:
  - Corporate bonds (Apple, Microsoft, Amazon, etc.)
  - Municipal bonds (CA, NY, TX, FL, IL, MA)
  - Treasury bonds (5, 10, 30-year)
  - Agency bonds (Fannie Mae, FHLB)
  - High-yield bonds

- **Features**:
  - Realistic pricing, yields, and trade volumes
  - Tax-exempt status for municipal bonds
  - Callable bond schedules
  - Multiple rating agencies (Moody's, S&P, Fitch)
  - Historical trade data generation

#### Testing Mock Data

```bash
# Test the mock data implementation
npm run finra:test
```

#### Configuring Mock Mode

In your `.env` file:
```env
# Automatically true in development
USE_MOCK_FINRA_DATA=true
NODE_ENV=development
```

### Setting up FINRA Data

1. **Initial Database Seed:**
```bash
# Seed database with popular bonds and initial data
npm run finra:seed
```

2. **Manual Data Sync:**
```bash
# Run an immediate sync of bond data
npm run finra:sync
```

3. **Automated Scheduler:**
```bash
# Start the automated scheduler for daily updates
npm run finra:scheduler

# With immediate sync on startup
npm run finra:scheduler -- --immediate

# With database seeding
npm run finra:scheduler -- --seed
```

### FINRA Data Schedule

- **Daily Sync**: Runs at 6:00 AM to update all bonds
- **Intraday Sync**: Runs every 4 hours on weekdays for market data updates

### API Endpoints

- `GET /api/bonds/results` - Get bond recommendations based on user profile
- `POST /api/bonds/sync` - Trigger manual data sync (authenticated)

### Data Sources

The integration fetches:
- Corporate bond trades from FINRA TRACE
- Municipal bond data for tax-exempt analysis
- Treasury bonds for baseline comparisons
- Real-time pricing, yields, and trade volumes

## Project Structure

```
bondscout-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── bonds/         # Bond data endpoints
│   │   └── user/          # User management
│   ├── dashboard/         # Dashboard page
│   ├── onboarding/        # Onboarding flow
│   ├── sign-in/           # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── calculations/      # ATYTW and scoring logic
│   ├── services/          # External service integrations
│   │   └── finra/         # FINRA data service
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema
│   └── schema.prisma
├── scripts/              # Utility scripts
│   ├── seed-finra.ts     # FINRA data seeder
│   └── start-scheduler.ts # Scheduler starter
└── public/               # Static assets
```

## Core Modules

### ATYTW Calculation Engine (`lib/calculations/atytw.ts`)
- Handles tax-aware yield calculations
- Supports different bond types (Treasury, Municipal, Corporate)
- Accounts for OID/premium adjustments
- Manages state/federal/local tax stacks

### Scoring System (`lib/calculations/scoring.ts`)
- **Stability Score**: Based on issuer type, sector, state quality, and ratings
- **Liquidity Score**: Based on trading activity, bid-ask spreads, and volume
- **Ranking Algorithm**: Primary sort by ATYTW, tiebreakers by liquidity/stability

## API Endpoints

- `POST /api/user/onboarding` - Save user profile and preferences
- `GET /api/bonds/results` - Fetch latest bond recommendations
- `POST /api/bonds/search` - Search bonds with custom criteria
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/user/profile` - Get user profile and settings

## Database Schema

Key models:
- **User**: Profile, tax information, delivery preferences
- **Bond**: Bond details, ratings, tax treatment
- **MarketData**: Pricing, yields, trading data
- **Run**: Batch processing results
- **Result**: Ranked bond recommendations
- **Watchlist**: User's saved bonds

## Deployment

### Vercel Deployment

1. Push to GitHub repository
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Database (Production)

Consider using:
- Supabase
- Neon
- PlanetScale
- AWS RDS

## Next Steps for Production

1. **Data Integration**:
   - Connect to MSRB EMMA API for municipal bonds
   - Integrate Treasury Direct for UST data
   - Add FINRA TRACE for corporate bonds

2. **Email System**:
   - Implement email templates with React Email
   - Set up cron jobs for scheduled delivery
   - Configure Postmark/SendGrid

3. **Advanced Features**:
   - Ladder builder tool
   - Portfolio analytics
   - Real-time alerts
   - Mobile app

4. **Performance**:
   - Implement caching with Redis
   - Add background job processing
   - Optimize database queries

## License

Private - All rights reserved

## Support

For questions or issues, contact support@bondscout.com
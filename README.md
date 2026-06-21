# VWealth AI — Your Personal AI Financial Advisor

A React + TypeScript web app for tracking and managing NSE/BSE investment portfolios, powered by AI-driven analysis (Google Gemini, with Anthropic Claude API support) and a voice assistant interface.

VWealth AI goes beyond a basic portfolio tracker by combining real-time market context, sentiment analysis, and conversational AI to help retail investors and startup founders make sense of their holdings.


## Features

### Portfolio Management
- Add investments (Stocks, ETFs, Mutual Funds, Commodities, FDs, Crypto)
- Track 50+ NSE/BSE listed companies with sector and symbol data
- Portfolio overview: total invested, diversification, and risk metrics

### AI-Powered Analysis
- Single Asset Analysis — BUY MORE / HOLD / WITHDRAW / REDUCE recommendations with reasoning and risk level
- Full Portfolio Analysis — overall health, diversification score, risk score, and best/weakest asset
- Risk Assessment — profit/loss probability estimates per asset

### Voice Assistant
- Speech recognition for natural-language queries (Web Speech API)
- Text-to-speech responses
- Dynamically generated bar, pie, and line charts based on your questions
- Conversation history of AI interactions

### Financial Goals
- Set savings/investment goals with target amounts and deadlines
- Track progress and time remaining
- AI-refreshed insights on whether you're on pace to hit each goal

### Tax Optimizer
- Estimated tax liability based on portfolio data
- AI-generated, India-specific tax-saving suggestions

### News & Sentiment
- AI-analyzed sentiment scoring on recent news for your top holdings
- Key headlines and a plain-language summary of likely impact

### Smart Alerts
- Notification feed for important portfolio and market events
- Read/unread tracking

### Visualizations
- Pie charts for sector allocation
- Bar charts for invested amount vs. expected profit
- Line charts for market valuation trends

### User Management
- Email/password authentication
- User roles: Retail Investor, Startup Founder, or Both
- Per-user portfolio data persisted in browser local storage


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Inline CSS (Segoe UI) |
| Charts | Recharts |
| AI (primary) | Google Gemini API |
| AI (secondary) | Anthropic Claude API |
| Voice | Web Speech API |
| Storage | Browser local storage (no backend database) |


## Project Structure

```
vwealth-ai/
├── src/
│   ├── components/
│   │   ├── alerts/
│   │   │   └── SmartAlerts.tsx
│   │   ├── analysis/
│   │   │   └── AssetAnalysisCard.tsx
│   │   ├── charts/
│   │   │   └── VoiceChart.tsx
│   │   ├── common/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Toast.tsx
│   │   ├── goals/
│   │   │   ├── AddGoalForm.tsx
│   │   │   └── GoalCard.tsx
│   │   ├── news/
│   │   │   └── NewsSentimentPanel.tsx
│   │   ├── portfolio/
│   │   │   ├── InvestmentTable.tsx
│   │   │   ├── PortfolioSummary.tsx
│   │   │   └── AddInvestmentForm.tsx
│   │   ├── tax/
│   │   │   └── TaxOptimizer.tsx
│   │   └── ui/
│   │       └── CompanyField.tsx
│   ├── hooks/
│   │   ├── usePortfolio.ts
│   │   ├── useVoiceAssistant.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── data/
│   │   └── nseCompanies.ts
│   ├── services/
│   │   ├── geminiApi.ts
│   │   ├── claudeApi.ts
│   │   └── newsService.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── vercel.json
├── .env
└── README.md
```


## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

Set up environment variables in `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
```

### Development
```bash
npm run dev
```
Opens at `http://localhost:3000`.

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Design System

**Colors**
- Primary: `#6C63FF`
- Secondary: `#00D4AA`
- Danger: `#FF6B6B`
- Warning: `#FFB347`
- Background: `#f0f2f8`

**Components**
- Custom `Card` for layouts
- Reusable `Button` with variants
- `Toast` notifications
- Responsive grid layouts

## Data Storage

- User credentials and portfolio data stored in browser local storage
- Session-based state management with React hooks
- No backend database

## Important Notes

1. API keys required in `.env`
2. Modern browser needed for Web Speech API
3. AI recommendations are informational only
4. Internet connection required for AI and news sentiment

## Troubleshooting

**npm audit vulnerabilities**
```bash
npm audit fix --force
```

**Port conflict** — change port in `vite.config.ts`:
```typescript
server: {
  port: 3001,
}

**TypeScript errors** — ensure types are imported from `src/types/index.ts`


## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |


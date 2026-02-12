# RetirePlan - AI Retirement Portfolio Simulator 🚀

**RetirePlan** is an intelligent web application designed to help users plan their retirement by simulating asset growth and recommending optimal ETF portfolios. Built with React and TypeScript, it focuses on the Korean market ecosystem (TIGER, KODEX, ACE ETFs).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)

## ✨ Key Features

### 1. 📊 Retirement Simulation
- Calculate expected retirement savings based on current age, salary, and monthly contribution.
- visualize the growth of assets over time with compound interest.

### 2. 🤖 AI Portfolio Recommendation
- Analyze user's risk tolerance (MDD) and target return.
- Recommend proven asset allocation strategies (e.g., *60/40 Rule*, *All Weather*, *Warren Buffett 90/10*).
- **NEW**: **Dynamic AI Strategy** - Automatically generates high-growth custom portfolios (NASDAQ/S&P Mix) for users targeting returns > 10%.

### 3. 🇰🇷 Korean Market Optimized
- Uses actual ETFs listed on the Korea Exchange (KRX).
- Supports major brands: TIGER, KODEX, ACE, KBSTAR.
- Backtested against 20-year historical data for accuracy.

### 4. ⚡ Modern Tech Stack & SEO
- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **SEO**: Dynamic Meta Tags, Sitemap, Robots.txt
- **Monetization**: Google AdSense Integration

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/) (Planned)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arslonga1984/retireplan-mvp.git
   cd retireplan-mvp/retireplan-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
src/
├── components/
│   ├── InputForm/       # Step-by-step user input forms
│   ├── Layout/          # Header, Footer, ProgressBar
│   ├── Results/         # Dashboard, Charts
│   ├── SEO/             # MetaHead, AdPlaceholder
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── strategies/      # Portfolio presets & Recommendation logic
│   ├── store.ts         # Zustand state store
│   └── utils.ts         # Helper functions
├── types/               # TypeScript interfaces
└── App.tsx              # Main application entry
```

## 📝 License

This project is licensed under the MIT License.

---
*Developed by [arslonga1984](https://github.com/arslonga1984)*

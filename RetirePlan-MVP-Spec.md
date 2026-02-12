# RetirePlan AI - MVP 개발 명세서

## 프로젝트 개요

퇴직연금 포트폴리오 제안 및 시뮬레이션 서비스 MVP

**개발 기간**: 4주  
**목표**: 기본적인 입력-계산-결과 표시 flow 구현

---

## 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Form**: React Hook Form + Zod
- **State**: Zustand (필요시)
- **Routing**: React Router v6

### Backend (Optional for MVP)
- **Option 1**: Frontend Only (계산 로직 클라이언트)
- **Option 2**: Node.js + Express (향후 확장 고려)

### Deployment
- **Frontend**: Vercel
- **Database**: 로컬 스토리지 (MVP는 서버 없이)

---

## 프로젝트 구조

```
retireplan-mvp/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── InputForm/
│   │   │   ├── Step1BasicInfo.tsx
│   │   │   ├── Step2Goals.tsx
│   │   │   ├── Step3Strategy.tsx
│   │   │   └── Step4Payout.tsx
│   │   ├── Results/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AssetGrowthChart.tsx
│   │   │   ├── PortfolioPieChart.tsx
│   │   │   └── PayoutChart.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ProgressBar.tsx
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── portfolioEngine.ts
│   │   │   ├── simulator.ts
│   │   │   └── payoutCalculator.ts
│   │   ├── strategies/
│   │   │   ├── types.ts
│   │   │   └── presets.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── validators.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 데이터 타입 정의

```typescript
// src/types/index.ts

export interface UserInputs {
  // Step 1: 기본 정보
  currentAge: number;
  retirementAge: number;
  currentAssets: number;
  monthlyContribution: number;
  
  // Step 2: 투자 목표
  targetReturn: number;        // 연 복리 수익률 (%)
  maxDrawdown: number;          // 최대 손실률 (%)
  
  // Step 3: 전략 선택
  strategyId: string;
  
  // Step 4: 연금 수령
  payoutType: 'perpetual' | 'fixed';
  payoutYears?: number;
  inflationAdjusted: boolean;
}

export interface PortfolioStrategy {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  allocation: {
    stocks: number;      // 주식 비중 (%)
    bonds: number;       // 채권 비중 (%)
    gold: number;        // 금 비중 (%)
    reits?: number;      // 리츠 비중 (%)
    cash?: number;       // 현금 비중 (%)
  };
  expectedReturn: number;  // 예상 수익률 (%)
  expectedMDD: number;     // 예상 MDD (%)
  etfList: ETF[];
}

export interface ETF {
  ticker: string;
  name: string;
  assetClass: 'stocks' | 'bonds' | 'gold' | 'reits' | 'cash';
  region?: string;
  weight: number;          // 포트폴리오 내 비중 (%)
}

export interface SimulationResult {
  yearsToRetirement: number;
  totalContributions: number;  // 총 불입액
  
  scenarios: {
    worst: ScenarioDetail;
    median: ScenarioDetail;
    best: ScenarioDetail;
  };
  
  successProbability: number;  // 목표 달성 확률 (%)
}

export interface ScenarioDetail {
  finalAssets: number;
  totalReturn: number;
  annualizedReturn: number;
  monthlyPayout: number;
  payoutYears: number;
  yearlyData: YearlyData[];
}

export interface YearlyData {
  year: number;
  age: number;
  contribution: number;
  assets: number;
  returnAmount: number;
}
```

---

## MVP 핵심 기능 (Phase 1)

### 1. 입력 폼 (4단계)

#### Step 1: 기본 정보 입력
```typescript
// 필수 입력값
- 현재 나이: 25 ~ 65세
- 연금 개시 연령: 55 ~ 70세
- 현재 퇴직연금 자산: 0 ~ 10억원
- 월 추가 불입액: 0 ~ 500만원

// 자동 계산
- 투자 가능 기간 = 연금개시연령 - 현재나이
```

#### Step 2: 투자 목표 설정
```typescript
// 필수 입력값
- 목표 연 수익률: 3% ~ 15% (기본값: 7%)
- 최대 손실률(MDD): 10% ~ 50% (기본값: 25%)

// 입력 도움
- 슬라이더 + 숫자 직접 입력
- 각 수익률별 MDD 가이드 표시
```

#### Step 3: 전략 선택
```typescript
// 3가지 전략 제공 (MVP)
1. 보수형: 영구 포트폴리오 (수익률 5-7%, MDD ~15%)
2. 균형형: 레이지 포트폴리오 (수익률 7-9%, MDD ~25%)
3. 성장형: 60/40 포트폴리오 (수익률 7-10%, MDD ~30%)

// AI 추천
- Step 2 입력값 기반 최적 전략 자동 추천
- 각 전략 상세 설명 + 자산 배분 표시
```

#### Step 4: 연금 수령 계획
```typescript
// 수령 방식
- 종신형: 4% 룰 적용 (총자산 × 4% / 12개월)
- 확정기간형: 5~50년 선택 (자본회수계수 적용하여 은퇴 후 운용 수익 반영)

// 옵션
- 물가상승률 반영 (연 2% 고정, 실질수익률로 계산)
```

### 2. 포트폴리오 전략 엔진

```typescript
// src/lib/strategies/presets.ts

export const STRATEGIES: PortfolioStrategy[] = [
  {
    id: 'permanent',
    name: 'Permanent Portfolio',
    nameKo: '영구 포트폴리오',
    description: '4가지 자산에 균등 분산, 안정적 수익 추구',
    allocation: {
      stocks: 25,
      bonds: 25,
      gold: 25,
      cash: 25,
    },
    expectedReturn: 6,
    expectedMDD: 15,
    etfList: [
      { ticker: 'KODEX 200', name: 'KODEX 200', assetClass: 'stocks', region: 'KR', weight: 12.5 },
      { ticker: 'TIGER 미국S&P500', name: 'TIGER 미국S&P500', assetClass: 'stocks', region: 'US', weight: 12.5 },
      { ticker: 'KODEX 국고채10년', name: 'KODEX 국고채10년', assetClass: 'bonds', region: 'KR', weight: 25 },
      { ticker: 'KODEX 골드선물', name: 'KODEX 골드선물', assetClass: 'gold', weight: 25 },
      { ticker: 'Cash', name: '현금성 자산', assetClass: 'cash', weight: 25 },
    ],
  },
  {
    id: 'lethargic',
    name: 'Lethargic Asset Allocation',
    nameKo: '레이지 포트폴리오',
    description: '게으른 투자자를 위한 4자산 분산',
    allocation: {
      stocks: 30,
      bonds: 30,
      gold: 20,
      reits: 20,
    },
    expectedReturn: 8,
    expectedMDD: 25,
    etfList: [
      { ticker: 'TIGER 미국S&P500', name: 'TIGER 미국S&P500', assetClass: 'stocks', region: 'US', weight: 20 },
      { ticker: 'KODEX 200', name: 'KODEX 200', assetClass: 'stocks', region: 'KR', weight: 10 },
      { ticker: 'ACE 미국30년국채', name: 'ACE 미국30년국채', assetClass: 'bonds', region: 'US', weight: 20 },
      { ticker: 'KODEX 국고채10년', name: 'KODEX 국고채10년', assetClass: 'bonds', region: 'KR', weight: 10 },
      { ticker: 'KODEX 골드선물', name: 'KODEX 골드선물', assetClass: 'gold', weight: 20 },
      { ticker: 'KODEX 미국리츠', name: 'KODEX 미국리츠부동산', assetClass: 'reits', region: 'US', weight: 20 },
    ],
  },
  {
    id: 'sixty_forty',
    name: '60/40 Portfolio',
    nameKo: '60/40 포트폴리오',
    description: '전통적인 주식 중심 포트폴리오',
    allocation: {
      stocks: 60,
      bonds: 40,
    },
    expectedReturn: 8.5,
    expectedMDD: 30,
    etfList: [
      { ticker: 'TIGER 미국S&P500', name: 'TIGER 미국S&P500', assetClass: 'stocks', region: 'US', weight: 40 },
      { ticker: 'KODEX 200', name: 'KODEX 200', assetClass: 'stocks', region: 'KR', weight: 20 },
      { ticker: 'ACE 미국30년국채', name: 'ACE 미국30년국채', assetClass: 'bonds', region: 'US', weight: 25 },
      { ticker: 'KODEX 국고채10년', name: 'KODEX 국고채10년', assetClass: 'bonds', region: 'KR', weight: 15 },
    ],
  },
];
```

### 3. 시뮬레이션 엔진

```typescript
// src/lib/calculations/simulator.ts

/**
 * 단순 복리 계산 기반 시뮬레이션
 * MVP에서는 Monte Carlo 없이 결정론적 계산만 수행
 */
export function runSimulation(inputs: UserInputs, strategy: PortfolioStrategy): SimulationResult {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const monthlyRate = strategy.expectedReturn / 100 / 12;
  
  // 시나리오별 수익률 (단순화)
  const scenarios = {
    worst: realExpectedReturn - 2,   // -2%p
    median: realExpectedReturn,
    best: realExpectedReturn + 2,    // +2%p
  };
  
  const results = {
    yearsToRetirement,
    totalContributions: calculateTotalContributions(inputs, yearsToRetirement),
    scenarios: {
      worst: calculateScenario(inputs, scenarios.worst, yearsToRetirement),
      median: calculateScenario(inputs, scenarios.median, yearsToRetirement),
      best: calculateScenario(inputs, scenarios.best, yearsToRetirement),
    },
    successProbability: 75, // MVP에서는 고정값
  };
  
  return results;
}

function calculateTotalContributions(inputs: UserInputs, years: number): number {
  return inputs.currentAssets + (inputs.monthlyContribution * 12 * years);
}

function calculateScenario(
  inputs: UserInputs, 
  annualReturn: number, 
  years: number
): ScenarioDetail {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  
  let currentAssets = inputs.currentAssets;
  const yearlyData: YearlyData[] = [];
  
  // 연도별 자산 계산
  for (let year = 1; year <= years; year++) {
    const startAssets = currentAssets;
    
    // 월 불입액 복리 계산
    for (let month = 1; month <= 12; month++) {
      currentAssets = currentAssets * (1 + monthlyRate) + inputs.monthlyContribution;
    }
    
    const yearReturn = currentAssets - startAssets - (inputs.monthlyContribution * 12);
    
    yearlyData.push({
      year,
      age: inputs.currentAge + year,
      contribution: inputs.monthlyContribution * 12,
      assets: Math.round(currentAssets),
      returnAmount: Math.round(yearReturn),
    });
  }
  
  const finalAssets = currentAssets;
  const totalContributions = inputs.currentAssets + (inputs.monthlyContribution * 12 * years);
  const totalReturn = finalAssets - totalContributions;
  
  // 연금 수령액 계산
  const monthlyPayout = calculateMonthlyPayout(
    finalAssets, 
    inputs.payoutType, 
    inputs.payoutYears
  );
  
  return {
    finalAssets: Math.round(finalAssets),
    totalReturn: Math.round(totalReturn),
    annualizedReturn: annualReturn,
    monthlyPayout: Math.round(monthlyPayout),
    payoutYears: inputs.payoutType === 'perpetual' ? 999 : inputs.payoutYears!,
    yearlyData,
  };
}

function calculateMonthlyPayout(
  assets: number, 
  type: 'perpetual' | 'fixed', 
  annualReturnRate: number,
  years?: number
): number {
  if (type === 'perpetual') {
    // 4% 룰
    return assets * 0.04 / 12;
  } else {
    // 확정 기간형 (자본회수계수 - Annuity Payout Formula)
    // PMT = PV * r / (1 - (1+r)^-n)
    // 은퇴 후에도 자산이 계속 운용된다고 가정
    const r = annualReturnRate / 100 / 12;
    const n = (years || 20) * 12;
    if (r === 0) return assets / n;
    return (assets * r) / (1 - Math.pow(1 + r, -n));
  }
}

// + calculateGapAnalysis (PV of Annuity for Shortfall Calculation)
// + Drawdown Simulation (Decumulation Phase up to Age 100)
```

### 4. 결과 대시보드

#### 표시할 데이터
```typescript
1. 요약 카드
   - 투자 기간
   - 선택 전략
   - 총 불입액
   - 예상 적립금 (중간 시나리오)
   - 월 수령액
   - 목표 달성 확률

2. 자산 증가 추이 차트 (Area Chart)
   - X축: 연령 (현재 ~ 100세)
   - Y축: 자산 규모
   - Accumulation (적립) + Decumulation (인출) 전체 사이클 표시
   - 은퇴 시점 Reference Line 표시
   - 3개 시나리오 라인 (최선/중간/최악)

3. 포트폴리오 구성 (Pie Chart)
   - 자산군별 비중
   - 세부 ETF 리스트

4. 연금 수령액 시뮬레이션 (Bar Chart)
   - 확정기간형: 연도별 수령액
   - 종신형: 연령별 수령액 (30년간 표시)
```

---

## 컴포넌트 상세 명세

### Step1BasicInfo.tsx

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  currentAge: z.number().min(25).max(65),
  retirementAge: z.number().min(55).max(70),
  currentAssets: z.number().min(0).max(1000000000),
  monthlyContribution: z.number().min(0).max(5000000),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "연금 개시 연령은 현재 나이보다 커야 합니다",
  path: ["retirementAge"],
});

export default function Step1BasicInfo({ onNext, defaultValues }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  const yearsToRetirement = form.watch('retirementAge') - form.watch('currentAge');
  
  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      <h2>기본 정보 입력</h2>
      
      <div>
        <label>현재 나이</label>
        <input type="number" {...form.register('currentAge', { valueAsNumber: true })} />
        세
      </div>
      
      <div>
        <label>연금 개시 희망 연령</label>
        <input type="number" {...form.register('retirementAge', { valueAsNumber: true })} />
        세
      </div>
      
      {yearsToRetirement > 0 && (
        <div className="info-box">
          투자 가능 기간: <strong>{yearsToRetirement}년</strong>
        </div>
      )}
      
      <div>
        <label>현재 퇴직연금 자산</label>
        <input type="number" {...form.register('currentAssets', { valueAsNumber: true })} />
        원
      </div>
      
      <div>
        <label>월 추가 불입액</label>
        <input type="number" {...form.register('monthlyContribution', { valueAsNumber: true })} />
        원
      </div>
      
      <button type="submit">다음 단계</button>
    </form>
  );
}
```

### Dashboard.tsx

```typescript
import { SimulationResult, PortfolioStrategy } from '@/types';
import AssetGrowthChart from './AssetGrowthChart';
import PortfolioPieChart from './PortfolioPieChart';
import PayoutChart from './PayoutChart';

interface Props {
  result: SimulationResult;
  strategy: PortfolioStrategy;
  inputs: UserInputs;
}

export default function Dashboard({ result, strategy, inputs }: Props) {
  const { median } = result.scenarios;
  
  return (
    <div className="dashboard">
      <h1>나의 퇴직연금 플랜</h1>
      
      {/* 요약 섹션 */}
      <div className="summary-grid">
        <Card>
          <h3>투자 기간</h3>
          <p className="value">{result.yearsToRetirement}년</p>
        </Card>
        
        <Card>
          <h3>선택 전략</h3>
          <p className="value">{strategy.nameKo}</p>
        </Card>
        
        <Card>
          <h3>총 불입액</h3>
          <p className="value">{formatCurrency(result.totalContributions)}</p>
        </Card>
        
        <Card>
          <h3>예상 적립금</h3>
          <p className="value">{formatCurrency(median.finalAssets)}</p>
          <p className="sub">중간 시나리오 기준</p>
        </Card>
        
        <Card>
          <h3>월 수령액</h3>
          <p className="value">{formatCurrency(median.monthlyPayout)}</p>
          <p className="sub">{inputs.payoutType === 'perpetual' ? '종신' : `${inputs.payoutYears}년`}</p>
        </Card>
        
        <Card>
          <h3>목표 달성 확률</h3>
          <p className="value">{result.successProbability}%</p>
        </Card>
      </div>
      
      {/* 시나리오 비교 */}
      <div className="scenarios">
        <h2>시나리오별 예상 적립금</h2>
        <div className="scenario-cards">
          <ScenarioCard title="최악" data={result.scenarios.worst} />
          <ScenarioCard title="중간" data={result.scenarios.median} highlight />
          <ScenarioCard title="최선" data={result.scenarios.best} />
        </div>
      </div>
      
      {/* 차트 영역 */}
      <section>
        <h2>자산 증가 추이</h2>
        <AssetGrowthChart data={result} />
      </section>
      
      <section>
        <h2>포트폴리오 구성</h2>
        <PortfolioPieChart strategy={strategy} />
      </section>
      
      <section>
        <h2>연금 수령 시뮬레이션</h2>
        <PayoutChart 
          finalAssets={median.finalAssets}
          monthlyPayout={median.monthlyPayout}
          payoutType={inputs.payoutType}
          payoutYears={inputs.payoutYears}
        />
      </section>
      
      <div className="actions">
        <button onClick={onReset}>처음부터 다시</button>
        <button onClick={onModify}>설정 수정</button>
        <button onClick={onDownloadPDF}>리포트 다운로드</button>
      </div>
    </div>
  );
}
```

---

## 차트 구현 (Recharts)

### AssetGrowthChart.tsx

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';

export default function AssetGrowthChart({ data }: { data: SimulationResult }) {
  // 데이터 변환
  const chartData = data.scenarios.median.yearlyData.map((yearData, index) => ({
    year: yearData.year,
    age: yearData.age,
    worst: data.scenarios.worst.yearlyData[index].assets,
    median: yearData.assets,
    best: data.scenarios.best.yearlyData[index].assets,
    contribution: yearData.contribution,
  }));
  
  return (
    <AreaChart width={800} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="age" label={{ value: '나이', position: 'insideBottom', offset: -5 }} />
      <YAxis label={{ value: '자산 (원)', angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={(value) => formatCurrency(value as number)} />
      <Legend />
      
      <Area type="monotone" dataKey="worst" stackId="1" stroke="#ef4444" fill="#fca5a5" name="최악" />
      <Area type="monotone" dataKey="median" stackId="2" stroke="#3b82f6" fill="#93c5fd" name="중간" />
      <Area type="monotone" dataKey="best" stackId="3" stroke="#10b981" fill="#86efac" name="최선" />
    </AreaChart>
  );
}
```

### PortfolioPieChart.tsx

```typescript
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = {
  stocks: '#3b82f6',
  bonds: '#10b981',
  gold: '#f59e0b',
  reits: '#8b5cf6',
  cash: '#6b7280',
};

export default function PortfolioPieChart({ strategy }: { strategy: PortfolioStrategy }) {
  const data = Object.entries(strategy.allocation).map(([key, value]) => ({
    name: ASSET_NAMES[key],
    value,
    color: COLORS[key],
  }));
  
  return (
    <div>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx={200}
          cy={200}
          labelLine={false}
          label={renderLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      
      {/* ETF 리스트 */}
      <div className="etf-list">
        <h3>구성 ETF</h3>
        <table>
          <thead>
            <tr>
              <th>티커</th>
              <th>이름</th>
              <th>비중</th>
            </tr>
          </thead>
          <tbody>
            {strategy.etfList.map(etf => (
              <tr key={etf.ticker}>
                <td>{etf.ticker}</td>
                <td>{etf.name}</td>
                <td>{etf.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ASSET_NAMES = {
  stocks: '주식',
  bonds: '채권',
  gold: '금',
  reits: '리츠',
  cash: '현금',
};
```

---

## 개발 우선순위

### Week 1: 프로젝트 셋업 + 기본 UI
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS + shadcn/ui 설치
- [ ] 타입 정의 (`types/index.ts`)
- [ ] 라우팅 구조 설정
- [ ] 레이아웃 컴포넌트 (Header, Footer, ProgressBar)

### Week 2: 입력 폼 구현
- [ ] Step1BasicInfo 컴포넌트
- [ ] Step2Goals 컴포넌트
- [ ] Step3Strategy 컴포넌트
- [ ] Step4Payout 컴포넌트
- [ ] 폼 유효성 검사 (Zod)
- [ ] 단계별 네비게이션

### Week 3: 계산 엔진 + 결과 화면
- [ ] 포트폴리오 전략 프리셋 (`strategies/presets.ts`)
- [ ] 시뮬레이션 엔진 (`simulator.ts`)
- [ ] Dashboard 컴포넌트
- [ ] 요약 카드 컴포넌트

### Week 4: 차트 + 마무리
- [ ] AssetGrowthChart (Area Chart)
- [ ] PortfolioPieChart (Pie Chart)
- [ ] PayoutChart (Bar Chart)
- [ ] 반응형 디자인 최적화
- [ ] 로컬 스토리지 저장/불러오기
- [ ] 배포 (Vercel)

---

## 시작 명령어

```bash
# 프로젝트 생성
npm create vite@latest retireplan-mvp -- --template react-ts
cd retireplan-mvp

# 의존성 설치
npm install
npm install -D tailwindcss postcss autoprefixer
npm install recharts react-hook-form @hookform/resolvers zod
npm install zustand react-router-dom

# shadcn/ui 초기화
npx shadcn-ui@latest init

# 개발 서버 시작
npm run dev
```

---

## 다음 단계 체크리스트

- [ ] 프로젝트 생성 및 기본 설정
- [ ] 타입 정의 완료
- [ ] 전략 프리셋 데이터 작성
- [ ] 계산 로직 구현 및 테스트
- [ ] UI 컴포넌트 개발
- [ ] 차트 통합
- [ ] 테스트 및 디버깅
- [ ] 배포

---

## 참고 자료

- [Recharts 문서](https://recharts.org/)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**작성일**: 2026-02-11  
**버전**: MVP v1.0

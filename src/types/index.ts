export interface UserInputs {
    // Step 1: 기본 정보
    currentAge: number;
    retirementAge: number;
    currentAssets: number;
    monthlyContribution: number;
    targetRetirementIncome: number; // 희망 은퇴 월 생활비

    // Step 2: 투자 목표
    targetReturn: number;        // 연 복리 수익률 (%)
    maxDrawdown: number;          // 최대 손실률 (%)

    // Step 3: 전략 선택
    strategyId: string;

    // Step 4: 연금 수령
    payoutType: 'perpetual' | 'fixed';
    payoutYears?: number;

    inflationAdjusted: boolean;

    // Step 4: 은퇴 후 전략 (NEW)
    postRetirementStrategyId?: string;

    // 국민연금
    nationalPensionAmount?: number;
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
    monteCarloSuccessProbability?: number;
    assumptions: SimulationAssumptions;

    gapAnalysis: GapAnalysisResult;
}

export interface SimulationAssumptions {
    inflationRate: number;
    realExpectedReturnPre: number;
    realExpectedReturnPost: number;
    estimatedVolatility: number;
    simulationRuns: number;
}

export interface GapAnalysisResult {
    targetIncome: number;
    projectedIncome: number;
    gap: number;
    gapPercentage: number;
    isShortfall: boolean;
    additionalMonthlyContribution: number;
    nationalPensionAmount: number;
    totalRetirementIncome: number;
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
    withdrawalNominal?: number;
    withdrawalReal?: number;
}

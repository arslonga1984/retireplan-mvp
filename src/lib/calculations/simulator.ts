import type { UserInputs, PortfolioStrategy, SimulationResult, ScenarioDetail, YearlyData, GapAnalysisResult } from '@/types';
import { STRATEGIES } from '@/lib/strategies/presets';


/**
 * 단순 복리 계산 기반 시뮬레이션
 * MVP에서는 Monte Carlo 없이 결정론적 계산만 수행
 */
export function runSimulation(inputs: UserInputs, strategy: PortfolioStrategy): SimulationResult {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;

    // 실질 수익률 반영 (물가상승률 2% 가정)
    const inflationRate = inputs.inflationAdjusted ? 2.0 : 0;
    const realExpectedReturn = strategy.expectedReturn - inflationRate;

    // 은퇴 후 수익률 결정
    const postRetirementStrategyId = inputs.postRetirementStrategyId;
    const postRetirementStrategy = postRetirementStrategyId
        ? STRATEGIES.find(s => s.id === postRetirementStrategyId)
        : strategy;

    const postRealReturn = (postRetirementStrategy?.expectedReturn || strategy.expectedReturn) - inflationRate;

    const scenarios = {
        worst: { pre: realExpectedReturn - 2, post: postRealReturn - 2 },
        median: { pre: realExpectedReturn, post: postRealReturn },
        best: { pre: realExpectedReturn + 2, post: postRealReturn + 2 },
    };

    const scenarioResults = {
        worst: calculateScenario(inputs, scenarios.worst.pre, scenarios.worst.post, yearsToRetirement),
        median: calculateScenario(inputs, scenarios.median.pre, scenarios.median.post, yearsToRetirement),
        best: calculateScenario(inputs, scenarios.best.pre, scenarios.best.post, yearsToRetirement),
    };

    const results: SimulationResult = {
        yearsToRetirement,
        totalContributions: calculateTotalContributions(inputs, yearsToRetirement),
        scenarios: scenarioResults,
        successProbability: estimateSuccessProbability(scenarioResults, inputs.retirementAge),
        gapAnalysis: calculateGapAnalysis(
            inputs,
            scenarioResults.median.monthlyPayout,
            scenarioResults.median.finalAssets,
            realExpectedReturn,
            postRealReturn,
            yearsToRetirement
        )
    };

    return results;
}

/**
 * 시나리오별 85세/100세 자산잔여 여부 기반 성공확률 추정
 */
function estimateSuccessProbability(
    scenarios: { worst: ScenarioDetail; median: ScenarioDetail; best: ScenarioDetail },
    _retirementAge: number
): number {
    const checkAges = [85, 100];
    let score = 0;
    const totalChecks = checkAges.length * 3; // 3 scenarios x 2 ages = 6

    for (const scenario of [scenarios.worst, scenarios.median, scenarios.best]) {
        for (const targetAge of checkAges) {
            const dataPoint = scenario.yearlyData.find(d => d.age === targetAge);
            if (dataPoint && dataPoint.assets > 0) {
                score++;
            }
        }
    }

    // worst 85세 통과 → +10 보너스, worst 100세 통과 → +5 보너스
    const worst85 = scenarios.worst.yearlyData.find(d => d.age === 85);
    const worst100 = scenarios.worst.yearlyData.find(d => d.age === 100);
    let bonus = 0;
    if (worst85 && worst85.assets > 0) bonus += 10;
    if (worst100 && worst100.assets > 0) bonus += 5;

    // 기본 점수: (통과한 체크 / 전체 체크) * 80 + bonus, 최대 99
    const baseRate = (score / totalChecks) * 80 + bonus;
    return Math.min(99, Math.max(10, Math.round(baseRate)));
}

function calculateTotalContributions(inputs: UserInputs, years: number): number {
    return inputs.currentAssets + (inputs.monthlyContribution * 12 * years);
}

function calculateScenario(
    inputs: UserInputs,
    annualReturnPre: number,
    annualReturnPost: number,
    years: number
): ScenarioDetail {
    const monthlyRatePre = annualReturnPre / 100 / 12;
    const monthlyRatePost = annualReturnPost / 100 / 12;

    let currentAssets = inputs.currentAssets;
    const yearlyData: YearlyData[] = [];

    // 연도별 자산 계산
    for (let year = 1; year <= years; year++) {
        const startAssets = currentAssets;

        for (let month = 1; month <= 12; month++) {
            currentAssets = currentAssets * (1 + monthlyRatePre) + inputs.monthlyContribution;
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

    // 은퇴 후 인출 단계 (Decumulation Phase)
    const finalAge = 100;
    const postRetirementYears = finalAge - inputs.retirementAge;

    const finalAssets = currentAssets;

    const projectedPayout = calculateMonthlyPayout(
        finalAssets,
        inputs.payoutType,
        annualReturnPost,
        inputs.payoutYears
    );

    const monthlyWithdrawal = (inputs.targetRetirementIncome && inputs.targetRetirementIncome > 0)
        ? inputs.targetRetirementIncome
        : projectedPayout;

    let retirementAssets = finalAssets;

    for (let year = 1; year <= postRetirementYears; year++) {
        const currentAge = inputs.retirementAge + year;

        for (let month = 1; month <= 12; month++) {
            retirementAssets = retirementAssets * (1 + monthlyRatePost);
            retirementAssets -= monthlyWithdrawal;
        }

        if (retirementAssets < 0) retirementAssets = 0;

        yearlyData.push({
            year: years + year,
            age: currentAge,
            contribution: 0,
            assets: Math.round(retirementAssets),
            returnAmount: 0
        });
    }

    const assetsAtRetirement = currentAssets;
    const totalContributions = inputs.currentAssets + (inputs.monthlyContribution * 12 * years);
    const totalReturn = assetsAtRetirement - totalContributions;

    const monthlyPayout = calculateMonthlyPayout(
        assetsAtRetirement,
        inputs.payoutType,
        annualReturnPost,
        inputs.payoutYears
    );

    return {
        finalAssets: Math.round(assetsAtRetirement),
        totalReturn: Math.round(totalReturn),
        annualizedReturn: annualReturnPre,
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
        return assets * 0.04 / 12;
    } else {
        const r = annualReturnRate / 100 / 12;
        const n = (years || 20) * 12;

        if (r === 0) {
            return assets / n;
        }

        return (assets * r) / (1 - Math.pow(1 + r, -n));
    }
}

function calculateGapAnalysis(
    inputs: UserInputs,
    projectedIncome: number,
    _projectedAssets: number,
    annualReturnRatePre: number,
    annualReturnRatePost: number,
    yearsToRetirement: number
): GapAnalysisResult {
    const targetIncome = inputs.targetRetirementIncome;
    const nationalPensionAmount = inputs.nationalPensionAmount || 0;
    const totalRetirementIncome = projectedIncome + nationalPensionAmount;

    // Gap은 총 은퇴소득(개인투자 + 국민연금) 기준으로 계산
    const gap = totalRetirementIncome - targetIncome;
    const gapPercentage = targetIncome > 0 ? (gap / targetIncome) * 100 : 0;
    const isShortfall = gap < 0;

    let additionalMonthlyContribution = 0;

    if (isShortfall) {
        // 국민연금을 감안한 부족 소득
        const incomeShortfall = targetIncome - totalRetirementIncome;

        // 부족 소득분에 대한 필요 자산
        let requiredAdditionalAssets = 0;
        if (inputs.payoutType === 'perpetual') {
            requiredAdditionalAssets = (incomeShortfall * 12) / 0.04;
        } else {
            const r = annualReturnRatePost / 100 / 12;
            const n = (inputs.payoutYears || 20) * 12;

            if (r === 0) {
                requiredAdditionalAssets = incomeShortfall * n;
            } else {
                requiredAdditionalAssets = incomeShortfall * (1 - Math.pow(1 + r, -n)) / r;
            }
        }

        const r = annualReturnRatePre / 100 / 12;
        const n = yearsToRetirement * 12;

        if (r > 0 && n > 0 && requiredAdditionalAssets > 0) {
            additionalMonthlyContribution = (requiredAdditionalAssets * r) / (Math.pow(1 + r, n) - 1);
        } else if (r === 0 && n > 0 && requiredAdditionalAssets > 0) {
            additionalMonthlyContribution = requiredAdditionalAssets / n;
        }
    }

    return {
        targetIncome,
        projectedIncome,
        gap,
        gapPercentage,
        isShortfall,
        additionalMonthlyContribution: Math.round(additionalMonthlyContribution),
        nationalPensionAmount,
        totalRetirementIncome,
    };
}

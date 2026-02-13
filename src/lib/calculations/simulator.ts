import type { UserInputs, PortfolioStrategy, SimulationResult, ScenarioDetail, YearlyData, GapAnalysisResult } from '@/types';
import { STRATEGIES } from '@/lib/strategies/presets';

/**
 * 복리 계산 + 확률 시뮬레이션 기반 은퇴 분석
 */
export function runSimulation(inputs: UserInputs, strategy: PortfolioStrategy): SimulationResult {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const inflationRate = inputs.inflationAdjusted ? 2.0 : 0;
    const realExpectedReturn = strategy.expectedReturn - inflationRate;

    const postRetirementStrategy = inputs.postRetirementStrategyId
        ? STRATEGIES.find(s => s.id === inputs.postRetirementStrategyId)
        : strategy;

    const postRealReturn = (postRetirementStrategy?.expectedReturn || strategy.expectedReturn) - inflationRate;
    const estimatedVolatility = estimatePortfolioVolatility(strategy);

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

    const simulationRuns = 500;
    const monteCarloSuccessProbability = runMonteCarloSuccessProbability(
        inputs,
        realExpectedReturn,
        postRealReturn,
        estimatedVolatility,
        yearsToRetirement,
        simulationRuns
    );

    return {
        yearsToRetirement,
        totalContributions: calculateTotalContributions(inputs, yearsToRetirement),
        scenarios: scenarioResults,
        successProbability: monteCarloSuccessProbability || estimateSuccessProbability(scenarioResults),
        monteCarloSuccessProbability,
        assumptions: {
            inflationRate,
            realExpectedReturnPre: round1(realExpectedReturn),
            realExpectedReturnPost: round1(postRealReturn),
            estimatedVolatility: round1(estimatedVolatility),
            simulationRuns,
        },
        gapAnalysis: calculateGapAnalysis(
            inputs,
            scenarioResults.median.monthlyPayout,
            scenarioResults.median.finalAssets,
            realExpectedReturn,
            postRealReturn,
            yearsToRetirement
        )
    };
}

function estimateSuccessProbability(
    scenarios: { worst: ScenarioDetail; median: ScenarioDetail; best: ScenarioDetail }
): number {
    const checkAges = [85, 100];
    let score = 0;
    const totalChecks = checkAges.length * 3;

    for (const scenario of [scenarios.worst, scenarios.median, scenarios.best]) {
        for (const targetAge of checkAges) {
            const dataPoint = scenario.yearlyData.find(d => d.age === targetAge);
            if (dataPoint && dataPoint.assets > 0) score++;
        }
    }

    const worst85 = scenarios.worst.yearlyData.find(d => d.age === 85);
    const worst100 = scenarios.worst.yearlyData.find(d => d.age === 100);
    let bonus = 0;
    if (worst85 && worst85.assets > 0) bonus += 10;
    if (worst100 && worst100.assets > 0) bonus += 5;

    const baseRate = (score / totalChecks) * 80 + bonus;
    return Math.min(99, Math.max(10, Math.round(baseRate)));
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

function estimatePortfolioVolatility(strategy: PortfolioStrategy): number {
    const volByAsset: Record<string, number> = {
        stocks: 18,
        bonds: 7,
        gold: 15,
        reits: 20,
        cash: 1,
    };

    const corr: Record<string, Record<string, number>> = {
        stocks: { stocks: 1, bonds: 0.2, gold: 0.1, reits: 0.65, cash: 0 },
        bonds: { stocks: 0.2, bonds: 1, gold: 0.15, reits: 0.2, cash: 0.3 },
        gold: { stocks: 0.1, bonds: 0.15, gold: 1, reits: 0.05, cash: 0 },
        reits: { stocks: 0.65, bonds: 0.2, gold: 0.05, reits: 1, cash: 0.1 },
        cash: { stocks: 0, bonds: 0.3, gold: 0, reits: 0.1, cash: 1 },
    };

    const allocationEntries = Object.entries(strategy.allocation)
        .filter(([, weight]) => (weight || 0) > 0)
        .map(([asset, weight]) => ({ asset, weight: (weight || 0) / 100 }));

    let variance = 0;

    for (const i of allocationEntries) {
        for (const j of allocationEntries) {
            const volI = volByAsset[i.asset] || 10;
            const volJ = volByAsset[j.asset] || 10;
            const c = corr[i.asset]?.[j.asset] ?? (i.asset === j.asset ? 1 : 0.2);
            variance += i.weight * j.weight * volI * volJ * c;
        }
    }

    return Math.sqrt(Math.max(variance, 0));
}

function runMonteCarloSuccessProbability(
    inputs: UserInputs,
    annualReturnPre: number,
    annualReturnPost: number,
    annualVolatility: number,
    yearsToRetirement: number,
    runs: number
): number {
    const inflationMultiplier = inputs.inflationAdjusted ? 1.02 : 1;
    const horizonYears = 100 - inputs.retirementAge;
    let successCount = 0;

    for (let run = 0; run < runs; run++) {
        let assets = inputs.currentAssets;

        for (let y = 0; y < yearsToRetirement; y++) {
            const sampledAnnualReturn = sampleNormal(annualReturnPre, annualVolatility);
            const monthlyRate = sampledAnnualReturn / 100 / 12;
            for (let m = 0; m < 12; m++) {
                assets = assets * (1 + monthlyRate) + inputs.monthlyContribution;
            }
        }

        let survived = true;

        for (let y = 0; y < horizonYears; y++) {
            const sampledAnnualReturn = sampleNormal(annualReturnPost, Math.max(annualVolatility * 0.8, 3));
            const monthlyRate = sampledAnnualReturn / 100 / 12;
            const withdrawalNominal = inputs.targetRetirementIncome > 0
                ? inputs.targetRetirementIncome * Math.pow(inflationMultiplier, y)
                : calculateMonthlyPayout(assets, inputs.payoutType, sampledAnnualReturn, inputs.payoutYears);

            for (let m = 0; m < 12; m++) {
                assets = assets * (1 + monthlyRate) - withdrawalNominal;
                if (assets <= 0) {
                    survived = false;
                    break;
                }
            }

            if (!survived) break;
        }

        if (survived) successCount++;
    }

    return Math.round((successCount / runs) * 100);
}

function sampleNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * stdDev;
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

    const finalAge = 100;
    const postRetirementYears = finalAge - inputs.retirementAge;
    const finalAssets = currentAssets;

    const projectedPayout = calculateMonthlyPayout(
        finalAssets,
        inputs.payoutType,
        annualReturnPost,
        inputs.payoutYears
    );

    const monthlyWithdrawalBase = (inputs.targetRetirementIncome && inputs.targetRetirementIncome > 0)
        ? inputs.targetRetirementIncome
        : projectedPayout;

    let retirementAssets = finalAssets;

    for (let year = 1; year <= postRetirementYears; year++) {
        const currentAge = inputs.retirementAge + year;
        const inflationFactor = inputs.inflationAdjusted ? Math.pow(1.02, year - 1) : 1;
        const monthlyWithdrawalNominal = monthlyWithdrawalBase * inflationFactor;

        for (let month = 1; month <= 12; month++) {
            retirementAssets = retirementAssets * (1 + monthlyRatePost);
            retirementAssets -= monthlyWithdrawalNominal;
        }

        if (retirementAssets < 0) retirementAssets = 0;

        yearlyData.push({
            year: years + year,
            age: currentAge,
            contribution: 0,
            assets: Math.round(retirementAssets),
            returnAmount: 0,
            withdrawalNominal: Math.round(monthlyWithdrawalNominal),
            withdrawalReal: Math.round(monthlyWithdrawalNominal / inflationFactor)
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
    }

    const r = annualReturnRate / 100 / 12;
    const n = (years || 20) * 12;

    if (r === 0) {
        return assets / n;
    }

    return (assets * r) / (1 - Math.pow(1 + r, -n));
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
    const gap = totalRetirementIncome - targetIncome;
    const gapPercentage = targetIncome > 0 ? (gap / targetIncome) * 100 : 0;
    const isShortfall = gap < 0;

    let additionalMonthlyContribution = 0;

    if (isShortfall) {
        const incomeShortfall = targetIncome - totalRetirementIncome;

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

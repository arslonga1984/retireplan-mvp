import type { UserInputs, PortfolioStrategy, SimulationResult, ScenarioDetail, YearlyData } from '@/types';

/**
 * 단순 복리 계산 기반 시뮬레이션
 * MVP에서는 Monte Carlo 없이 결정론적 계산만 수행
 */
export function runSimulation(inputs: UserInputs, strategy: PortfolioStrategy): SimulationResult {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;

    // 실질 수익률 반영 (물가상승률 2% 가정)
    // inflationAdjusted가 true이면, 기대 수익률에서 2%를 차감하여 실질 구매력 기준 시뮬레이션
    const inflationRate = inputs.inflationAdjusted ? 2.0 : 0;
    const realExpectedReturn = strategy.expectedReturn - inflationRate;

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
    // const months = years * 12; // Unused

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
    years?: number
): number {
    if (type === 'perpetual') {
        // 4% 룰
        return assets * 0.04 / 12;
    } else {
        // 확정 기간형 (단순 균등 분할, 이자 미고려)
        return assets / (years! * 12);
    }
}

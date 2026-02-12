import type { UserInputs, PortfolioStrategy, SimulationResult, ScenarioDetail, YearlyData, GapAnalysisResult } from '@/types';


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

    const scenarioResults = {
        worst: calculateScenario(inputs, scenarios.worst, yearsToRetirement),
        median: calculateScenario(inputs, scenarios.median, yearsToRetirement),
        best: calculateScenario(inputs, scenarios.best, yearsToRetirement),
    };

    const results: SimulationResult = {
        yearsToRetirement,
        totalContributions: calculateTotalContributions(inputs, yearsToRetirement),
        scenarios: scenarioResults,
        successProbability: 75, // MVP에서는 고정값
        gapAnalysis: calculateGapAnalysis(
            inputs,
            scenarioResults.median.monthlyPayout,
            scenarioResults.median.finalAssets,
            realExpectedReturn, // Use the same rate as the simulation (real or nominal)
            yearsToRetirement
        )
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

    // 은퇴 후 인출 단계 (Decumulation Phase)
    // 최대 100세까지 시뮬레이션
    const finalAge = 100;
    const postRetirementYears = finalAge - inputs.retirementAge;

    // 타겟 월 생활비가 있으면 그것을 인출, 없으면 계산된 월 수령액을 인출
    // (이 함수 내에서는 아직 'monthlyPayout'이 계산되기 전이지만, 
    //  calculateScenario가 독립적으로 돌기 때문에 여기서 임의로 Payout을 계산해야 함.
    //  하지만 순환 참조 문제가 있으므로, 일단 'TargetIncome'이 있으면 그걸 쓰고,
    //  없으면 Simulator의 메인 로직 흐름과 맞지 않을 수 있음.
    //  Refactoring: calculateScenario가 Payout을 리턴하는데, Payout 계산에 FinalAssets가 필요함.
    //  Accumulation -> FinalAssets -> Payout -> Decumulation 순서로 가야 함.)

    // 따라서, 1단계: Accumulation 완료
    const finalAssets = currentAssets;

    // 2단계: Payout 계산 (여기서 먼저 계산)
    const projectedPayout = calculateMonthlyPayout(
        finalAssets,
        inputs.payoutType,
        annualReturn,
        inputs.payoutYears
    );

    // 인출액 결정: 목표 생활비가 설정되어 있다면 그만큼 인출, 아니면 예상 수령액 인출
    const monthlyWithdrawal = (inputs.targetRetirementIncome && inputs.targetRetirementIncome > 0)
        ? inputs.targetRetirementIncome
        : projectedPayout;

    let retirementAssets = finalAssets;

    for (let year = 1; year <= postRetirementYears; year++) {
        const currentAge = inputs.retirementAge + year;

        // 월별 인출 및 수익 적용
        for (let month = 1; month <= 12; month++) {
            // 이자 수익 (월초 자산 기준)
            retirementAssets = retirementAssets * (1 + monthlyRate);
            // 인출 (월말 인출 가정)
            retirementAssets -= monthlyWithdrawal;
        }

        // 자산이 0 미만이면 0으로 고정하고 루프 종료할 수도 있지만,
        // 차트 표현을 위해 0으로 계속 기록하거나 음수로 기록할 수 있음.
        // 보통 0으로 클램핑.
        if (retirementAssets < 0) retirementAssets = 0;

        yearlyData.push({
            year: years + year, // 누적 연차
            age: currentAge,
            contribution: 0,
            assets: Math.round(retirementAssets),
            returnAmount: 0 // 단순화를 위해 은퇴 후 수익은 별도 트래킹 안함
        });

        if (retirementAssets <= 0) break; // 자산 소진 시 종료
    }


    const assetsAtRetirement = currentAssets;
    const totalContributions = inputs.currentAssets + (inputs.monthlyContribution * 12 * years);
    const totalReturn = assetsAtRetirement - totalContributions;

    // 연금 수령액 계산
    const monthlyPayout = calculateMonthlyPayout(
        assetsAtRetirement,
        inputs.payoutType,
        annualReturn, // Passed from scenario
        inputs.payoutYears
    );

    return {
        finalAssets: Math.round(assetsAtRetirement),
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
        // 4% 룰 (고정)
        return assets * 0.04 / 12;
    } else {
        // 확정 기간형 (자본회수계수 - Annuity Payout Formula)
        // PMT = PV * r / (1 - (1+r)^-n)
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
    projectedAssets: number,
    annualReturnRate: number,
    yearsToRetirement: number
): GapAnalysisResult {
    const targetIncome = inputs.targetRetirementIncome;
    // Surplus = Projected - Target (Positive)
    // Shortfall = Target - Projected (Negative if calculated this way, but we want Gap to be Surplus amount)
    // Let's define: Gap = Projected - Target.
    // If Projected > Target (Surplus), Gap is Positive.
    // If Target > Projected (Shortfall), Gap is Negative.
    const gap = projectedIncome - targetIncome;

    // If targetIncome is 0, gapPercentage is 0. Avoid NaN.
    const gapPercentage = targetIncome > 0 ? (gap / targetIncome) * 100 : 0;
    const isShortfall = gap < 0;

    let additionalMonthlyContribution = 0;

    if (isShortfall) {
        // Calculate required assets to meet target income
        let requiredAssets = 0;
        if (inputs.payoutType === 'perpetual') {
            // Target = Assets * 0.04 / 12
            // Assets = Target * 12 / 0.04
            requiredAssets = (targetIncome * 12) / 0.04;
        } else {
            // 확정 기간형 (연금 현가 - PV of Annuity)
            // PV = PMT * (1 - (1+r)^-n) / r
            const r = annualReturnRate / 100 / 12;
            const n = (inputs.payoutYears || 20) * 12;

            if (r === 0) {
                requiredAssets = targetIncome * n;
            } else {
                requiredAssets = targetIncome * (1 - Math.pow(1 + r, -n)) / r;
            }
        }

        const assetShortfall = requiredAssets - projectedAssets;

        // Calculate PMT needed to cover assetShortfall
        // FV = PMT * ((1+r)^n - 1) / r
        // PMT = FV * r / ((1+r)^n - 1)
        const r = annualReturnRate / 100 / 12;
        const n = yearsToRetirement * 12;

        if (r > 0 && n > 0 && assetShortfall > 0) {
            additionalMonthlyContribution = (assetShortfall * r) / (Math.pow(1 + r, n) - 1);
        } else if (r === 0 && n > 0 && assetShortfall > 0) {
            // If rate is 0, simple division
            additionalMonthlyContribution = assetShortfall / n;
        }
    }

    return {
        targetIncome,
        projectedIncome,
        gap,
        gapPercentage,
        isShortfall,
        additionalMonthlyContribution: Math.round(additionalMonthlyContribution)
    };
}

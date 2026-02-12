import { STRATEGIES, TICKERS } from './presets';
import type { PortfolioStrategy } from '@/types';

function generateDynamicStrategy(targetReturn: number): PortfolioStrategy | null {
    // Assumptions (Conservative based on historical data)
    const RETURN_NASDAQ = 13.0; // Historically 18%+, but conservative 13%
    const RETURN_SP500 = 10.0;
    const RETURN_BOND = 4.0;
    const MDD_NASDAQ = 50; // QQQ MDD
    const MDD_SP500 = 50;  // SPY MDD
    const MDD_BOND = 15;   // TLT MDD

    if (targetReturn <= 10.0) return null; // Use presets for <= 10%

    // If target > 13.0, cap at 13.0 for safety (Max NASDAQ)
    const effectiveTarget = Math.min(targetReturn, 13.0);

    // Calculate Ratio: (w_nasdaq * 13) + (w_bond * 4) = target
    // Assume primarily equity driven.
    // Let's mix NASDAQ (Aggressive) + SP500 (Base) + Bonds (Safety)

    // Simple Algo: 
    // If target > 11.5%: High NASDAQ mix
    // If target > 10.0%: SP500 + NASDAQ mix

    let w_nasdaq = 0;
    let w_sp500 = 0;
    let w_bond = 0;

    if (effectiveTarget >= 12.0) {
        // Skew heavily to NASDAQ
        // Ex: 12.5% -> (13 * 0.9) + (4 * 0.1) = 11.7 + 0.4 = 12.1%
        w_nasdaq = 80;
        w_sp500 = 10;
        w_bond = 10;
    } else {
        // Mix SP500 and NASDAQ
        // Ex: 11% -> (13 * 0.4) + (10 * 0.5) + (4 * 0.1) = 5.2 + 5.0 + 0.4 = 10.6%
        w_nasdaq = 40;
        w_sp500 = 50;
        w_bond = 10;
    }

    // Expected Metrics
    const expReturn = (w_nasdaq * RETURN_NASDAQ + w_sp500 * RETURN_SP500 + w_bond * RETURN_BOND) / 100;
    const expMDD = (w_nasdaq * MDD_NASDAQ + w_sp500 * MDD_SP500 + w_bond * MDD_BOND) / 100;

    return {
        id: 'custom_ai_growth',
        name: 'AI High Growth Dynamic',
        nameKo: 'AI 맞춤형 초고수익 전략',
        description: `회원님의 높은 목표 수익률(${targetReturn}%)을 달성하기 위해 특별히 설계된 나스닥 중심의 고성장 포트폴리오입니다.`,
        allocation: { stocks: w_nasdaq + w_sp500, bonds: w_bond, gold: 0, cash: 0 },
        expectedReturn: Number(expReturn.toFixed(1)),
        expectedMDD: Number(expMDD.toFixed(0)),
        etfList: [
            { ...TICKERS.US_NASDAQ100, assetClass: 'stocks' as 'stocks', weight: w_nasdaq },
            { ...TICKERS.US_SP500, assetClass: 'stocks' as 'stocks', weight: w_sp500 },
            { ...TICKERS.US_TOTAL_BOND, assetClass: 'bonds' as 'bonds', weight: w_bond },
        ].filter(e => e.weight > 0)
    };
}

export function getRecommendedStrategy(targetReturn: number, maxDrawdown: number): { recommended: PortfolioStrategy, alternatives: PortfolioStrategy[] } {
    // 0. Dynamic Strategy Check
    const dynamicStrategy = generateDynamicStrategy(targetReturn);

    let candidates = STRATEGIES.map(strategy => {
        // 1. MDD Filter: Exclude if strategy MDD is significantly higher than user tolerance (+5% buffer)
        if (strategy.expectedMDD > maxDrawdown + 5) {
            return { strategy, distance: 9999, reason: 'Risk too high' };
        }

        // 2. Score Calculation
        const returnDiff = Math.abs(strategy.expectedReturn - targetReturn);
        const mddDiff = strategy.expectedMDD - maxDrawdown;
        const mddPenalty = mddDiff > 0 ? mddDiff * 2 : 0; // Penalize exceeding MDD
        const safetyBonus = mddDiff < 0 ? Math.abs(mddDiff) * 0.1 : 0; // Slight preference for safer portfolios if returns match

        const score = (returnDiff * 2) + mddPenalty - safetyBonus;

        let reason = '';
        if (returnDiff < 1) reason = '목표 수익률과 거의 일치합니다.';
        else if (strategy.expectedReturn > targetReturn) reason = '목표보다 높은 수익이 기대됩니다.';
        else reason = '안정적이지만 목표 수익률보다는 다소 낮습니다.';

        // Add risk context
        if (strategy.expectedMDD < maxDrawdown - 5) reason += ' (매우 안정적)';
        else if (strategy.expectedMDD > maxDrawdown) reason += ' (다소 공격적)';
        else reason += ' (적절한 위험도)';

        return {
            strategy,
            distance: score,
            reason
        };
    });

    // Sort by score (ascending)
    const sorted = candidates.sort((a, b) => a.distance - b.distance);

    // Check if Dynamic Strategy is better
    if (dynamicStrategy) {
        // Force recommend dynamic if target > 10
        return {
            recommended: dynamicStrategy,
            alternatives: [sorted[0].strategy, sorted[1].strategy]
        };
    }

    // Pick top 1 and next 2 distinct
    const recommended = sorted[0].strategy;

    // Alternatives: Pick next best strategies that are NOT the recommended one
    const alternatives = sorted.slice(1, 10)
        .filter(c => c.distance < 1000) // Filter out filtered ones
        .slice(0, 2)
        .map(c => c.strategy);

    return { recommended, alternatives };
}

export function getRecommendationReason(strategy: PortfolioStrategy, targetReturn: number, maxDrawdown: number): string {
    if (strategy.id === 'custom_ai_growth') {
        return "기존 안전형 ETF 포트폴리오로는 달성하기 어려운 높은 수익률을 목표로 하셔서, 기술주 중심의 고성장 배분을 새롭게 구성했습니다.";
    }

    // Legacy warning for manual selection of lower return strategies when target is high
    if (targetReturn > 10.0 && strategy.expectedReturn <= 10.0) {
        return "현재 안전한 ETF 포트폴리오로 연 10% 이상을 꾸준히 달성하는 것은 매우 어렵습니다. 대신, 허용하신 위험 범위 내에서 가장 높은 수익을 기대할 수 있는 전략(약 10%)을 제안합니다.";
    }

    const returnDiff = strategy.expectedReturn - targetReturn;
    const mddDiff = maxDrawdown - strategy.expectedMDD;

    if (Math.abs(returnDiff) < 1.0) {
        return "회원님의 목표 수익률에 가장 부합하는 전략입니다.";
    } else if (returnDiff >= 1.0) {
        if (mddDiff >= 0) return "목표보다 기대 수익이 높으면서도, 허용 위험 범위(MDD) 내에 있습니다.";
        else return "목표 수익을 초과 달성할 수 있으나, 위험도가 허용치보다 약간 높습니다.";
    } else { // returnDiff <= -1.0
        if (mddDiff > 10) return "목표 수익보다는 낮지만, 매우 안정적인 자산 보호가 장점입니다.";
        else return "안정성을 최우선으로 고려한 추천입니다.";
    }
}

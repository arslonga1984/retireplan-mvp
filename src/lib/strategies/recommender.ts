import { STRATEGIES } from './presets';
import type { PortfolioStrategy } from '@/types';

export function getRecommendedStrategy(targetReturn: number, maxDrawdown: number): { recommended: PortfolioStrategy, alternatives: PortfolioStrategy[] } {
    const candidates = STRATEGIES.map(strategy => {
        // 1. MDD Filter: Exclude if strategy MDD is significantly higher than user tolerance (+5% buffer)
        if (strategy.expectedMDD > maxDrawdown + 5) {
            return { strategy, distance: 9999, reason: 'Risk too high' };
        }

        // 2. Score Calculation
        // We want to minimize distance.
        // Return Difference is weighted heavily (we want to meet the goal)
        // Risk Difference is weighted: being safer than MDD is fine, being riskier is penalized.

        const returnDiff = Math.abs(strategy.expectedReturn - targetReturn);

        // If strategy is safer (MDD < UserMDD), distance is small. 
        // If strategy is riskier (MDD > UserMDD), distance includes the penalty.
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

    // Pick top 1 and next 2 distinct
    const recommended = sorted[0].strategy;

    // Alternatives: Pick next best strategies that are NOT the recommended one
    // And try to offer some variety (e.g. one slightly safer, one slightly more aggressive if possible, but for MVP just next best scores)
    const alternatives = sorted.slice(1, 10)
        .filter(c => c.distance < 1000) // Filter out filtered ones
        .slice(0, 2)
        .map(c => c.strategy);

    return { recommended, alternatives };
}

export function getRecommendationReason(strategy: PortfolioStrategy, targetReturn: number, maxDrawdown: number): string {
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

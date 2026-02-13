import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { runSimulation } from '@/lib/calculations/simulator';
import { formatCompactNumber } from '@/lib/utils';
import type { PortfolioStrategy, UserInputs } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    strategies: PortfolioStrategy[];
    inputs: UserInputs;
}

export default function StrategyComparisonTable({ strategies, inputs }: Props) {
    if (strategies.length < 2) return null;

    const results = strategies.map((s) => {
        const tempInputs = { ...inputs, strategyId: s.id };
        const result = runSimulation(tempInputs, s);
        return {
            strategy: s,
            finalAssets: result.scenarios.median.finalAssets,
            monthlyPayout: result.scenarios.median.monthlyPayout,
            successProbability: result.successProbability,
        };
    });

    const maxAssets = Math.max(...results.map(r => r.finalAssets));
    const maxPayout = Math.max(...results.map(r => r.monthlyPayout));
    const maxProb = Math.max(...results.map(r => r.successProbability));
    const minMdd = Math.min(...strategies.map(s => s.expectedMDD));
    const maxReturn = Math.max(...strategies.map(s => s.expectedReturn));

    return (
        <Card className="mt-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">전략 비교</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-muted-foreground">
                                <th className="text-left py-2 pr-2 font-medium">지표</th>
                                {strategies.map(s => (
                                    <th key={s.id} className="text-center py-2 px-2 font-medium min-w-[100px]">
                                        {s.nameKo}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            <tr className="border-b">
                                <td className="py-2 pr-2 text-muted-foreground">수익률</td>
                                {strategies.map(s => (
                                    <td key={s.id} className={cn("text-center py-2 px-2 font-bold", s.expectedReturn === maxReturn && "text-primary")}>
                                        {s.expectedReturn}%
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 pr-2 text-muted-foreground">MDD</td>
                                {strategies.map(s => (
                                    <td key={s.id} className={cn("text-center py-2 px-2 font-bold", s.expectedMDD === minMdd && "text-green-600")}>
                                        -{s.expectedMDD}%
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 pr-2 text-muted-foreground">자산배분</td>
                                {strategies.map(s => (
                                    <td key={s.id} className="text-center py-2 px-2">
                                        주식 {s.allocation.stocks}%<br />
                                        채권 {s.allocation.bonds}%
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 pr-2 text-muted-foreground">예상 적립금</td>
                                {results.map(r => (
                                    <td key={r.strategy.id} className={cn("text-center py-2 px-2 font-bold", r.finalAssets === maxAssets && "text-primary")}>
                                        {formatCompactNumber(r.finalAssets)}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 pr-2 text-muted-foreground">월 수령액</td>
                                {results.map(r => (
                                    <td key={r.strategy.id} className={cn("text-center py-2 px-2 font-bold", r.monthlyPayout === maxPayout && "text-primary")}>
                                        {formatCompactNumber(r.monthlyPayout)}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-2 pr-2 text-muted-foreground">성공 확률</td>
                                {results.map(r => (
                                    <td key={r.strategy.id} className={cn("text-center py-2 px-2 font-bold", r.successProbability === maxProb && "text-green-600")}>
                                        {r.successProbability}%
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { STRATEGIES } from '@/lib/strategies/presets';
import { getRecommendedStrategy } from '@/lib/strategies/recommender';
import { runSimulation } from '@/lib/calculations/simulator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssetGrowthChart from './AssetGrowthChart';
import PortfolioPieChart from './PortfolioPieChart';
import PayoutChart from './PayoutChart';
import { TrendingUp, CircleDollarSign, CalendarClock, Target } from 'lucide-react';
import MetaHead from '@/components/SEO/MetaHead';
import AdPlaceholder from '@/components/SEO/AdPlaceholder';

export default function Dashboard() {
    const navigate = useNavigate();
    const { inputs, reset } = useAppStore();

    // 전략 찾기
    let strategy = STRATEGIES.find(s => s.id === inputs.strategyId);

    // 만약 custom_ai_growth 라면, 동적으로 다시 생성
    if (!strategy && inputs.strategyId === 'custom_ai_growth') {
        const { recommended } = getRecommendedStrategy(inputs.targetReturn, inputs.maxDrawdown);
        if (recommended.id === 'custom_ai_growth') {
            strategy = recommended;
        }
    }

    // Fallback
    if (!strategy) {
        strategy = STRATEGIES[0];
    }

    // 시뮬레이션 실행
    const result = runSimulation(inputs, strategy);
    const { median } = result.scenarios;

    const onReset = () => {
        reset();
        navigate('/step1');
    };

    const onModify = () => {
        navigate('/step1');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6 pb-20">
            <MetaHead
                title="나의 은퇴 플랜 결과 - RetirePlan"
                description={`은퇴까지 남은 시간 ${result.yearsToRetirement}년, 예상 적립금과 월 수령액을 확인하세요.`}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">나의 은퇴 플랜 결과</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onModify}>수정</Button>
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-destructive hover:text-destructive">초기화</Button>
                </div>
            </div>

            <AdPlaceholder slot="dashboard_top" />

            {/* Gap Analysis Card */}
            {inputs.targetRetirementIncome && inputs.targetRetirementIncome > 0 && (
                <div className="w-full">
                    {(() => {
                        const targetIncome = inputs.targetRetirementIncome;
                        const projectedIncome = median.monthlyPayout;
                        const gap = targetIncome - projectedIncome;
                        const isShortfall = gap > 0;
                        const gapPercentage = Math.abs(gap / targetIncome) * 100;

                        // Shortfall Logic
                        // additionalMonthlyContribution needed?
                        // Simple approximation: (Gap / Projected) * CurrentContribution is roughly proportional?
                        // Better: Reverse calculate FV.
                        // FV_needed = Gap * 12 / (WithdrawalRate) ?? 
                        // More accurate additional contribution calc:
                        // FV_shortfall = Gap * (IsPerpetual ? (12/Rate) : (12 * PayoutYears)) -- Very rough
                        // Let's use simple proportionality to Total Accumulated Capital
                        // Current Capital -> Monthly Payout
                        // Needed Capital = (Target / Payout) * Current Capital
                        // Shortfall Capital = Needed - Current
                        // Additional Monthly = Shortfall Capital / (( (1+r)^n - 1 ) / r) ...

                        // Simplified Proportional Approach:
                        // Current Inputs result in 'median.finalAssets'.
                        // We need 'targetAssets' = finalAssets * (TargetIncome / ProjectedIncome).
                        // Diff = targetAssets - finalAssets.
                        // This Diff must be covered by PMT.
                        // PMT = Diff * r / ((1+r)^n - 1)

                        const r = strategy.expectedReturn / 100 / 12;
                        const n = result.yearsToRetirement * 12;
                        const targetAssets = median.finalAssets * (targetIncome / projectedIncome);
                        const assetShortfall = targetAssets - median.finalAssets;

                        let additionalMonthly = 0;
                        if (isShortfall && r > 0 && n > 0) {
                            additionalMonthly = assetShortfall * r / (Math.pow(1 + r, n) - 1);
                        }

                        return (
                            <Card className={`border-l-4 ${isShortfall ? 'border-l-destructive' : 'border-l-green-500'} mb-6`}>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {isShortfall ? '🚨 은퇴 자금 부족 알림' : '🎉 은퇴 준비 충분'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <p className="text-muted-foreground mb-1">희망 월 생활비</p>
                                            <p className="text-xl font-bold">{formatCurrency(targetIncome)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">예상 월 수령액</p>
                                            <p className={`text-xl font-bold ${isShortfall ? 'text-destructive' : 'text-green-600'}`}>
                                                {formatCurrency(projectedIncome)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">
                                                {isShortfall ? '부족 금액' : '여유 금액'}
                                            </p>
                                            <p className="text-xl font-bold">
                                                {formatCurrency(Math.abs(gap))} ({gapPercentage.toFixed(1)}%)
                                            </p>
                                        </div>
                                    </div>

                                    {isShortfall && (
                                        <div className="mt-4 p-3 bg-destructive/10 rounded-md text-sm">
                                            <p className="font-semibold text-destructive mb-1">솔루션 제안</p>
                                            <p>
                                                목표를 달성하려면 매월 약 <span className="font-bold text-lg">{formatCurrency(additionalMonthly)}</span>을 더 저축해야 합니다.
                                                <br />
                                                또는 은퇴 시기를 늦추거나, 목표 수익률을 높이는 방법을 고려해보세요.
                                            </p>
                                        </div>
                                    )}

                                    {!isShortfall && (
                                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-md text-sm">
                                            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Great Job!</p>
                                            <p>
                                                목표 생활비 대비 약 <span className="font-bold">{gapPercentage.toFixed(1)}%</span>의 여유가 있습니다.
                                                <br />
                                                더 풍요로운 은퇴 생활을 즐기거나, 조기 은퇴를 고려해볼 수 있습니다.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })()}
                </div>
            )}

            {/* 요약 카드 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">투자 기간</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{result.yearsToRetirement}년</div>
                        <p className="text-xs text-muted-foreground">현재 {inputs.currentAge}세 → {inputs.retirementAge}세</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">선택 전략</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate" title={strategy.nameKo}>{strategy.nameKo}</div>
                        <p className="text-xs text-muted-foreground">목표 수익률 {strategy.expectedReturn}%</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">예상 적립금</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-primary">{formatCurrency(median.finalAssets)}</div>
                        <p className="text-xs text-muted-foreground">총 투자원금 {formatCurrency(result.totalContributions)}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">월 수령액</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-primary">{formatCurrency(median.monthlyPayout)}</div>
                        <p className="text-xs text-muted-foreground">{inputs.payoutType === 'perpetual' ? '종신형' : `${inputs.payoutYears}년 확정`}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="growth" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="growth">자산 성장</TabsTrigger>
                    <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
                    <TabsTrigger value="payout">인출 계획</TabsTrigger>
                </TabsList>

                <TabsContent value="growth">
                    <Card>
                        <CardHeader>
                            <CardTitle>자산 성장 시뮬레이션</CardTitle>
                            <p className="text-sm text-muted-foreground">은퇴 시점까지 자산이 어떻게 불어날지 보여줍니다. (물가상승률 미반영 명목금액)</p>
                        </CardHeader>
                        <CardContent>
                            <AssetGrowthChart data={result} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="portfolio">
                    <Card>
                        <CardHeader>
                            <CardTitle>포트폴리오 구성</CardTitle>
                            <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </CardHeader>
                        <CardContent>
                            <PortfolioPieChart strategy={strategy} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payout">
                    <Card>
                        <CardHeader>
                            <CardTitle>연금 수령 시뮬레이션</CardTitle>
                            <p className="text-sm text-muted-foreground">은퇴 후 매월 받을 수 있는 금액입니다.</p>
                        </CardHeader>
                        <CardContent>
                            <PayoutChart
                                finalAssets={median.finalAssets}
                                monthlyPayout={median.monthlyPayout}
                                payoutType={inputs.payoutType}
                                payoutYears={inputs.payoutYears}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AdPlaceholder slot="dashboard_bottom" />
        </div>
    );
}

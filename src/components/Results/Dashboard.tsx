import { useState, useEffect } from 'react';
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
import WhatIfPanel from './WhatIfPanel';
import { TrendingUp, CircleDollarSign, CalendarClock, Target, Loader2 } from 'lucide-react';
import MetaHead from '@/components/SEO/MetaHead';
import AdPlaceholder from '@/components/SEO/AdPlaceholder';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { useCountUp } from '@/lib/hooks/useCountUp';

export default function Dashboard() {
    const navigate = useNavigate();
    const { inputs, reset } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // 전략 찾기
    let strategy = STRATEGIES.find(s => s.id === inputs.strategyId);

    if (!strategy && inputs.strategyId === 'custom_ai_growth') {
        const { recommended } = getRecommendedStrategy(inputs.targetReturn, inputs.maxDrawdown);
        if (recommended.id === 'custom_ai_growth') {
            strategy = recommended;
        }
    }

    if (!strategy) {
        strategy = STRATEGIES[0];
    }

    // 시뮬레이션 실행
    const result = runSimulation(inputs, strategy);
    const { median } = result.scenarios;

    // 카운트업 애니메이션
    const animatedAssets = useCountUp(loading ? 0 : median.finalAssets, 1200);
    const animatedPayout = useCountUp(loading ? 0 : median.monthlyPayout, 1200);

    const onReset = () => {
        reset();
        navigate('/step1');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 page-enter">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-semibold text-muted-foreground">시뮬레이션 분석 중...</p>
                <p className="text-sm text-muted-foreground">최적의 은퇴 플랜을 계산하고 있습니다</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 page-enter">
            <MetaHead
                title="나의 은퇴 플랜 결과 - RetirePlan"
                description={`은퇴까지 남은 시간 ${result.yearsToRetirement}년, 예상 적립금과 월 수령액을 확인하세요.`}
            />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">나의 은퇴 플랜 결과</h1>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-destructive hover:text-destructive">초기화</Button>
                </div>
            </div>

            {/* 스텝별 네비게이션 */}
            <div className="flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/step1')}>기본정보 수정</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/step2')}>목표설정 수정</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/step3')}>전략변경</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/step4')}>수령계획 수정</Button>
            </div>

            <AdPlaceholder slot="dashboard_top" />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">시뮬레이션 가정</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="bg-muted rounded p-2">인플레이션
                        <p className="font-semibold text-sm">{result.assumptions.inflationRate}%</p>
                    </div>
                    <div className="bg-muted rounded p-2">은퇴 전 실질수익률
                        <p className="font-semibold text-sm">{result.assumptions.realExpectedReturnPre}%</p>
                    </div>
                    <div className="bg-muted rounded p-2">은퇴 후 실질수익률
                        <p className="font-semibold text-sm">{result.assumptions.realExpectedReturnPost}%</p>
                    </div>
                    <div className="bg-muted rounded p-2">추정 변동성
                        <p className="font-semibold text-sm">{result.assumptions.estimatedVolatility}%</p>
                    </div>
                    <div className="bg-muted rounded p-2">확률 시뮬레이션
                        <p className="font-semibold text-sm">{result.assumptions.simulationRuns.toLocaleString()}회</p>
                    </div>
                </CardContent>
            </Card>

            {/* Gap Analysis Card */}
            {inputs.targetRetirementIncome && inputs.targetRetirementIncome > 0 && (
                <div className="w-full">
                    {(() => {
                        const { targetIncome, projectedIncome, gap, gapPercentage, isShortfall, additionalMonthlyContribution, nationalPensionAmount, totalRetirementIncome } = result.gapAnalysis;

                        return (
                            <Card className={`border-l-4 ${isShortfall ? 'border-l-destructive' : 'border-l-green-500'} mb-6`}>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {isShortfall ? '은퇴 자금 부족 알림' : '은퇴 준비 충분'}
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
                                                {gap > 0 ? '+' : ''}{formatCurrency(gap)} ({gap > 0 ? '+' : ''}{gapPercentage.toFixed(1)}%)
                                            </p>
                                        </div>
                                    </div>

                                    {nationalPensionAmount > 0 && (
                                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm border border-blue-200 dark:border-blue-800">
                                            <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">국민연금 포함 분석</p>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">개인 투자</p>
                                                    <p className="font-bold">{formatCurrency(projectedIncome)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">국민연금</p>
                                                    <p className="font-bold text-blue-600">+{formatCurrency(nationalPensionAmount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">총 은퇴소득</p>
                                                    <p className="font-bold text-primary">{formatCurrency(totalRetirementIncome)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isShortfall && (
                                        <div className="mt-4 p-3 bg-destructive/10 rounded-md text-sm">
                                            <p className="font-semibold text-destructive mb-2">솔루션 제안</p>
                                            <ul className="space-y-1.5">
                                                <li>
                                                    매월 약 <span className="font-bold text-lg">{formatCurrency(additionalMonthlyContribution)}</span>을 더 저축
                                                    <Button variant="link" size="sm" className="text-xs h-auto p-0 ml-1" onClick={() => navigate('/step1')}>
                                                        → 불입액 수정
                                                    </Button>
                                                </li>
                                                <li>
                                                    은퇴 시기를 늦추기
                                                    <Button variant="link" size="sm" className="text-xs h-auto p-0 ml-1" onClick={() => navigate('/step1')}>
                                                        → 은퇴 연령 수정
                                                    </Button>
                                                </li>
                                                <li>
                                                    목표 수익률 높이기
                                                    <Button variant="link" size="sm" className="text-xs h-auto p-0 ml-1" onClick={() => navigate('/step2')}>
                                                        → 목표 수정
                                                    </Button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {!isShortfall && (
                                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-md text-sm">
                                            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Great Job!</p>
                                            <p>
                                                목표 생활비 대비 약 <span className="font-bold">{gapPercentage.toFixed(1)}%</span>의 여유가 있습니다.
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

            {/* 요약 카드 그리드 - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">예상 적립금 (은퇴 시점)</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary truncate" title={formatCurrency(median.finalAssets)}>
                            {formatCurrency(animatedAssets)}
                        </div>
                        <p className="text-xs text-muted-foreground">총 투자원금 {formatCompactNumber(result.totalContributions)}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">월 수령액 (은퇴 후)</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary truncate" title={formatCurrency(median.monthlyPayout)}>
                            {formatCurrency(animatedPayout)}
                        </div>
                        <p className="text-xs text-muted-foreground">{inputs.payoutType === 'perpetual' ? '종신형' : `${inputs.payoutYears}년 확정`}</p>
                    </CardContent>
                </Card>
            </div>

            {/* 요약 카드 그리드 - Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">투자 기간</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{result.yearsToRetirement}년</div>
                        <p className="text-xs text-muted-foreground">현재 {inputs.currentAge}세 → {inputs.retirementAge}세</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">성공 확률</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-lg font-bold ${result.successProbability >= 70 ? 'text-green-600' : result.successProbability >= 40 ? 'text-yellow-600' : 'text-destructive'}`}>
                            {result.successProbability}%
                        </div>
                        <p className="text-xs text-muted-foreground">목표 달성 확률 (Monte Carlo)</p>
                    </CardContent>
                </Card>

                <Card className="col-span-2 md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">운용 전략</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold break-keep leading-tight" title={strategy.nameKo}>
                            {strategy.nameKo}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">수익률 {strategy.expectedReturn}%</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs h-auto p-0 mt-1"
                            onClick={() => navigate('/step3')}
                        >
                            전략 변경해보기
                        </Button>
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
                            <CardTitle>자산 성장 & 소진 시뮬레이션</CardTitle>
                            <p className="text-sm text-muted-foreground">은퇴 전 적립과 은퇴 후 인출(소진) 과정을 모두 보여줍니다.</p>
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
                            <p className="text-sm text-muted-foreground">명목 월수령액(물가 반영)과 현재가치 월수령액, 잔여 자산 추이를 함께 보여줍니다.</p>
                        </CardHeader>
                        <CardContent>
                            <PayoutChart
                                scenario={median}
                                retirementAge={inputs.retirementAge}
                                payoutType={inputs.payoutType}
                                payoutYears={inputs.payoutYears}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* What-if 민감도 분석 */}
            <WhatIfPanel inputs={inputs} strategy={strategy} baseResult={result} />

            <AdPlaceholder slot="dashboard_bottom" />
        </div>
    );
}

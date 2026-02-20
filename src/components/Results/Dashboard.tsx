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
import GapAnalysisCard from './GapAnalysisCard';
import { TrendingUp, CircleDollarSign, CalendarClock, Target, Loader2 } from 'lucide-react';
import MetaHead from '@/components/SEO/MetaHead';
import AdSense from '@/components/SEO/AdSense';
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

            <AdSense slot="dashboard_top" format="horizontal" />

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
                <GapAnalysisCard gapAnalysis={result.gapAnalysis} />
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
                    <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
                        <div className="relative flex items-center justify-center w-32 h-16 overflow-hidden">
                            {/* Gauge SVG */}
                            <svg viewBox="0 0 100 50" className="w-full h-full">
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <path
                                    d="M 10 50 A 40 40 0 0 1 90 50"
                                    fill="none"
                                    stroke={result.successProbability >= 70 ? '#16a34a' : result.successProbability >= 40 ? '#ca8a04' : '#dc2626'}
                                    strokeWidth="10"
                                    strokeDasharray="126"
                                    strokeDashoffset={126 - (126 * result.successProbability) / 100}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute top-8 text-xl font-bold">
                                {result.successProbability}%
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">목표 달성 확률 (Monte Carlo)</p>
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

            <AdSense slot="dashboard_mid" format="rectangle" />

            {/* What-if 민감도 분석 */}
            <WhatIfPanel inputs={inputs} strategy={strategy} baseResult={result} />

            <AdSense slot="dashboard_bottom" format="horizontal" />
        </div>
    );
}

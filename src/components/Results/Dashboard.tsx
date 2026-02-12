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

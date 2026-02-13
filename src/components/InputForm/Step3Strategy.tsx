import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { STRATEGIES } from '@/lib/strategies/presets';
import { getRecommendedStrategy, getRecommendationReason } from '@/lib/strategies/recommender';
import ProgressBar from '@/components/Layout/ProgressBar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import MetaHead from '@/components/SEO/MetaHead';
import StrategyComparisonTable from './StrategyComparisonTable';
import type { PortfolioStrategy } from '@/types';


export default function Step3Strategy() {
    const navigate = useNavigate();
    const { inputs, setInputs } = useAppStore();

    const [recommendations] = useState(() => {
        const { recommended, alternatives } = getRecommendedStrategy(inputs.targetReturn, inputs.maxDrawdown);
        return { recommended, alternatives };
    });

    const [selectedStrategyId, setSelectedStrategyId] = useState<string>(inputs.strategyId || recommendations.recommended.id);
    const [showAll, setShowAll] = useState(false);
    const [compareIds, setCompareIds] = useState<string[]>([]);

    useEffect(() => {
        if (!inputs.strategyId) {
            setSelectedStrategyId(recommendations.recommended.id);
        }
    }, [inputs.strategyId, recommendations.recommended.id]);

    const toggleCompare = (strategyId: string) => {
        setCompareIds(prev => {
            if (prev.includes(strategyId)) {
                return prev.filter(id => id !== strategyId);
            }
            if (prev.length >= 3) return prev;
            return [...prev, strategyId];
        });
    };

    const onSubmit = () => {
        setInputs({ strategyId: selectedStrategyId });
        navigate('/step4');
    };

    // 모든 전략 통합 (비교용)
    const allStrategies = [
        recommendations.recommended,
        ...recommendations.alternatives,
        ...STRATEGIES.filter(s => s.id !== recommendations.recommended.id && !recommendations.alternatives.find(a => a.id === s.id)),
    ];
    const compareStrategies: PortfolioStrategy[] = compareIds
        .map(id => allStrategies.find(s => s.id === id))
        .filter((s): s is PortfolioStrategy => !!s);

    const renderStrategyCard = (strategy: typeof STRATEGIES[0], isRecommended = false) => {
        const isSelected = selectedStrategyId === strategy.id;
        const isComparing = compareIds.includes(strategy.id);
        return (
            <div key={strategy.id} className="relative">
                <Label
                    htmlFor={strategy.id}
                    className={cn(
                        "flex items-start space-x-4 space-y-0 rounded-md border p-4 hover:bg-muted cursor-pointer transition-all relative",
                        isSelected ? "border-primary bg-muted/50 ring-1 ring-ring" : "",
                        isRecommended ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20" : ""
                    )}
                >
                    {isRecommended && (
                        <div className="absolute -top-3 left-4 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold animate-pulse">
                            <Star className="w-3 h-3 fill-white" /> AI 추천
                        </div>
                    )}

                    <RadioGroupItem value={strategy.id} id={strategy.id} className="mt-1" />
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold leading-none mr-2 text-base">
                                {strategy.nameKo} <span className="text-xs text-muted-foreground ml-1 font-normal">({strategy.name})</span>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground pb-2">
                            {strategy.description}
                        </div>

                        {isRecommended && (
                            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                                {getRecommendationReason(strategy, inputs.targetReturn, inputs.maxDrawdown)}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs bg-background p-2 rounded shadow-sm border">
                            <div>예상 연 수익률: <span className={cn("font-bold", strategy.expectedReturn >= inputs.targetReturn ? "text-primary" : "text-muted-foreground")}>{strategy.expectedReturn}%</span></div>
                            <div>예상 최대 손실(MDD): <span className={cn("font-bold", strategy.expectedMDD <= inputs.maxDrawdown ? "text-green-600" : "text-destructive")}>-{strategy.expectedMDD}%</span></div>
                        </div>

                        <div className="flex gap-1 mt-2 flex-wrap">
                            {Object.entries(strategy.allocation).map(([asset, weight]) => (
                                weight > 0 && <span key={asset} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded uppercase">{asset}: {weight}%</span>
                            ))}
                        </div>
                    </div>
                </Label>
                {/* 비교 체크박스 */}
                <div
                    className="absolute top-2 right-2 flex items-center gap-1 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isComparing}
                        onCheckedChange={() => toggleCompare(strategy.id)}
                        disabled={!isComparing && compareIds.length >= 3}
                        className="h-4 w-4"
                    />
                    <span className="text-[10px] text-muted-foreground">비교</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20 page-enter">
            <MetaHead title="AI 맞춤 전략 추천 - RetirePlan" />
            <ProgressBar currentStep={3} totalSteps={4} />
            <Card>
                <CardHeader>
                    <CardTitle>Step 3: AI 맞춤 전략 추천</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        회원님의 목표(수익률 {inputs.targetReturn}%, MDD -{inputs.maxDrawdown}%)를 분석하여 최적의 포트폴리오를 제안합니다.
                    </p>
                    {compareIds.length > 0 && (
                        <p className="text-xs text-primary font-medium">
                            {compareIds.length}/3개 전략 비교 선택됨
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={selectedStrategyId}
                        onValueChange={setSelectedStrategyId}
                        className="grid gap-4"
                    >
                        {/* 1. Recommended Strategy */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> 최적 추천 전략
                            </h3>
                            {renderStrategyCard(recommendations.recommended, true)}
                        </div>

                        {/* 2. Alternative Strategies */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">다른 추천 옵션</h3>
                            <div className="grid gap-3">
                                {recommendations.alternatives.map(strategy => renderStrategyCard(strategy))}
                            </div>
                        </div>

                        {/* 3. Show All Toggle */}
                        <div className="pt-2 border-t">
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground text-xs flex items-center justify-center gap-1 hover:text-foreground"
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? '전체 리스트 접기' : '전체 20개 전략 보기'}
                                {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </Button>

                            {showAll && (
                                <div className="grid gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                                    {STRATEGIES
                                        .filter(s => s.id !== recommendations.recommended.id && !recommendations.alternatives.find(a => a.id === s.id))
                                        .map(strategy => renderStrategyCard(strategy))
                                    }
                                </div>
                            )}
                        </div>
                    </RadioGroup>

                    {/* 전략 비교 테이블 */}
                    {compareStrategies.length >= 2 && (
                        <StrategyComparisonTable strategies={compareStrategies} inputs={inputs} />
                    )}

                    <div className="flex gap-2 mt-8 sticky bottom-0 bg-background pt-4 border-t">
                        <Button variant="outline" className="w-full" onClick={() => navigate('/step2')}>
                            이전 단계
                        </Button>
                        <Button className="w-full" onClick={onSubmit}>
                            선택 완료
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { runSimulation } from '@/lib/calculations/simulator';
import { formatCompactNumber } from '@/lib/utils';
import type { UserInputs, PortfolioStrategy, SimulationResult } from '@/types';

interface Props {
    inputs: UserInputs;
    strategy: PortfolioStrategy;
    baseResult: SimulationResult;
}

export default function WhatIfPanel({ inputs, strategy, baseResult }: Props) {
    const [open, setOpen] = useState(false);
    const [contributionMultiplier, setContributionMultiplier] = useState(1.0);
    const [retirementAgeOffset, setRetirementAgeOffset] = useState(0);

    const adjustedResult = useMemo(() => {
        const adjustedInputs: UserInputs = {
            ...inputs,
            monthlyContribution: Math.round(inputs.monthlyContribution * contributionMultiplier),
            retirementAge: inputs.retirementAge + retirementAgeOffset,
        };

        // 은퇴 연령이 현재 나이 이하가 되지 않도록
        if (adjustedInputs.retirementAge <= adjustedInputs.currentAge) {
            return null;
        }

        return runSimulation(adjustedInputs, strategy);
    }, [inputs, strategy, contributionMultiplier, retirementAgeOffset]);

    const hasChanges = contributionMultiplier !== 1.0 || retirementAgeOffset !== 0;

    const basePayout = baseResult.scenarios.median.monthlyPayout;
    const baseAssets = baseResult.scenarios.median.finalAssets;
    const adjustedPayout = adjustedResult?.scenarios.median.monthlyPayout ?? basePayout;
    const adjustedAssets = adjustedResult?.scenarios.median.finalAssets ?? baseAssets;

    const payoutDiff = adjustedPayout - basePayout;
    const assetsDiff = adjustedAssets - baseAssets;

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">What-if 민감도 분석</CardTitle>
                    <Button variant="ghost" size="sm">
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {!open && (
                    <p className="text-sm text-muted-foreground">불입액이나 은퇴 시기를 바꾸면 결과가 어떻게 달라질까요?</p>
                )}
            </CardHeader>

            {open && (
                <CardContent className="space-y-6">
                    {/* 월 불입 조절 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>월 불입액 조절</Label>
                            <span className="text-sm font-bold text-primary">
                                {contributionMultiplier.toFixed(1)}x ({formatCompactNumber(Math.round(inputs.monthlyContribution * contributionMultiplier))})
                            </span>
                        </div>
                        <Slider
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[contributionMultiplier]}
                            onValueChange={(v) => setContributionMultiplier(v[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0.5x</span>
                            <span>1.0x (현재)</span>
                            <span>2.0x</span>
                        </div>
                    </div>

                    {/* 은퇴 연령 조절 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>은퇴 연령 조절</Label>
                            <span className="text-sm font-bold text-primary">
                                {retirementAgeOffset > 0 ? '+' : ''}{retirementAgeOffset}년 ({inputs.retirementAge + retirementAgeOffset}세)
                            </span>
                        </div>
                        <Slider
                            min={-5}
                            max={5}
                            step={1}
                            value={[retirementAgeOffset]}
                            onValueChange={(v) => setRetirementAgeOffset(v[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>-5년</span>
                            <span>현재</span>
                            <span>+5년</span>
                        </div>
                    </div>

                    {/* 비교 결과 */}
                    {hasChanges && adjustedResult && (
                        <div className="border rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold">현재 vs 변경 비교</h4>
                            <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                <div></div>
                                <div className="text-muted-foreground font-medium">현재</div>
                                <div className="text-primary font-medium">변경</div>

                                <div className="text-left text-muted-foreground">예상 적립금</div>
                                <div>{formatCompactNumber(baseAssets)}</div>
                                <div className="font-bold">
                                    {formatCompactNumber(adjustedAssets)}
                                    <span className={`text-xs ml-1 ${assetsDiff >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        ({assetsDiff >= 0 ? '+' : ''}{formatCompactNumber(assetsDiff)})
                                    </span>
                                </div>

                                <div className="text-left text-muted-foreground">월 수령액</div>
                                <div>{formatCompactNumber(basePayout)}</div>
                                <div className="font-bold">
                                    {formatCompactNumber(adjustedPayout)}
                                    <span className={`text-xs ml-1 ${payoutDiff >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        ({payoutDiff >= 0 ? '+' : ''}{formatCompactNumber(payoutDiff)})
                                    </span>
                                </div>

                                <div className="text-left text-muted-foreground">성공 확률</div>
                                <div>{baseResult.successProbability}%</div>
                                <div className="font-bold">{adjustedResult.successProbability}%</div>
                            </div>
                        </div>
                    )}

                    {!hasChanges && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            슬라이더를 조절하여 다양한 시나리오를 확인해보세요.
                        </p>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import ProgressBar from '@/components/Layout/ProgressBar';
import MetaHead from '@/components/SEO/MetaHead';
import { STRATEGIES } from '@/lib/strategies/presets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function Step4Payout() {
    const navigate = useNavigate();
    const { inputs, setInputs } = useAppStore();

    const [payoutType, setPayoutType] = useState<'perpetual' | 'fixed'>(inputs.payoutType);
    const [payoutYears, setPayoutYears] = useState<number>(inputs.payoutYears || 20);
    const [inflationAdjusted, setInflationAdjusted] = useState<boolean>(inputs.inflationAdjusted);
    const [postRetirementStrategyId, setPostRetirementStrategyId] = useState<string>(inputs.postRetirementStrategyId || inputs.strategyId || 'permanent');


    const onSubmit = () => {
        setInputs({
            payoutType,
            payoutYears: payoutType === 'fixed' ? payoutYears : undefined,
            inflationAdjusted,
            postRetirementStrategyId
        });
        navigate('/result');
    };

    return (
        <div className="space-y-6 page-enter">
            <MetaHead title="연금 수령 계획 - RetirePlan" />
            <ProgressBar currentStep={4} totalSteps={4} />
            <Card>
                <CardHeader>
                    <CardTitle>Step 4: 연금 수령 계획</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        은퇴 후 자산을 어떻게 수령할지 결정합니다.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label>수령 방식</Label>
                        <RadioGroup
                            value={payoutType}
                            onValueChange={(val) => setPayoutType(val as 'perpetual' | 'fixed')}
                            className="grid gap-4"
                        >
                            <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="perpetual" id="perpetual" />
                                <Label htmlFor="perpetual" className="flex-1 cursor-pointer">
                                    <span className="block font-semibold">종신형 (4% 룰)</span>
                                    <span className="text-xs text-muted-foreground">원금은 보존하면서 투자 수익만 매월 수령 (연 4% 인출)</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="fixed" id="fixed" />
                                <Label htmlFor="fixed" className="flex-1 cursor-pointer">
                                    <span className="block font-semibold">확정 기간형</span>
                                    <span className="text-xs text-muted-foreground">정해진 기간 동안 원금과 수익을 모두 소진하며 수령</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {payoutType === 'fixed' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="payoutYears">수령 기간 (년)</Label>
                            <Input
                                id="payoutYears"
                                type="number"
                                value={payoutYears}
                                onChange={(e) => setPayoutYears(Number(e.target.value))}
                                min={5}
                                max={50}
                            />
                            <p className="text-xs text-muted-foreground">5년 ~ 50년 사이 설정 가능</p>
                        </div>
                    )}

                    <div className="space-y-3 pt-4 border-t">
                        <Label>은퇴 후 운용 전략</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            은퇴 이후에는 자산을 어떻게 운용하시겠습니까? (보통 안정성을 높이는 것이 좋습니다)
                        </p>
                        <Select
                            value={postRetirementStrategyId}
                            onValueChange={setPostRetirementStrategyId}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="전략 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {STRATEGIES.map(strategy => (
                                    <SelectItem key={strategy.id} value={strategy.id}>
                                        <div className="flex flex-col items-start py-1">
                                            <span className="font-medium">{strategy.nameKo}</span>
                                            <span className="text-xs text-muted-foreground">
                                                기대수익 {strategy.expectedReturn}% / MDD -{strategy.expectedMDD}%
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Strategy Details Preview */}
                        <div className="bg-muted p-3 rounded text-sm text-muted-foreground border">
                            {STRATEGIES.find(s => s.id === postRetirementStrategyId)?.description}
                        </div>
                    </div>


                    <div className="flex items-center space-x-2 border p-4 rounded-md bg-muted/20">
                        <Switch
                            id="inflation"
                            checked={inflationAdjusted}
                            onCheckedChange={setInflationAdjusted}
                        />
                        <Label htmlFor="inflation" className="flex-1 cursor-pointer">
                            물가상승률 반영 (연 2%)
                            <span className="block text-xs text-muted-foreground">
                                매년 2% 물가 상승을 반영하여, <strong>현재 가치(구매력) 기준</strong>으로 결과를 보여줍니다.
                            </span>
                        </Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="w-full" onClick={() => navigate('/step3')}>
                            이전 단계
                        </Button>
                        <Button className="w-full" onClick={onSubmit}>결과 보기</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

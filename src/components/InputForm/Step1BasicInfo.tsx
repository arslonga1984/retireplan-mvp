import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProgressBar from '@/components/Layout/ProgressBar';
import MetaHead from '@/components/SEO/MetaHead';
import AmountPresetButtons from './AmountPresetButtons';

const schema = z.object({
    currentAge: z.number().min(25, "25세 이상이어야 합니다").max(65, "65세 이하여야 합니다"),
    retirementAge: z.number().min(55, "55세 이상이어야 합니다").max(70, "70세 이하여야 합니다"),
    currentAssets: z.number().min(0, "0원 이상이어야 합니다"),
    monthlyContribution: z.number().min(0, "0원 이상이어야 합니다"),
    targetRetirementIncome: z.number().min(0, "0원 이상이어야 합니다"),
    nationalPensionAmount: z.number().min(0, "0원 이상이어야 합니다"),
}).refine(data => data.retirementAge > data.currentAge, {
    message: "연금 개시 연령은 현재 나이보다 커야 합니다",
    path: ["retirementAge"],
});

type FormData = z.infer<typeof schema>;

const ASSET_PRESETS = [
    { label: '0원', value: 0 },
    { label: '1,000만', value: 10000000 },
    { label: '3,000만', value: 30000000 },
    { label: '5,000만', value: 50000000 },
    { label: '1억', value: 100000000 },
];

const CONTRIBUTION_PRESETS = [
    { label: '50만', value: 500000 },
    { label: '100만', value: 1000000 },
    { label: '200만', value: 2000000 },
    { label: '300만', value: 3000000 },
];

const INCOME_PRESETS = [
    { label: '200만', value: 2000000 },
    { label: '300만', value: 3000000 },
    { label: '500만', value: 5000000 },
    { label: '700만', value: 7000000 },
];

const PENSION_PRESETS = [
    { label: '0원', value: 0 },
    { label: '50만', value: 500000 },
    { label: '80만', value: 800000 },
    { label: '100만', value: 1000000 },
];

function formatWon(value: number): string {
    if (value === 0) return '0';
    return new Intl.NumberFormat('ko-KR').format(value);
}

export default function Step1BasicInfo() {
    const navigate = useNavigate();
    const { inputs, setInputs } = useAppStore();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            currentAge: inputs.currentAge,
            retirementAge: inputs.retirementAge,
            currentAssets: inputs.currentAssets,
            monthlyContribution: inputs.monthlyContribution,
            targetRetirementIncome: inputs.targetRetirementIncome || 3000000,
            nationalPensionAmount: inputs.nationalPensionAmount || 0,
        },
    });

    const onSubmit = (data: FormData) => {
        setInputs(data);
        navigate('/step2');
    };

    const yearsToRetirement = (form.watch('retirementAge') || 0) - (form.watch('currentAge') || 0);

    return (
        <div className="space-y-6 page-enter">
            <MetaHead title="기본 정보 입력 - RetirePlan" />
            <ProgressBar currentStep={1} totalSteps={4} />
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: 기본 정보 입력</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentAge">현재 나이 (세)</Label>
                                <Input
                                    id="currentAge"
                                    type="number"
                                    placeholder="30"
                                    {...form.register('currentAge', { valueAsNumber: true })}
                                />
                                {form.formState.errors.currentAge && (
                                    <p className="text-sm text-destructive">{form.formState.errors.currentAge.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="retirementAge">은퇴 시기 (세)</Label>
                                <Input
                                    id="retirementAge"
                                    type="number"
                                    placeholder="60"
                                    {...form.register('retirementAge', { valueAsNumber: true })}
                                />
                                {form.formState.errors.retirementAge && (
                                    <p className="text-sm text-destructive">{form.formState.errors.retirementAge.message}</p>
                                )}
                            </div>
                        </div>

                        {yearsToRetirement > 0 && (
                            <div className="p-3 bg-muted rounded-md text-sm text-center">
                                투자 가능 기간: <strong className="text-primary text-lg">{yearsToRetirement}년</strong>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="currentAssets">현재 퇴직연금 자산</Label>
                            <div className="relative">
                                <Controller
                                    control={form.control}
                                    name="currentAssets"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <Input
                                            {...rest}
                                            type="text"
                                            placeholder="0"
                                            value={formatWon(value)}
                                            onChange={(e) => {
                                                const numericValue = Number(e.target.value.replace(/[^0-9]/g, ''));
                                                onChange(numericValue);
                                            }}
                                            className="text-right pr-8"
                                        />
                                    )}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                            </div>
                            <AmountPresetButtons presets={ASSET_PRESETS} onSelect={(v) => form.setValue('currentAssets', v)} />
                            {form.formState.errors.currentAssets && (
                                <p className="text-sm text-destructive">{form.formState.errors.currentAssets.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyContribution">월 추가 불입액</Label>
                            <div className="relative">
                                <Controller
                                    control={form.control}
                                    name="monthlyContribution"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <Input
                                            {...rest}
                                            type="text"
                                            placeholder="500,000"
                                            value={formatWon(value)}
                                            onChange={(e) => {
                                                const numericValue = Number(e.target.value.replace(/[^0-9]/g, ''));
                                                onChange(numericValue);
                                            }}
                                            className="text-right pr-8"
                                        />
                                    )}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                            </div>
                            <AmountPresetButtons presets={CONTRIBUTION_PRESETS} onSelect={(v) => form.setValue('monthlyContribution', v)} />
                            {form.formState.errors.monthlyContribution && (
                                <p className="text-sm text-destructive">{form.formState.errors.monthlyContribution.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetRetirementIncome">희망 은퇴 월 생활비 (현재 가치)</Label>
                            <div className="relative">
                                <Controller
                                    control={form.control}
                                    name="targetRetirementIncome"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <Input
                                            {...rest}
                                            type="text"
                                            placeholder="3,000,000"
                                            value={formatWon(value)}
                                            onChange={(e) => {
                                                const numericValue = Number(e.target.value.replace(/[^0-9]/g, ''));
                                                onChange(numericValue);
                                            }}
                                            className="text-right pr-8"
                                        />
                                    )}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                            </div>
                            <AmountPresetButtons presets={INCOME_PRESETS} onSelect={(v) => form.setValue('targetRetirementIncome', v)} />
                            <p className="text-xs text-muted-foreground">현재 물가 기준으로 은퇴 후 필요한 월 생활비를 입력하세요.</p>
                            {form.formState.errors.targetRetirementIncome && (
                                <p className="text-sm text-destructive">{form.formState.errors.targetRetirementIncome.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label htmlFor="nationalPensionAmount">
                                국민연금 예상 수령액 (선택)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                국민연금공단에서 조회한 예상 월 수령액을 입력하면 더 정확한 분석이 가능합니다.
                            </p>
                            <div className="relative">
                                <Controller
                                    control={form.control}
                                    name="nationalPensionAmount"
                                    render={({ field: { onChange, value, ...rest } }) => (
                                        <Input
                                            {...rest}
                                            type="text"
                                            placeholder="0 (미입력 시 제외)"
                                            value={formatWon(value)}
                                            onChange={(e) => {
                                                const numericValue = Number(e.target.value.replace(/[^0-9]/g, ''));
                                                onChange(numericValue);
                                            }}
                                            className="text-right pr-8"
                                        />
                                    )}
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                            </div>
                            <AmountPresetButtons presets={PENSION_PRESETS} onSelect={(v) => form.setValue('nationalPensionAmount', v)} />
                            {form.formState.errors.nationalPensionAmount && (
                                <p className="text-sm text-destructive">{form.formState.errors.nationalPensionAmount.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full mt-6">다음 단계</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

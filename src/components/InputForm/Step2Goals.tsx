import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProgressBar from '@/components/Layout/ProgressBar';
import MetaHead from '@/components/SEO/MetaHead';

const schema = z.object({
    targetReturn: z.number().min(3, "최소 3% 이상이어야 합니다").max(15, "최대 15% 이하여야 합니다"),
    maxDrawdown: z.number().min(10, "최소 10% 이상이어야 합니다").max(50, "최대 50% 이하여야 합니다"),
});

type FormData = z.infer<typeof schema>;

export default function Step2Goals() {
    const navigate = useNavigate();
    const { inputs, setInputs } = useAppStore();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            targetReturn: inputs.targetReturn,
            maxDrawdown: inputs.maxDrawdown,
        },
    });

    const onSubmit = (data: FormData) => {
        setInputs(data);
        navigate('/step3');
    };

    return (
        <div className="space-y-6">
            <MetaHead title="투자 목표 설정 - RetirePlan" />
            <ProgressBar currentStep={2} totalSteps={4} />
            <Card>
                <CardHeader>
                    <CardTitle>Step 2: 투자 목표 설정</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="targetReturn">목표 연 수익률 (%)</Label>
                                <span className="text-sm font-bold text-primary">{form.watch('targetReturn')}%</span>
                            </div>
                            <Slider
                                min={3}
                                max={15}
                                step={0.5}
                                value={[form.watch('targetReturn')]}
                                onValueChange={(value) => form.setValue('targetReturn', value[0])}
                            />
                            <Input
                                id="targetReturn"
                                type="number"
                                className="hidden" // Hidden input for form submission if needed, or just rely on react-hook-form state
                                {...form.register('targetReturn', { valueAsNumber: true })}
                            />
                            {form.formState.errors.targetReturn && (
                                <p className="text-sm text-destructive">{form.formState.errors.targetReturn.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                일반적인 장기 투자 수익률은 5~10% 수준입니다. 높을수록 위험도(MDD)가 커집니다.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="maxDrawdown">허용 가능한 최대 손실률 (MDD, %)</Label>
                                <span className="text-sm font-bold text-destructive">-{form.watch('maxDrawdown')}%</span>
                            </div>
                            <Slider
                                min={10}
                                max={50}
                                step={1}
                                value={[form.watch('maxDrawdown')]}
                                onValueChange={(value) => form.setValue('maxDrawdown', value[0])}
                            />
                            <Input
                                id="maxDrawdown"
                                type="number"
                                className="hidden"
                                {...form.register('maxDrawdown', { valueAsNumber: true })}
                            />
                            {form.formState.errors.maxDrawdown && (
                                <p className="text-sm text-destructive">{form.formState.errors.maxDrawdown.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                최악의 상황에서 일시적으로 자산이 얼마나 줄어들어도 견딜 수 있는지 설정하세요.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/step1')}>
                                이전 단계
                            </Button>
                            <Button type="submit" className="w-full">다음 단계</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

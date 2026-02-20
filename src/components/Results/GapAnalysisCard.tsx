import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import type { GapAnalysisResult } from '@/types';

interface GapAnalysisCardProps {
    gapAnalysis: GapAnalysisResult;
}

export default function GapAnalysisCard({ gapAnalysis }: GapAnalysisCardProps) {
    const navigate = useNavigate();
    const {
        targetIncome,
        projectedIncome,
        gap,
        gapPercentage,
        isShortfall,
        additionalMonthlyContribution,
        nationalPensionAmount,
        totalRetirementIncome,
    } = gapAnalysis;

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
                        <p className="text-muted-foreground mb-1">
                            {nationalPensionAmount > 0 ? '총 예상 월 수령액' : '예상 월 수령액'}
                        </p>
                        <div className="flex flex-col">
                            <p className={`text-xl font-bold ${isShortfall ? 'text-destructive' : 'text-green-600'}`}>
                                {formatCurrency(totalRetirementIncome)}
                            </p>
                            {nationalPensionAmount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    (개인 {formatCompactNumber(projectedIncome)} + 국민 {formatCompactNumber(nationalPensionAmount)})
                                </span>
                            )}
                        </div>
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
}

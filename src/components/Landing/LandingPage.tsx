import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Target, Clock } from 'lucide-react';
import MetaHead from '@/components/SEO/MetaHead';

const FEATURES = [
    {
        icon: TrendingUp,
        title: 'AI 맞춤 전략',
        description: '목표 수익률과 위험 허용 범위에 맞는 최적의 투자 전략을 AI가 추천합니다.',
    },
    {
        icon: Shield,
        title: '위험 관리',
        description: '최악/평균/최선 3가지 시나리오로 은퇴 자금의 안전성을 검증합니다.',
    },
    {
        icon: Target,
        title: '갭 분석',
        description: '희망 생활비 대비 부족액을 분석하고 구체적인 솔루션을 제안합니다.',
    },
    {
        icon: Clock,
        title: '3분 완성',
        description: '4단계 간단 입력으로 나만의 은퇴 플랜을 즉시 확인할 수 있습니다.',
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 py-8 page-enter">
            <MetaHead
                title="RetirePlan AI - 나만의 퇴직연금 시뮬레이터"
                description="AI가 추천하는 맞춤 투자 전략으로 은퇴를 준비하세요. 3분이면 충분합니다."
            />

            {/* Hero */}
            <section className="text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                    은퇴 준비,
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        AI가 도와드립니다
                    </span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    목표 수익률과 위험 성향에 맞는 최적의 퇴직연금 전략을 찾아보세요.
                    국민연금과 함께 종합적인 은퇴 플랜을 세울 수 있습니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" className="text-base px-8" onClick={() => navigate('/step1')}>
                        무료로 시뮬레이션 시작
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">회원가입 없이 바로 시작 가능</p>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map((feature) => (
                    <Card key={feature.title} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <feature.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* How it works */}
            <section className="text-center space-y-4">
                <h3 className="text-xl font-bold">이렇게 진행됩니다</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {['기본정보', '목표설정', '전략선택', '결과확인'].map((step, i) => (
                        <div key={step} className="space-y-1">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold">
                                {i + 1}
                            </div>
                            <p className="text-xs text-muted-foreground">{step}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="text-center">
                <Button size="lg" onClick={() => navigate('/step1')}>
                    지금 시작하기
                </Button>
            </section>
        </div>
    );
}

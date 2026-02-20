import MetaHead from '@/components/SEO/MetaHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function Contact() {
    return (
        <div className="space-y-6 py-4 page-enter max-w-prose mx-auto">
            <MetaHead
                title="문의하기 - RetirePlan AI"
                description="RetirePlan AI 서비스에 대한 문의사항을 보내주세요."
            />

            <h1 className="text-2xl font-bold">문의하기</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        이메일 문의
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        서비스 관련 문의, 버그 신고, 제휴 제안 등은 아래 이메일로 보내주세요.
                    </p>
                    <a
                        href="mailto:contact@retireplan.co.kr"
                        className="inline-flex items-center gap-2 text-primary underline text-sm"
                    >
                        contact@retireplan.co.kr
                    </a>
                    <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                        <p className="font-medium text-foreground">문의 시 참고사항</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>버그 신고 시 사용 브라우저, OS 정보를 함께 보내주시면 빠른 처리에 도움이 됩니다.</li>
                            <li>투자 자문이나 재무 상담은 제공하지 않습니다.</li>
                            <li>답변은 영업일 기준 1~3일 이내 회신드립니다.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

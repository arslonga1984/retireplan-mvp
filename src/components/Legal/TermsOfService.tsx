import { Link } from 'react-router-dom';
import MetaHead from '@/components/SEO/MetaHead';

export default function TermsOfService() {
    return (
        <div className="space-y-6 py-4 page-enter max-w-prose mx-auto">
            <MetaHead
                title="이용약관 - RetirePlan AI"
                description="RetirePlan AI 서비스 이용약관입니다."
            />

            <h1 className="text-2xl font-bold">이용약관</h1>
            <p className="text-sm text-muted-foreground">최종 수정일: 2026년 2월 13일</p>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">1. 서비스 소개</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    RetirePlan AI(이하 "서비스")는 퇴직연금 및 은퇴 자금 계획을 위한 시뮬레이션 도구입니다.
                    사용자의 입력 정보를 바탕으로 예상 적립금, 월 수령액, 투자 전략 등을 시뮬레이션합니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">2. 면책 조항 (중요)</h2>
                <div className="p-4 bg-destructive/10 rounded-lg text-sm space-y-2">
                    <p className="font-semibold text-destructive">
                        본 서비스의 시뮬레이션 결과는 참고용이며, 투자 자문이나 재무 상담이 아닙니다.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                        <li>시뮬레이션 결과는 과거 데이터 및 가정에 기반하며, 미래 수익을 보장하지 않습니다.</li>
                        <li>실제 투자 결정은 공인 재무설계사 또는 전문가와 상담 후 진행하시기 바랍니다.</li>
                        <li>본 서비스 이용으로 발생하는 투자 손실에 대해 책임지지 않습니다.</li>
                        <li>세금, 수수료 등 실제 비용은 별도 고려해야 합니다.</li>
                    </ul>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">3. 이용 조건</h2>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                    <li>서비스는 무료로 제공되며, 회원가입 없이 이용 가능합니다.</li>
                    <li>서비스는 광고 수익으로 운영됩니다.</li>
                    <li>만 14세 이상의 이용자를 대상으로 합니다.</li>
                    <li>서비스를 상업적 목적으로 무단 복제, 배포하는 행위는 금지됩니다.</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">4. 지적 재산권</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    서비스의 디자인, 코드, 콘텐츠에 대한 저작권은 RetirePlan AI에 있습니다.
                    사용자가 입력한 데이터와 시뮬레이션 결과는 사용자에게 귀속됩니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">5. 서비스 변경 및 중단</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    서비스 제공자는 사전 통지 없이 서비스의 내용을 변경하거나 중단할 수 있습니다.
                    서비스 변경 또는 중단으로 인한 손해에 대해 책임지지 않습니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">6. 약관 변경</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내에 공지합니다.
                    변경된 약관은 공지 후 계속 서비스를 이용하는 경우 동의한 것으로 간주합니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">7. 문의</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    이용약관에 대한 문의사항은{' '}
                    <Link to="/contact" className="text-primary underline">문의하기</Link> 페이지를 이용해주세요.
                </p>
            </section>
        </div>
    );
}

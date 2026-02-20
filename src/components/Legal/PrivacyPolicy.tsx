import { Link } from 'react-router-dom';
import MetaHead from '@/components/SEO/MetaHead';

export default function PrivacyPolicy() {
    return (
        <div className="space-y-6 py-4 page-enter max-w-prose mx-auto">
            <MetaHead
                title="개인정보처리방침 - RetirePlan AI"
                description="RetirePlan AI 서비스의 개인정보처리방침입니다."
            />

            <h1 className="text-2xl font-bold">개인정보처리방침</h1>
            <p className="text-sm text-muted-foreground">최종 수정일: 2026년 2월 13일</p>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">1. 수집하는 개인정보</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    RetirePlan AI(이하 "서비스")는 회원가입 없이 이용 가능하며,
                    별도의 개인정보를 수집하지 않습니다. 사용자가 입력하는 나이, 자산, 투자 금액 등의 정보는
                    브라우저의 로컬 스토리지에만 저장되며 서버로 전송되지 않습니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">2. 자동 수집 정보</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    서비스 품질 개선을 위해 다음 정보가 자동으로 수집될 수 있습니다:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                    <li>방문 페이지, 체류 시간, 클릭 이벤트 (Google Analytics 4)</li>
                    <li>브라우저 종류, 운영체제, 화면 해상도</li>
                    <li>접속 국가/지역 (IP 기반, 익명화 처리)</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">3. 쿠키 및 광고</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    본 서비스는 Google AdSense를 통해 광고를 제공하며, 이를 위해 쿠키가 사용될 수 있습니다.
                    Google의 광고 쿠키 사용에 대한 자세한 내용은{' '}
                    <a
                        href="https://policies.google.com/technologies/ads"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                    >
                        Google 광고 정책
                    </a>
                    을 참고하세요.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    사용자는 브라우저 설정에서 쿠키를 비활성화할 수 있으며,{' '}
                    <a
                        href="https://www.google.com/settings/ads"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                    >
                        Google 광고 설정
                    </a>
                    에서 맞춤 광고를 해제할 수 있습니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">4. 데이터 보관 및 삭제</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    모든 시뮬레이션 데이터는 사용자의 브라우저 로컬 스토리지에 저장됩니다.
                    브라우저 데이터를 삭제하면 모든 정보가 즉시 삭제됩니다.
                    Google Analytics 데이터는 14개월간 보관 후 자동 삭제됩니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">5. 제3자 제공</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    수집된 정보는 제3자에게 판매, 임대 또는 공유하지 않습니다.
                    다만, 법률에 의한 요구가 있는 경우 관련 법규에 따라 제공할 수 있습니다.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">6. 문의</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    개인정보처리방침에 대한 문의사항은{' '}
                    <Link to="/contact" className="text-primary underline">문의하기</Link> 페이지를 이용해주세요.
                </p>
            </section>
        </div>
    );
}

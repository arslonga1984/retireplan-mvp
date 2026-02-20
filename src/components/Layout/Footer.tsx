import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30 mt-auto">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link to="/privacy" className="hover:text-foreground transition-colors">
                            개인정보처리방침
                        </Link>
                        <Link to="/terms" className="hover:text-foreground transition-colors">
                            이용약관
                        </Link>
                        <Link to="/contact" className="hover:text-foreground transition-colors">
                            문의하기
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} RetirePlan AI. 투자 자문이 아닌 참고용 시뮬레이션입니다.
                    </p>
                </div>
            </div>
        </footer>
    );
}

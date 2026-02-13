import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

const STEP_LABELS: Record<string, string> = {
    '/step1': 'Step 1/4',
    '/step2': 'Step 2/4',
    '/step3': 'Step 3/4',
    '/step4': 'Step 4/4',
    '/result': '결과',
};

export default function Header() {
    const location = useLocation();
    const { reset } = useAppStore();
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    const stepLabel = STEP_LABELS[location.pathname];

    const handleReset = () => {
        reset();
        window.location.href = '/step1';
    };

    return (
        <header className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    <Link to="/">RetirePlan AI</Link>
                </h1>
                <div className="flex items-center gap-2">
                    {stepLabel && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {stepLabel}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDark(!dark)}
                        title={dark ? '라이트 모드' : '다크 모드'}
                    >
                        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={handleReset}
                        title="초기화"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

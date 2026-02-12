export default function Header() {
    return (
        <header className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    RetirePlan AI
                </h1>
                <nav className="text-sm text-muted-foreground">
                    MVP v1.0
                </nav>
            </div>
        </header>
    );
}

export default function ProgressBar({ currentStep, totalSteps = 4 }: { currentStep: number; totalSteps?: number }) {
    const progress = Math.min((currentStep / totalSteps) * 100, 100);

    return (
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
            <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

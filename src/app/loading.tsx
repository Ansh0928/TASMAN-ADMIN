export default function Loading() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-theme-primary transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-theme-accent/30 border-t-theme-accent rounded-full animate-spin" />
                <p className="text-sm text-theme-text-muted">Loading...</p>
            </div>
        </div>
    );
}

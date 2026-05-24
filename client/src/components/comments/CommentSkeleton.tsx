export default function CommentSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted-whisper shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 rounded-half bg-muted-whisper" />
                        <div className="h-3 w-full rounded-half bg-muted-whisper" />
                        <div className="h-3 w-3/4 rounded-half bg-muted-whisper" />
                    </div>
                </div>
            ))}
        </div>
    );
}

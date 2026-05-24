import { useState } from 'react';

interface CommentFormProps {
    onSubmit: (content: string) => Promise<boolean>;
    placeholder?: string;
    submitLabel?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
}

export default function CommentForm({
    onSubmit,
    placeholder = 'Write a comment...',
    submitLabel = 'Post',
    onCancel,
    autoFocus = false,
}: CommentFormProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const MAX = 2000;

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed) {
            setError('Comment cannot be empty.');
            return;
        }
        if (trimmed.length > MAX) {
            setError(`Max ${MAX} characters allowed.`);
            return;
        }
        setError(null);
        setLoading(true);
        const ok = await onSubmit(trimmed);
        setLoading(false);
        if (ok) {
            setContent('');
            onCancel?.();
        } else {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="space-y-2">
            <textarea
                autoFocus={autoFocus}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={placeholder}
                rows={3}
                maxLength={MAX}
                className="w-full bg-surface-hover border border-white/6 rounded text-muted placeholder:text-muted-ghost text-sm px-3 py-2 resize-none focus:outline-none focus:border-pulse/40 transition-colors"
            />
            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-ghost">
                    {content.length}/{MAX}
                </span>
                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="text-xs text-muted-soft hover:text-muted transition-colors px-3 py-1.5 rounded"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content.trim()}
                        className="text-xs bg-pulse text-white px-4 py-1.5 rounded font-dm font-medium hover:bg-pulse-80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

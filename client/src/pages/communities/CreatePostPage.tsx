import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Bold, Italic, Underline, Link2, ImagePlus,
    X, Loader2, ArrowLeft, Eye, Edit3,
    List, Quote, Code, Heading2,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { renderBBCode, wrapSelection } from '../../utils/bbcode';

interface ToolbarAction {
    icon: React.ReactNode;
    label: string;
    before: string;
    after: string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
    { icon: <Bold size={15} strokeWidth={2} />, label: 'Bold', before: '[b]', after: '[/b]' },
    { icon: <Italic size={15} strokeWidth={2} />, label: 'Italic', before: '[i]', after: '[/i]' },
    { icon: <Underline size={15} strokeWidth={2} />, label: 'Underline', before: '[u]', after: '[/u]' },
    { icon: <Heading2 size={15} strokeWidth={2} />, label: 'Heading', before: '[h]', after: '[/h]' },
    { icon: <Quote size={15} strokeWidth={2} />, label: 'Quote', before: '[quote]', after: '[/quote]' },
    { icon: <Code size={15} strokeWidth={2} />, label: 'Code', before: '[code]', after: '[/code]' },
    { icon: <List size={15} strokeWidth={2} />, label: 'List item', before: '[*]', after: '' },
    { icon: <Link2 size={15} strokeWidth={2} />, label: 'Link', before: '[url=', after: ']link text[/url]' },
];

const MIN_TITLE = 5;
const MAX_TITLE = 200;
const MIN_CONTENT = 10;
const MAX_CONTENT = 10000;

export default function CreatePostPage() {
    const { id: communityIdStr } = useParams<{ id: string }>();
    const communityId = Number(communityIdStr);
    const { user } = useAuth();
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');

    const [previewMode, setPreviewMode] = useState(false);

    // Sidebar communities
    const [myCommunities, setMyCommunities] = useState<{ id: number; name: string }[]>([]);
    const [communityName, setCommunityName] = useState('');

    useEffect(() => {
        async function load() {
            if (user) {
                const res = await communityApi.getMine();
                if (res.success && res.data) {
                    setMyCommunities(res.data.map(c => ({ id: c.id, name: c.name })));
                    const match = res.data.find(c => c.id === communityId);
                    if (match) setCommunityName(match.name);
                }
            }
            // Also fetch the community name if not in "mine"
            if (!communityName) {
                const res = await communityApi.getById(communityId);
                if (res.success && res.data) setCommunityName(res.data.name);
            }
        }
        load();
    }, [user, communityId]);

    function handleToolbar(action: ToolbarAction) {
        if (!textareaRef.current) return;
        wrapSelection(textareaRef.current, action.before, action.after, setContent);
    }

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return; // 5MB

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setMediaUrl(base64);
            setMediaPreview(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    function insertImageBBCode() {
        if (!mediaUrl || !textareaRef.current) return;
        const tag = `[img]${mediaUrl}[/img]`;
        const pos = textareaRef.current.selectionStart;
        const text = content;
        setContent(text.slice(0, pos) + tag + text.slice(pos));
    }

    function removeMedia() {
        setMediaUrl('');
        setMediaPreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    }

    function validate(): boolean {
        let valid = true;
        setTitleError('');
        setContentError('');

        const t = title.trim();
        if (t.length < MIN_TITLE || t.length > MAX_TITLE) {
            setTitleError(`Title must be ${MIN_TITLE}–${MAX_TITLE} characters`);
            valid = false;
        }
        const c = content.trim();
        if (c.length < MIN_CONTENT || c.length > MAX_CONTENT) {
            setContentError(`Content must be ${MIN_CONTENT}–${MAX_CONTENT} characters`);
            valid = false;
        }
        return valid;
    }

    async function handleSubmit() {
        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);
        setServerError('');

        try {
            const res = await postApi.create({
                title: title.trim(),
                content: content.trim(),
                mediaUrl: mediaUrl || undefined,
                communityId,
            });

            if (res.success && res.data) {
                navigate(`/posts/${res.data.id}`);
            } else {
                setServerError(res.message || 'Failed to create post');
            }
        } catch {
            setServerError('Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppLayout communities={myCommunities}>
            <div className="max-w-[720px] mx-auto">
                {/* Back + header */}
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={18} strokeWidth={1.5} className="text-white/50" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Create Post
                        </h1>
                        {communityName && (
                            <span className="text-xs text-white/35">
                                in c/{communityName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Editor card */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Title input */}
                    <div className="px-5 pt-5 pb-3">
                        <input
                            type="text"
                            value={title}
                            onChange={e => { setTitle(e.target.value); setTitleError(''); }}
                            placeholder="Post title"
                            maxLength={MAX_TITLE}
                            className="w-full text-lg font-semibold text-white/90 placeholder:text-white/20 outline-none bg-transparent border-none"
                        />
                        {titleError && <span className="text-[11px] text-red-400 mt-1 block">{titleError}</span>}
                    </div>

                    <div className="mx-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />

                    {/* Toolbar */}
                    <div
                        className="flex items-center gap-0.5 px-4 py-2 flex-wrap"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                        {TOOLBAR_ACTIONS.map(action => (
                            <button
                                key={action.label}
                                title={action.label}
                                onClick={() => handleToolbar(action)}
                                className="p-2 rounded-md hover:bg-white/5 transition-colors"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)' }}
                            >
                                {action.icon}
                            </button>
                        ))}

                        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

                        {/* Image upload */}
                        <button
                            title="Upload image"
                            onClick={() => imageInputRef.current?.click()}
                            className="p-2 rounded-md hover:bg-white/5 transition-colors"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)' }}
                        >
                            <ImagePlus size={15} strokeWidth={2} />
                        </button>
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                        <div className="ml-auto flex items-center gap-1">
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all"
                                style={{
                                    background: !previewMode ? 'rgba(108,99,255,0.12)' : 'transparent',
                                    color: !previewMode ? '#6c63ff' : 'rgba(255,255,255,0.35)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <Edit3 size={11} strokeWidth={2} />
                                Write
                            </button>
                            <button
                                onClick={() => setPreviewMode(true)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all"
                                style={{
                                    background: previewMode ? 'rgba(108,99,255,0.12)' : 'transparent',
                                    color: previewMode ? '#6c63ff' : 'rgba(255,255,255,0.35)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <Eye size={11} strokeWidth={2} />
                                Preview
                            </button>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="px-5 py-4 min-h-[240px]">
                        {previewMode ? (
                            <div
                                className="text-sm text-white/70 leading-relaxed prose-invert"
                                dangerouslySetInnerHTML={{ __html: renderBBCode(content) || '<span style="color:rgba(255,255,255,0.2)">Nothing to preview</span>' }}
                            />
                        ) : (
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={e => { setContent(e.target.value); setContentError(''); }}
                                placeholder="Write your post content... Use the toolbar above for formatting."
                                maxLength={MAX_CONTENT}
                                className="w-full min-h-[200px] text-sm text-white/80 placeholder:text-white/20 outline-none resize-none bg-transparent border-none leading-relaxed"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            />
                        )}
                        {contentError && <span className="text-[11px] text-red-400 mt-1 block">{contentError}</span>}
                        <div className="flex justify-end mt-1">
                            <span className="text-[11px] text-white/15">{content.length}/{MAX_CONTENT}</span>
                        </div>
                    </div>

                    {/* Media preview */}
                    {mediaPreview && (
                        <div className="px-5 pb-4">
                            <div
                                className="relative inline-block rounded-lg overflow-hidden"
                                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <img src={mediaPreview} alt="Upload" className="max-h-[200px] rounded-lg object-cover" />
                                <button
                                    onClick={removeMedia}
                                    className="absolute top-2 right-2 p-1 rounded-full"
                                    style={{ background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer' }}
                                >
                                    <X size={14} strokeWidth={2} className="text-white/80" />
                                </button>
                            </div>
                            <button
                                onClick={insertImageBBCode}
                                className="block mt-2 text-[11px] text-pulse hover:underline"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Insert as [img] tag in content
                            </button>
                        </div>
                    )}

                    {/* Server error */}
                    {serverError && (
                        <div className="mx-5 mb-4 px-3 py-2 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {serverError}
                        </div>
                    )}

                    {/* Submit bar */}
                    <div
                        className="flex items-center justify-end gap-2 px-5 py-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || title.trim().length < MIN_TITLE || content.trim().length < MIN_CONTENT}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                            style={{
                                background: submitting ? 'rgba(108,99,255,0.3)' : 'var(--color-pulse, #6c63ff)',
                                border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting || title.trim().length < MIN_TITLE || content.trim().length < MIN_CONTENT ? 0.5 : 1,
                            }}
                        >
                            {submitting ? (
                                <><Loader2 size={14} strokeWidth={2} className="animate-spin" /> Posting…</>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
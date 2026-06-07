function sanitizeUrl(url: string): string {
    const trimmed = url.trim();
    if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
        return '#';
    }
    return trimmed;
}

export function renderBBCode(raw: string): string {
    let html = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
    html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
    html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
    html = html.replace(/\[h\]([\s\S]*?)\[\/h\]/gi, '<h3 style="font-size:1.15em;font-weight:700;margin:0.5em 0 0.25em;">$1</h3>');
    html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:3px solid rgba(108,99,255,0.4);padding:0.5em 1em;margin:0.5em 0;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.03);border-radius:4px;">$1</blockquote>');
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre style="background:rgba(255,255,255,0.05);padding:0.75em 1em;border-radius:6px;font-family:monospace;font-size:0.85em;overflow-x:auto;">$1</pre>');
    html = html.replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, (_, url, text) => {
        const safe = sanitizeUrl(url);
        return `<a href="${safe}" style="color:#6c63ff;text-decoration:underline;" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
    html = html.replace(/\[\*\](.*?)(?:\n|$)/gi, '<li style="margin-left:1.25em;">$1</li>');
    html = html.replace(/\[img\](.*?)\[\/img\]/gi, (_, url) => {
        const safe = sanitizeUrl(url);
        return `<img src="${safe}" style="max-width:100%;border-radius:8px;margin:0.5em 0;" />`;
    });
    html = html.replace(/\n/g, '<br/>');

    return html;
}

export function stripBBCode(raw: string): string {
    return raw.replace(/\[\/?\w+(?:=[^\]]*)?\]/gi, '');
}

export function truncateContent(content: string, maxLength = 300): string {
    const plain = stripBBCode(content);
    if (plain.length <= maxLength) return content;
    return content.slice(0, maxLength).trimEnd() + '...';
}

export function wrapSelection(
    textarea: HTMLTextAreaElement,
    before: string,
    after: string,
    setValue: (val: string) => void,
): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    setValue(text.slice(0, start) + replacement + text.slice(end));

    requestAnimationFrame(() => {
        textarea.focus();
        const cursorStart = selected ? start + replacement.length : start + before.length;
        const cursorEnd = selected ? cursorStart : cursorStart + 4;
        textarea.setSelectionRange(cursorStart, cursorEnd);
    });
}

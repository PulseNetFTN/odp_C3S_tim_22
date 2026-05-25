import React, { useRef, useState, useEffect } from 'react';

type Props = {
  currentUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  accept?: string;
};

export default function AvatarUploader({ currentUrl, onFileSelected, accept = 'image/*' }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onFileSelected(null);
      setPreview(currentUrl || null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      onFileSelected(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelected(file);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.04)]">
        <img src={preview || '/assets/default-avatar.png'} alt="Avatar preview" className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={handlePick} className="px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.04)] text-white bg-transparent">
          Change avatar
        </button>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>
    </div>
  );
}

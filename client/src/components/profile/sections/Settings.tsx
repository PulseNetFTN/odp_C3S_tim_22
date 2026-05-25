import React, { useEffect, useState } from 'react';
import type { UserDto } from '../../../models/users/UserDto';
import { usersApiService } from '../../../api_services/users/UsersAPIService';
import { useAuth } from '../../../hooks/auth/useAuthHook';
import AvatarUploader from '../ui/AvatarUploader';
import { useToast } from '../../../hooks/useToast';
import { VALIDATION } from '../../../constants/validaiton';

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    email: '',
    avatarFile: null as File | null,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await usersApiService.getMe();
        if (!mounted) return;
        if (res.success && res.data) {
          setProfile(res.data);
          setForm((s) => ({
            ...s,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            username: res.data.username,
            bio: res.data.bio ?? '',
            email: res.data.email,
          }));
        } else {
          toast.error(res.message ?? 'Failed to load profile.');
        }
      } catch {
        toast.error('Network error while loading profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleAvatar = (file: File | null) => {
    setForm((s) => ({ ...s, avatarFile: file }));
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (form.firstName.trim().length < VALIDATION.FIRST_NAME_MIN) return `First name must be at least ${VALIDATION.FIRST_NAME_MIN} characters.`;
    if (!form.lastName.trim()) return 'Last name is required.';
    if (form.lastName.trim().length < VALIDATION.LAST_NAME_MIN) return `Last name must be at least ${VALIDATION.LAST_NAME_MIN} characters.`;
    if (!form.email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Invalid email address.';
    if (form.username && (form.username.length < VALIDATION.USERNAME_MIN || form.username.length > VALIDATION.USERNAME_MAX)) {
      return `Username must be between ${VALIDATION.USERNAME_MIN} and ${VALIDATION.USERNAME_MAX} characters.`;
    }
    if (form.bio && form.bio.length > VALIDATION.BIO_MAX) return `Bio must be at most ${VALIDATION.BIO_MAX} characters.`;
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload: {
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        bio?: string;
        profileImage?: string;
      } = {
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio?.trim(),
      };
      if (form.avatarFile) {
        const base64 = await fileToBase64(form.avatarFile);
        payload.profileImage = base64;
      }
      const res = await usersApiService.updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        toast.success('Profile updated successfully.');
        window.location.reload();
      } else {
        toast.error(res.message ?? 'Failed to update profile.');
      }
    } catch {
      toast.error('Network error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">Loading settings…</div>;

  return (
    <section className="bg-[rgba(10,10,16,0.6)] p-5 rounded-lg border border-[var(--color-border-subtle)]">
      <h2 className="text-lg font-medium mb-4">Profile Settings</h2>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-36 text-[var(--color-muted)] pt-2">Avatar</div>
          <div className="flex-1">
            <AvatarUploader currentUrl={profile?.profileImage ?? null} onFileSelected={handleAvatar} />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">First name</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" value={form.firstName} onChange={handleChange('firstName')} required />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Last name</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" value={form.lastName} onChange={handleChange('lastName')} required />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Username</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" value={form.username} onChange={handleChange('username')} />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Bio</label>
          <div className="flex-1">
            <textarea className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white min-h-[96px]" value={form.bio} onChange={handleChange('bio')} />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Email</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" type="email" value={form.email} onChange={handleChange('email')} required />
            <div className="mt-2 text-sm text-[var(--color-muted-soft)]">Changing email is security-sensitive. Use Security tab to update email and password with current password verification.</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-[var(--color-pulse)] text-white px-4 py-2 rounded-lg">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

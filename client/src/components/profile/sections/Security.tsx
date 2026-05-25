import React, { useState } from 'react';
import { apiPut } from '../../../helpers/api';
import { useAuth } from '../../../hooks/auth/useAuthHook';
import { useToast } from '../../../hooks/useToast';
import { VALIDATION } from '../../../constants/validaiton';

export default function Security() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  const validate = (): string | null => {
    if (!form.currentPassword) return 'Current password is required to change credentials.';
    if (form.newPassword && form.newPassword.length < VALIDATION.PASSWORD_MIN) return `New password must be at least ${VALIDATION.PASSWORD_MIN} characters.`;
    if (form.newPassword !== form.confirmPassword) return 'New passwords do not match.';
    if (form.newEmail && !/^\S+@\S+\.\S+$/.test(form.newEmail)) return 'Invalid email address.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setProcessing(true);
    try {
      if (form.newPassword) {
        const pwRes = await apiPut('auth/change-password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        if (!pwRes.success) {
          toast.error(pwRes.message ?? 'Failed to change password.');
          setProcessing(false);
          return;
        }
      }
      if (form.newEmail) {
        const emailRes = await apiPut('auth/change-email', {
          currentPassword: form.currentPassword,
          newEmail: form.newEmail,
        });
        if (!emailRes.success) {
          toast.error(emailRes.message ?? 'Failed to change email.');
          setProcessing(false);
          return;
        }
      }
      toast.success('Credentials updated successfully.');
      setForm((s) => ({ ...s, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch {
      toast.error('Network error while updating credentials.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="bg-[rgba(10,10,16,0.6)] p-5 rounded-lg border border-[var(--color-border-subtle)]">
      <h2 className="text-lg font-medium mb-4">Security</h2>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Current password</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" type="password" value={form.currentPassword} onChange={handleChange('currentPassword')} required />
            <div className="mt-2 text-sm text-[var(--color-muted-soft)]">You must enter your current password to change email or password.</div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">New password</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" type="password" value={form.newPassword} onChange={handleChange('newPassword')} placeholder="Leave blank to keep current password" />
            <div className="mt-2 text-sm text-[var(--color-muted-soft)]">Minimum 8 characters recommended.</div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">Confirm new password</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Repeat new password" />
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <label className="w-36 text-[var(--color-muted)] pt-2">New email</label>
          <div className="flex-1">
            <input className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] text-white" type="email" value={form.newEmail} onChange={handleChange('newEmail')} />
            <div className="mt-2 text-sm text-[var(--color-muted-soft)]">If you change your email you may be required to re-verify it via email.</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={processing} className="bg-[var(--color-pulse)] text-white px-4 py-2 rounded-lg">
            {processing ? 'Updating…' : 'Update credentials'}
          </button>
        </div>
      </form>
    </section>
  );
}

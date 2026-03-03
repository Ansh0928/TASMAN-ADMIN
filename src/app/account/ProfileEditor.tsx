'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProfileData {
    name: string;
    email: string;
    phone: string | null;
    authProvider: string | null;
}

export default function ProfileEditor() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        fetch('/api/account')
            .then((res) => res.json())
            .then((data) => {
                setProfile(data);
                setName(data.name || '');
                setPhone(data.phone || '');
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Failed to update profile');
                return;
            }
            setProfile(data);
            toast.success('Profile updated successfully');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setChangingPassword(true);
        try {
            const res = await fetch('/api/account/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Failed to change password');
                return;
            }
            toast.success(data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            toast.error('Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const canChangePassword =
        profile?.authProvider === 'credentials' || profile?.authProvider === 'both';

    if (loading) {
        return (
            <div className="bg-theme-secondary border border-theme-border rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-theme-border rounded w-48" />
                    <div className="h-10 bg-theme-border rounded" />
                    <div className="h-10 bg-theme-border rounded" />
                    <div className="h-10 bg-theme-border rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="bg-theme-secondary border border-theme-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-theme-text mb-4">Account Information</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-theme-text-muted mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text placeholder:text-theme-text-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-text-muted mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 rounded-lg bg-theme-primary/50 border border-theme-border text-theme-text-muted cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-theme-text-muted mb-1">
                            Phone <span className="text-theme-text-muted/50">(optional)</span>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 0412 345 678"
                            className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text placeholder:text-theme-text-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Password Section */}
            {canChangePassword ? (
                <form onSubmit={handleChangePassword} className="bg-theme-secondary border border-theme-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-theme-text mb-4">Change Password</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-theme-text-muted mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-theme-text-muted mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                            />
                            <p className="text-xs text-theme-text-muted mt-1">Minimum 8 characters</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text-muted mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-4 py-2.5 rounded-lg bg-theme-primary border border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="px-6 py-2.5 bg-theme-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {changingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : profile?.authProvider === 'google' ? (
                <div className="bg-theme-secondary border border-theme-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-theme-text mb-2">Password</h2>
                    <p className="text-theme-text-muted">
                        Password management is not available for Google sign-in accounts.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

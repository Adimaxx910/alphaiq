'use client';
// app/settings/page.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2, User, CreditCard, Bell, Shield, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [user, setUser]     = useState<any>(null);
  const [name, setName]     = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return; }
    fetch('/api/user').then(r => r.json()).then(d => {
      setUser(d.user);
      setName(d.user?.name ?? '');
    });
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setPortalLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-surface-1 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="w-full bg-surface-2/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-surface-1 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gold" />
              </div>
              <h2 className="font-semibold">Subscription</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-medium">
                  {user?.plan === 'PRO' ? '⚡ Pro Plan' : user?.plan === 'ENTERPRISE' ? '🏢 Enterprise' : '🆓 Free Plan'}
                </p>
                {user?.stripeCurrentPeriodEnd && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Renews {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {user?.plan === 'FREE' ? (
                <a href="/pricing" className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Upgrade
                </a>
              ) : (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-xs rounded-lg hover:bg-white/5 transition-colors"
                >
                  {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                  Manage
                </button>
              )}
            </div>
          </div>

          {/* Account info */}
          <div className="bg-surface-1 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <h2 className="font-semibold">Account</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Member since</span>
                <span className="text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>User ID</span>
                <span className="font-mono text-xs">{user?.id?.slice(0, 12) ?? '—'}…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

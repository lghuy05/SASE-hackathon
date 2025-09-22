"use client";
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  id: string;
  full_name?: string | null;
  major?: string | null;
  graduation_year?: number | null;
  bio?: string | null;
  location?: string | null;
  profile_picture_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  resume_url?: string | null;
  email?: string | null;
};

export default function ProfileEditForm() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile', error);
      } else if (mounted) {
        setProfile(data || null);
      }

      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field: keyof Profile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : { id: '', [field]: value } as Profile);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updates = { ...profile, updated_at: new Date() } as any;
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Error saving profile', error);
        alert('Error saving profile. See console for details.');
      } else {
        // Redirect back to profile view on success
        router.push('/profile/view');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input value={profile?.full_name ?? ''} onChange={e => handleChange('full_name', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Major</label>
          <input value={profile?.major ?? ''} onChange={e => handleChange('major', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
          <input type="number" value={profile?.graduation_year ?? ''} onChange={e => handleChange('graduation_year', Number(e.target.value) || null)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input value={profile?.location ?? ''} onChange={e => handleChange('location', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={profile?.email ?? ''} onChange={e => handleChange('email', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea value={profile?.bio ?? ''} onChange={e => handleChange('bio', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input value={profile?.linkedin_url ?? ''} onChange={e => handleChange('linkedin_url', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Github URL</label>
          <input value={profile?.github_url ?? ''} onChange={e => handleChange('github_url', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 border border-gray-300 rounded-lg">Return to Dashboard</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

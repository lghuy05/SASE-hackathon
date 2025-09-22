import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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

const getYearTitle = (gradYear?: number | null) => {
  if (!gradYear) return 'Student';
  const currentYear = new Date().getFullYear();
  const yearsLeft = gradYear - currentYear;
  if (yearsLeft <= 1) return 'Senior';
  if (yearsLeft <= 2) return 'Junior';
  if (yearsLeft <= 3) return 'Sophomore';
  return 'Freshman';
};

export default async function ProfileViewPage() {
  const supabase = await createClient();

  // Get authenticated user (via server-side cookies)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    console.error('Error getting user', userErr);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
        <div className="max-w-lg w-full bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Not signed in</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <div className="flex justify-center gap-3">
            <Link href="/auth/login" className="px-4 py-2 bg-green-600 text-white rounded-lg">Sign in</Link>
            <Link href="/" className="px-4 py-2 border border-green-600 text-green-600 rounded-lg">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch profile record for current user
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr) {
    console.error('Error fetching profile', profileErr);
  }

  const profile: Profile | null = profileData ?? null;

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.profile_picture_url ? (
                // Use next/image for external urls; ensure domain is allowed in next.config if external
                // Falls back gracefully to a normal img if next/image cannot load
                <div className="w-36 h-36 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                  <Image
                    src={profile.profile_picture_url}
                    alt={profile.full_name ?? 'Profile picture'}
                    width={144}
                    height={144}
                    className="object-cover w-36 h-36"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-3xl font-semibold">
                  {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'S'}
                </div>
              )}
            </div>

            {/* Basic info */}
            <div className="flex-1 w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name ?? 'Student'}</h1>
                  <p className="text-green-600 font-medium mt-1">{profile?.major ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-2">{getYearTitle(profile?.graduation_year)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/profile/edit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Edit Profile</Link>
                  <Link href="/dashboard" className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Return to Dashboard</Link>
                  {/* Message button removed from profile view; messaging is started from Applications / dashboard */}
                </div>
              </div>

              {/* Bio and details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
                  <p className="text-gray-600">{profile?.bio ?? 'No bio provided.'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li><span className="font-medium text-gray-800">Email: </span>{profile?.email ?? '—'}</li>
                    <li><span className="font-medium text-gray-800">Location: </span>{profile?.location ?? '—'}</li>
                    <li><span className="font-medium text-gray-800">Graduation: </span>{profile?.graduation_year ?? '—'}</li>
                  </ul>
                </div>
              </div>

              {/* Links */}
              <div className="mt-6 flex flex-wrap gap-3">
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="px-3 py-1 border border-green-600 text-green-700 rounded-lg text-sm">LinkedIn</a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm">Github</a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm">Portfolio</a>
                )}
                {profile?.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">View Resume</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import ProfileEditForm from './ProfileEditForm';

export default function ProfileEditPage() {
  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        <ProfileEditForm />
      </div>
    </div>
  );
}

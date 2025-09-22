'use client'
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, User, MapPin, GraduationCap, FileText, Link, Github, Linkedin, Phone, Mail } from 'lucide-react';

const ProfileSetupForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    phone: '',
    email: '',
    bio: '',
    location: '',
    graduation_year: new Date().getFullYear(),
    major: '',
    gpa: '',
    linkedin_url: '',
    portfolio_url: '',
    github_url: '',
    profile_picture: null,
    resume: null
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ FIXED: Use createBrowserClient from @supabase/ssr
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      // Upload files to Supabase Storage if they exist
      let profilePictureUrl = null;
      let resumeUrl = null;

      if (formData.profile_picture) {
        const { data: profileData, error: profileError } = await supabase.storage
          .from('profile-pictures')
          .upload(`${user.id}/profile-picture`, formData.profile_picture);

        if (profileError) throw profileError;
        profilePictureUrl = profileData?.path;
      }

      if (formData.resume) {
        const { data: resumeData, error: resumeError } = await supabase.storage
          .from('resumes')
          .upload(`${user.id}/resume`, formData.resume);

        if (resumeError) throw resumeError;
        resumeUrl = resumeData?.path;
      }

      // Save profile data to profiles table
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: formData.email || user.email,
          full_name: formData.full_name,
          student_id: formData.student_id,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          major: formData.major,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          github_url: formData.github_url,
          profile_picture_url: profilePictureUrl,
          resume_url: resumeUrl,
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Profile save error:', error);
        alert('Error saving profile. Please try again.');
      } else {
        // Redirect to interests setup
        router.push('/interests/setup');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Complete Your USF Profile</h1>
          <p className="text-green-100">Let's get you connected with amazing opportunities!</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Personal Info
            </span>
            <span className={currentStep >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Academic Details
            </span>
            <span className={currentStep >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Documents & Links
            </span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              </div>

              {/* Profile Picture Upload */}
              <div className="mb-6 text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    {formData.profile_picture ? (
                      <img
                        src={URL.createObjectURL(formData.profile_picture)}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-green-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="profile_picture"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="U12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@usf.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tampa, FL"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about yourself, your interests, and career goals..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Academic Details */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <GraduationCap className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Academic Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major *
                  </label>
                  <select
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your major</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Biology">Biology</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Graduation Year *
                  </label>
                  <select
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 6 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="4.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="3.8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents & Links */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Documents & Links</h2>
              </div>

              {/* Resume Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Upload Resume (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mb-4"
                  >
                    {formData.resume ? 'Change Resume' : 'Upload Resume'}
                  </button>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  {formData.resume && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {formData.resume.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Linkedin className="w-5 h-5 text-blue-600 absolute left-3 top-4" />
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Website
                  </label>
                  <div className="relative">
                    <Link className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
                    <input
                      type="url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <div className="relative">
                    <Github className="w-5 h-5 text-gray-800 absolute left-3 top-4" />
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:bg-green-50'
                }`}
              disabled={currentStep === 1}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupForm;

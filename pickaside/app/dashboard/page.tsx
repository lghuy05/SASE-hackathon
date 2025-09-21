'use client'
import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation';
import {
  Home, Briefcase, Users, MessageCircle, Calendar, Bell, Search,
  MapPin, Clock, DollarSign, Building, User, Settings, LogOut,
  Heart, Share, Bookmark, ChevronRight, Filter
} from 'lucide-react';

const USFDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null); // Real user data from Supabase
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Fetch user profile data from your profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Still set basic user data from auth
        setUserData({
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          avatar: null
        })
      } else {
        // Use real profile data
        setUserData({
          name: profile.full_name || user.email?.split('@')[0],
          major: profile.major,
          year: profile.graduation_year ? `Class of ${profile.graduation_year}` : 'Student',
          email: user.email,
          avatar: profile.profile_picture_url
        })
      }

      setLoading(false)
    }

    checkAuthAndFetchData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Mock data (you can replace this with real data from Supabase later)
  const jobPosts = [
    {
      id: 1,
      title: "Software Engineering Intern",
      company: "Tech Innovations Inc",
      location: "Tampa, FL",
      type: "Internship",
      salary: "$25/hr",
      posted: "2 hours ago",
      logo: "/api/placeholder/60/60",
      tags: ["React", "Node.js", "Remote"],
      description: "Join our dynamic team for a summer internship focused on full-stack development..."
    },
    // ... other job posts
  ];

  const people = [
    // ... your people data
  ];

  const events = [
    // ... your events data
  ];

  const sidebarItems = [
    { id: 'jobs', label: 'Job Posts', icon: Briefcase },
    { id: 'people', label: 'People', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar }
  ];

  // ... your JobCard, PersonCard, EventCard components remain the same

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">USF Connect</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search jobs, people, events..."
                  className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userData?.name}</p>
                  <p className="text-xs text-green-200">{userData?.major || 'USF Student'}, {userData?.year || ''}</p>
                </div>
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userData?.name}</h3>
                  <p className="text-gray-600 text-sm">{userData?.major || 'Undecided Major'}</p>
                  <p className="text-gray-500 text-xs">{userData?.year}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left text-green-600 text-sm hover:bg-green-50 p-2 rounded"
              >
                View Profile
              </button>
            </div>

            <nav className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content - YOUR EXISTING CONTENT HERE */}
          <div className="lg:col-span-3">
            {/* Content Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'jobs' ? 'Job Opportunities' :
                    activeTab === 'people' ? 'Connect with People' :
                      activeTab === 'events' ? 'Upcoming Events' : 'Messages'}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'jobs' && 'Find your next opportunity'}
                  {activeTab === 'people' && 'Expand your network'}
                  {activeTab === 'events' && 'Never miss an event'}
                  {activeTab === 'messages' && 'Stay connected'}
                </p>
              </div>
              <button className="flex items-center space-x-2 text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Content Area - YOUR EXISTING CONTENT HERE */}
            <div className="space-y-6">
              {/* ... your existing job cards, people cards, etc. */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USFDashboard;

'use client'
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation';
import {
  Home, Briefcase, Users, MessageCircle, Calendar, Bell, Search,
  MapPin, Clock, DollarSign, Building, User, Settings, LogOut,
  Heart, Share, Bookmark, ChevronRight, Filter, UserPlus, Check, X
} from 'lucide-react';

const USFDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState<{
    id?: string;
    name?: string;
    email?: string;
    major?: string;
    year?: string;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  // Job posting state
  type JobPost = {
    id: string;
    title: string;
    company: string;
    location: string;
    job_type: string;
    industry: string;
    description: string;
    requirements: string;
    salary_range: string;
    application_deadline: string | null;
    posted_by?: string;
    is_active: boolean;
    created_at: string;
  };

  type JobFormState = {
    title: string;
    company: string;
    location: string;
    job_type: string;
    industry: string;
    description: string;
    requirements: string;
    salary_range: string;
    application_deadline: string;
  };

  type Person = {
    id: string;
    full_name: string;
    bio: string;
    major: string;
    graduation_year: number;
    location: string;
    profile_picture_url: string;
    interests: string[];
    connectionStatus?: 'none' | 'pending' | 'connected' | 'declined';
  };

  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [jobForm, setJobForm] = useState<JobFormState>({
    title: '',
    company: '',
    location: '',
    job_type: '',
    industry: '',
    description: '',
    requirements: '',
    salary_range: '',
    application_deadline: '',
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setUserData({
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          avatar: undefined
        });
      } else {
        setUserData({
          id: user.id,
          name: profile.full_name || user.email?.split('@')[0],
          major: profile.major,
          year: profile.graduation_year ? `Class of ${profile.graduation_year}` : 'Student',
          email: user.email,
          avatar: profile.profile_picture_url
        });
      }

      // Fetch jobs from Supabase
      const { data: jobs, error: jobsError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      } else {
        setJobPosts(jobs || []);
      }

      // Fetch people (other users) with their interests and connection status
      await fetchPeople(user.id);

      // Fetch notifications
      await fetchNotifications(user.id);

      setLoading(false);
    };

    checkAuthAndFetchData();
  }, [router, supabase]);

  const fetchPeople = async (currentUserId: string) => {
    try {
      // Get all profiles except current user
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, bio, major, graduation_year, location, profile_picture_url')
        .neq('id', currentUserId)
        .limit(20);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get interests for each user
      const profileIds = profiles.map(p => p.id);
      const { data: interests, error: interestsError } = await supabase
        .from('user_interests')
        .select('user_id, value')
        .in('user_id', profileIds);

      // Get connection statuses
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('receiver_id, requester_id, status')
        .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      // Combine the data
      const peopleWithDetails = profiles.map(profile => {
        const userInterests = interests?.filter(i => i.user_id === profile.id).map(i => i.value) || [];

        // Check connection status
        let connectionStatus = 'none';
        const connection = connections?.find(c =>
          (c.requester_id === currentUserId && c.receiver_id === profile.id) ||
          (c.receiver_id === currentUserId && c.requester_id === profile.id)
        );

        if (connection) {
          if (connection.status === 'accepted') {
            connectionStatus = 'connected';
          } else if (connection.status === 'pending') {
            connectionStatus = 'pending';
          } else if (connection.status === 'declined') {
            connectionStatus = 'declined';
          }
        }

        return {
          ...profile,
          interests: userInterests,
          connectionStatus
        };
      });

      setPeople(peopleWithDetails);
    } catch (error) {
      console.error('Error in fetchPeople:', error);
    }
  };

  const fetchNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) {
      setNotifications(data || []);
    }
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!userData?.id) return;

    try {
      // Insert connection request
      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          requester_id: userData.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (connectionError) {
        console.error('Error sending connection request:', connectionError);
        return;
      }

      // Create notification for receiver
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: `${userData.name} wants to connect with you`,
          related_id: userData.id
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      // Update local state
      setPeople(prev => prev.map(person =>
        person.id === receiverId
          ? { ...person, connectionStatus: 'pending' }
          : person
      ));

    } catch (error) {
      console.error('Error in sendConnectionRequest:', error);
    }
  };

  const respondToConnection = async (connectionId: string, response: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('connections')
      .update({
        status: response,
        responded_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (!error && response === 'accepted') {
      // Create notification for requester
      const notification = notifications.find(n => n.related_id === connectionId);
      if (notification) {
        await supabase
          .from('notifications')
          .insert({
            user_id: notification.related_id,
            type: 'connection_accepted',
            title: 'Connection Accepted',
            message: `${userData?.name} accepted your connection request`
          });
      }
    }

    // Refresh notifications and people
    if (userData?.id) {
      await fetchNotifications(userData.id);
      await fetchPeople(userData.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Handle job form input
  const handleJobInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle job form submit
  const handleJobSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJobLoading(true);
    setJobError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await supabase.from('job_posts').insert([
        {
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          job_type: jobForm.job_type,
          industry: jobForm.industry,
          description: jobForm.description,
          requirements: jobForm.requirements,
          salary_range: jobForm.salary_range,
          application_deadline: jobForm.application_deadline || null,
          posted_by: user.id,
        }
      ]).select();

      if (error) {
        setJobError('Failed to post job: ' + (error.message || 'Unknown error'));
        console.error('Supabase insert error:', error);
      } else if (data && data.length > 0) {
        setJobPosts((prev) => [data[0] as JobPost, ...prev]);
        setJobForm({
          title: '', company: '', location: '', job_type: '', industry: '',
          description: '', requirements: '', salary_range: '', application_deadline: ''
        });
      }
    } catch (err: any) {
      setJobError('Unexpected error: ' + (err.message || 'Unknown error'));
      console.error('Unexpected error:', err);
    }
    setJobLoading(false);
  };

  const events = [
    {
      id: 1,
      title: "Tech Career Fair",
      date: "March 15, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "USF Marshall Student Center",
      attendees: 245,
      type: "Career Fair"
    },
    {
      id: 2,
      title: "Networking Night",
      date: "March 20, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "Innovation Hub",
      attendees: 89,
      type: "Networking"
    }
  ];

  const sidebarItems = [
    { id: 'jobs', label: 'Job Posts', icon: Briefcase },
    { id: 'people', label: 'People', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar }
  ];

  const JobCard = ({ job }: { job: JobPost }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            <p className="text-green-600 font-medium">{job.company}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {job.job_type}
          </span>
          <p className="text-green-600 font-semibold mt-2">{job.salary_range}</p>
        </div>
      </div>

      <p className="text-gray-600 mb-2 line-clamp-2">{job.description}</p>
      <p className="text-gray-500 text-sm mb-2">Industry: {job.industry}</p>
      <p className="text-gray-500 text-sm mb-2">Requirements: {job.requirements}</p>
      {job.application_deadline && (
        <p className="text-gray-500 text-sm mb-2">Apply by: {new Date(job.application_deadline).toLocaleDateString()}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div />
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );

  const PersonCard = ({ person }: { person: Person }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          {person.profile_picture_url ? (
            <img src={person.profile_picture_url} alt={person.full_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{person.full_name}</h3>
          <p className="text-gray-600 text-sm">{person.major}</p>
          <p className="text-blue-600 text-sm">Class of {person.graduation_year}</p>
          {person.location && <p className="text-gray-500 text-xs">{person.location}</p>}
        </div>
      </div>

      {person.bio && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{person.bio}</p>
      )}

      {person.interests.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {person.interests.slice(0, 3).map((interest, index) => (
            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              {interest}
            </span>
          ))}
          {person.interests.length > 3 && (
            <span className="text-gray-500 text-xs">+{person.interests.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {person.connectionStatus === 'none' && (
          <button
            onClick={() => sendConnectionRequest(person.id)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Connect
          </button>
        )}
        {person.connectionStatus === 'pending' && (
          <button
            disabled
            className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg text-sm cursor-not-allowed"
          >
            Request Sent
          </button>
        )}
        {person.connectionStatus === 'connected' && (
          <button
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );

  type Event = {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    type: string;
  };

  const EventCard = ({ event }: { event: Event }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
            {event.type}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {event.date}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {event.time}
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {event.location}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{event.attendees} attending</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
          Register
        </button>
      </div>
    </div>
  );

  const NotificationDropdown = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`p-4 border-b border-gray-100 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                <div className="flex space-x-1">
                  {notification.type === 'connection_request' && (
                    <>
                      <button
                        onClick={() => respondToConnection(notification.related_id, 'accepted')}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => respondToConnection(notification.related_id, 'declined')}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(notification.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Pick A Side</h1>
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
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.is_read) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown />}
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userData?.name}</p>
                  <p className="text-xs text-green-200">{userData?.major || 'USF Student'}, {userData?.year || ''}</p>
                </div>
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

          {/* Main Content */}
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

            {/* Content Area */}
            <div className="space-y-6">
              {activeTab === 'jobs' && (
                <>
                  {/* Job Posting Form */}
                  <form onSubmit={handleJobSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Post a Job</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="title" value={jobForm.title} onChange={handleJobInput} required placeholder="Job Title" className="border p-2 rounded" />
                      <input name="company" value={jobForm.company} onChange={handleJobInput} required placeholder="Company" className="border p-2 rounded" />
                      <input name="location" value={jobForm.location} onChange={handleJobInput} required placeholder="Location" className="border p-2 rounded" />
                      <select name="job_type" value={jobForm.job_type} onChange={handleJobInput} required className="border p-2 rounded">
                        <option value="">Select Job Type</option>
                        <option value="internship">Internship</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="co-op">Co-op</option>
                      </select>
                      <input name="industry" value={jobForm.industry} onChange={handleJobInput} required placeholder="Industry" className="border p-2 rounded" />
                      <input name="salary_range" value={jobForm.salary_range} onChange={handleJobInput} placeholder="Salary Range" className="border p-2 rounded" />
                      <div className="md:col-span-2">
                        <label htmlFor="application_deadline" className="font-bold block mb-1">Application Deadline</label>
                        <p className="text-xs text-gray-500 mb-1">Select the last date candidates can apply for this job.</p>
                        <input id="application_deadline" name="application_deadline" value={jobForm.application_deadline} onChange={handleJobInput} type="date" placeholder="Application Deadline" className="border p-2 rounded w-full md:w-auto" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="font-bold block mb-1">Job Description</label>
                      <p className="text-xs text-gray-500 mb-1">Provide a detailed overview of the role and responsibilities.</p>
                      <textarea id="description" name="description" value={jobForm.description} onChange={handleJobInput} required placeholder="Job Description" className="border p-2 rounded w-full" rows={3} />
                    </div>
                    <div>
                      <label htmlFor="requirements" className="font-bold block mb-1">Requirements</label>
                      <p className="text-xs text-gray-500 mb-1">List the qualifications, skills, or experience needed.</p>
                      <textarea id="requirements" name="requirements" value={jobForm.requirements} onChange={handleJobInput} required placeholder="Requirements" className="border p-2 rounded w-full" rows={2} />
                    </div>
                    {jobError && <p className="text-red-500 text-sm">{jobError}</p>}
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors" disabled={jobLoading}>
                      {jobLoading ? 'Posting...' : 'Post Job'}
                    </button>
                  </form>
                  {/* Job List */}
                  {jobPosts.length > 0 ? jobPosts.map(job => (
                    <JobCard key={job.id} job={job} />
                  )) : <p>No job posts found.</p>}
                </>
              )}

              {activeTab === 'people' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {people.map(person => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {events.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Start connecting with people to begin conversations!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USFDashboard;

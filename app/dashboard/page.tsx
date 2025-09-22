'use client'
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Briefcase, Users, MessageCircle, Calendar, Bell, Search,
  MapPin, Clock, DollarSign, Building, User, Settings, LogOut,
  Heart, Share, Bookmark, ChevronRight, Filter, UserPlus, Check, X,
  Send, ArrowLeft, FileText, ExternalLink, Mail, Phone, Eye, ChevronDown
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
    graduation_year?: number;
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
    hours_per_week: string;
    application_deadline: string | null;
    posted_by?: string;
    is_active: boolean;
    created_at: string;
    application_count?: number;
    user_applied?: boolean;
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
    hours_per_week: string;
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

  type JobApplication = {
    id: string;
    job_id: string;
    applicant_id: string;
    status: string;
    cover_letter: string;
    applied_at: string;
    applicant: {
      full_name: string;
      email: string;
      major: string;
      graduation_year: number;
      gpa: number;
      phone: string;
      profile_picture_url: string;
      linkedin_url: string;
      github_url: string;
      portfolio_url: string;
      resume_url: string;
      bio: string;
    };
    job: {
      title: string;
      company: string;
    };
  };

  type Conversation = {
    id: string;
    participant_1: string;
    participant_2: string;
    created_at: string;
    updated_at: string;
    other_user?: {
      id: string;
      full_name: string;
      profile_picture_url?: string;
      major?: string;
      graduation_year?: number;
    };
    last_message?: {
      content: string;
      sent_at: string;
      sender_id: string;
    };
  };

  type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    sent_at: string;
  };

  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobForm, setJobForm] = useState<JobFormState>({
    title: '',
    company: '',
    location: '',
    job_type: '',
    industry: '',
    description: '',
    requirements: '',
    salary_range: '',
    hours_per_week: '',
    application_deadline: '',
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');

  // Application states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobPost | null>(null);
  const [applicationForm, setApplicationForm] = useState({ cover_letter: '' });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<JobPost | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const getYearTitle = (gradYear?: number | null) => {
    if (!gradYear) return 'Student';
    const currentYear = new Date().getFullYear();
    const yearsLeft = gradYear - currentYear;
    if (yearsLeft <= 1) return 'Senior';
    if (yearsLeft <= 2) return 'Junior';
    if (yearsLeft <= 3) return 'Sophomore';
    return 'Freshman';
  };

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
          graduation_year: profile.graduation_year,
          email: user.email,
          avatar: profile.profile_picture_url
        });
      }

      // Fetch jobs with application status
      await fetchJobsWithApplicationStatus(user.id);

      // Fetch people (other users) with their interests and connection status
      await fetchPeople(user.id);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(6);

      if (!eventsError) {
        setEvents(eventsData || []);
      }

      // Fetch notifications
      await fetchNotifications(user.id);

      // Fetch conversations
      await fetchConversations(user.id);

      setLoading(false);
    };

    checkAuthAndFetchData();
  }, [router, supabase]);

  const fetchJobsWithApplicationStatus = async (userId: string) => {
    try {
      // Get all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return;
      }

      // Get application counts for each job
      const jobIds = jobs?.map(job => job.id) || [];
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('job_id, applicant_id')
        .in('job_id', jobIds);

      if (appError) {
        console.error('Error fetching applications:', appError);
        setJobPosts(jobs || []);
        return;
      }

      // Process jobs with application data
      const jobsWithApplicationData = jobs?.map(job => {
        const jobApplications = applications?.filter(app => app.job_id === job.id) || [];
        const userApplied = jobApplications.some(app => app.applicant_id === userId);
        
        return {
          ...job,
          application_count: jobApplications.length,
          user_applied: userApplied
        };
      }) || [];

      setJobPosts(jobsWithApplicationData);
    } catch (error) {
      console.error('Error in fetchJobsWithApplicationStatus:', error);
    }
  };

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
        let connectionStatus: 'none' | 'pending' | 'connected' | 'declined' = 'none';
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

  const fetchConversations = async (userId: string) => {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Get other participants' info and last messages
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conversation) => {
          const otherUserId = conversation.participant_1 === userId 
            ? conversation.participant_2 
            : conversation.participant_1;

          // Get other user's profile
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, major, graduation_year')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, sent_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conversation,
            other_user: otherUser,
            last_message: lastMessage
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userData?.id);

    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchJobApplications = async (jobId: string) => {
    setApplicationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applications_applicant_id_fkey(
            full_name, email, major, graduation_year, gpa, phone,
            profile_picture_url, linkedin_url, github_url, portfolio_url,
            resume_url, bio
          ),
          job:job_posts!applications_job_id_fkey(title, company)
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setJobApplications(data || []);
    } catch (error) {
      console.error('Error in fetchJobApplications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userData?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: userData.id,
          content: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setNewMessage('');
      await fetchMessages(selectedConversation);
      await fetchConversations(userData.id);
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!userData?.id) return;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${userData.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userData.id})`)
        .single();

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
        setActiveTab('messages');
        await fetchMessages(existingConversation.id);
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: userData.id,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      setSelectedConversation(newConversation.id);
      setActiveTab('messages');
      await fetchConversations(userData.id);
    } catch (error) {
      console.error('Error in startConversation:', error);
    }
  };

  const handleJobApplication = async (job: JobPost) => {
    setSelectedJobForApplication(job);
    setShowApplicationModal(true);
  };

  const submitJobApplication = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApplication || !userData?.id) return;

    setApplicationLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: selectedJobForApplication.id,
          applicant_id: userData.id,
          cover_letter: applicationForm.cover_letter,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting application:', error);
        return;
      }

      // Create notification for job poster
      if (selectedJobForApplication.posted_by) {
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedJobForApplication.posted_by,
            type: 'job_application',
            title: 'New Job Application',
            message: `${userData.name} applied for ${selectedJobForApplication.title}`,
            related_id: selectedJobForApplication.id
          });
      }

      // Refresh job posts to update application status
      await fetchJobsWithApplicationStatus(userData.id);
      
      setShowApplicationModal(false);
      setApplicationForm({ cover_letter: '' });
      
    } catch (error) {
      console.error('Error in submitJobApplication:', error);
    } finally {
      setApplicationLoading(false);
    }
  };

  const viewJobApplications = async (job: JobPost) => {
    setSelectedJobForApplications(job);
    setShowApplicationsModal(true);
    await fetchJobApplications(job.id);
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application status:', error);
        return;
      }

      // Refresh applications
      if (selectedJobForApplications) {
        await fetchJobApplications(selectedJobForApplications.id);
      }
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          hours_per_week: jobForm.hours_per_week,
          application_deadline: jobForm.application_deadline || null,
          posted_by: user.id,
        }
      ]).select();

      if (error) {
        setJobError('Failed to post job: ' + (error.message || 'Unknown error'));
        console.error('Supabase insert error:', error);
      } else if (data && data.length > 0) {
        await fetchJobsWithApplicationStatus(user.id);
        setJobForm({
          title: '', company: '', location: '', job_type: '', industry: '',
          description: '', requirements: '', salary_range: '', hours_per_week: '',
          application_deadline: ''
        });
      }
    } catch (err: any) {
      setJobError('Unexpected error: ' + (err.message || 'Unknown error'));
      console.error('Unexpected error:', err);
    }
    setJobLoading(false);
  };

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
      <p className="text-gray-500 text-sm mb-2">Hours per week: <span className="font-semibold">{job.hours_per_week}</span></p>
      {job.application_deadline && (
        <p className="text-gray-500 text-sm mb-2">Apply by: {new Date(job.application_deadline).toLocaleDateString()}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{job.application_count || 0} applications</span>
          {job.posted_by === userData?.id && (
            <button
              onClick={() => viewJobApplications(job)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Applications
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          {job.posted_by !== userData?.id && (
            <button
              onClick={() => handleJobApplication(job)}
              disabled={job.user_applied}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                job.user_applied
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {job.user_applied ? 'Applied' : 'Apply Now'}
            </button>
          )}
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
            onClick={() => startConversation(person.id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );

  const EventCard = ({ event }: { event: any }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
            {event.event_type}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}
        </div>
        {event.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{event.max_attendees ? `${event.max_attendees} spots available` : 'Open event'}</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
          Register
        </button>
      </div>
    </div>
  );

  const ApplicationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Apply for {selectedJobForApplication?.title}</h2>
          <button
            onClick={() => setShowApplicationModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={submitJobApplication} className="space-y-4">
          <div>
            <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter
            </label>
            <textarea
              id="cover_letter"
              value={applicationForm.cover_letter}
              onChange={(e) => setApplicationForm({ cover_letter: e.target.value })}
              placeholder="Tell the employer why you're perfect for this role..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              rows={5}
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowApplicationModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applicationLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {applicationLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ApplicationsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Applications for {selectedJobForApplications?.title}</h2>
            <p className="text-gray-600">{selectedJobForApplications?.company}</p>
          </div>
          <button
            onClick={() => setShowApplicationsModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {applicationsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : jobApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobApplications.map(application => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {application.applicant.profile_picture_url ? (
                      <img
                        src={application.applicant.profile_picture_url}
                        alt={application.applicant.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {application.applicant.full_name}
                        </h3>
                        <p className="text-gray-600">
                          {application.applicant.major} • Class of {application.applicant.graduation_year}
                        </p>
                        {application.applicant.gpa && (
                          <p className="text-gray-500 text-sm">GPA: {application.applicant.gpa}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                        
                        <div className="relative">
                          <select
                            value={application.status}
                            onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{application.applicant.email}</span>
                        </div>
                        {application.applicant.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{application.applicant.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Links</p>
                        <div className="space-y-1">
                          {application.applicant.linkedin_url && (
                            <a
                              href={application.applicant.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {application.applicant.github_url && (
                            <a
                              href={application.applicant.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {application.applicant.portfolio_url && (
                            <a
                              href={application.applicant.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Portfolio</span>
                            </a>
                          )}
                          {application.applicant.resume_url && (
                            <a
                              href={application.applicant.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Resume</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {application.applicant.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Bio</p>
                        <p className="text-sm text-gray-700">{application.applicant.bio}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Cover Letter</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{application.cover_letter}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Applied on {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ConversationsList = () => (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No conversations yet</p>
          <p className="text-sm">Connect with people to start messaging!</p>
        </div>
      ) : (
        conversations.map(conversation => (
          <div
            key={conversation.id}
            onClick={() => setSelectedConversation(conversation.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedConversation === conversation.id
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {conversation.other_user?.profile_picture_url ? (
                  <img
                    src={conversation.other_user.profile_picture_url}
                    alt={conversation.other_user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.other_user?.full_name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.last_message?.sent_at &&
                      new Date(conversation.last_message.sent_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.other_user?.major} • Class of {conversation.other_user?.graduation_year}
                </p>
                {conversation.last_message && (
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conversation.last_message.sender_id === userData?.id ? 'You: ' : ''}
                    {conversation.last_message.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const ChatWindow = () => {
    const currentConversation = conversations.find(c => c.id === selectedConversation);

    if (!currentConversation) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {currentConversation.other_user?.profile_picture_url ? (
              <img
                src={currentConversation.other_user.profile_picture_url}
                alt={currentConversation.other_user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {currentConversation.other_user?.full_name}
            </h3>
            <p className="text-xs text-gray-500">
              {currentConversation.other_user?.major} • Class of {currentConversation.other_user?.graduation_year}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === userData?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender_id === userData?.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === userData?.id ? 'text-green-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.sent_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  };

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
                  <p className="text-xs text-green-200">{userData?.major || 'USF Student'}, {getYearTitle(userData?.graduation_year)}</p>
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
              <Link href="/profile/view" className="w-full block text-left text-green-600 text-sm hover:bg-green-50 p-2 rounded">
                View Profile
              </Link>
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
                      <input name="hours_per_week" value={jobForm.hours_per_week} onChange={handleJobInput} required placeholder="Hours per Week" className="border p-2 rounded" />
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
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Conversations List */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h3>
                    <ConversationsList />
                  </div>

                  {/* Chat Window */}
                  <div className="lg:col-span-1">
                    {selectedConversation ? (
                      <ChatWindow />
                    ) : (
                      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                        <p className="text-gray-600">Choose a conversation to start messaging!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApplicationModal && <ApplicationModal />}
      {showApplicationsModal && <ApplicationsModal />}
    </div>
  );
};

export default USFDashboard;
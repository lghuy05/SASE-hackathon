'use client'
import React, { useState } from 'react';
import {
  Home, Briefcase, Users, MessageCircle, Calendar, Bell, Search,
  MapPin, Clock, DollarSign, Building, User, Settings, LogOut,
  Heart, Share, Bookmark, ChevronRight, Filter
} from 'lucide-react';

const USFDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data
  const user = {
    name: "Alex Rodriguez",
    major: "Computer Science",
    year: "Junior",
    avatar: "/api/placeholder/40/40"
  };

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
    {
      id: 2,
      title: "Marketing Assistant",
      company: "Creative Solutions",
      location: "St. Petersburg, FL",
      type: "Part-time",
      salary: "$20/hr",
      posted: "5 hours ago",
      logo: "/api/placeholder/60/60",
      tags: ["Marketing", "Social Media", "Design"],
      description: "Help create engaging campaigns for our diverse client base..."
    },
    {
      id: 3,
      title: "Research Assistant",
      company: "University of South Florida",
      location: "Tampa, FL",
      type: "Co-op",
      salary: "$18/hr",
      posted: "1 day ago",
      logo: "/api/placeholder/60/60",
      tags: ["Research", "Data Analysis", "Python"],
      description: "Assist faculty with groundbreaking research in sustainable technology..."
    }
  ];

  const people = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "CS Senior @ USF",
      company: "Interning at Microsoft",
      avatar: "/api/placeholder/50/50",
      mutualConnections: 12,
      tags: ["Software Engineering", "AI/ML"]
    },
    {
      id: 2,
      name: "Marcus Johnson",
      title: "Business Major",
      company: "Marketing Intern at Adobe",
      avatar: "/api/placeholder/50/50",
      mutualConnections: 8,
      tags: ["Digital Marketing", "Analytics"]
    }
  ];

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

  const JobCard = ({ job }) => (
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
                {job.posted}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {job.type}
          </span>
          <p className="text-green-600 font-semibold mt-2">{job.salary}</p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {job.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
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

  const PersonCard = ({ person }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{person.name}</h3>
          <p className="text-gray-600 text-sm">{person.title}</p>
          <p className="text-blue-600 text-sm">{person.company}</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-3">
        {person.mutualConnections} mutual connections
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {person.tags.map(tag => (
          <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>

      <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
        Connect
      </button>
    </div>
  );

  const EventCard = ({ event }) => (
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
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-green-200">{user.major}, {user.year}</p>
                </div>
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
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.major}</p>
                </div>
              </div>
              <button className="w-full text-left text-green-600 text-sm hover:bg-green-50 p-2 rounded">
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
                  {jobPosts.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
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

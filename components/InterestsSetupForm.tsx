'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Book, Briefcase, MapPin, Code, Heart, Star } from 'lucide-react'

const InterestsSetupForm = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )

  // Sample interest categories
  const interestCategories = [
    {
      title: 'Industry Interests',
      icon: <Briefcase className="w-5 h-5" />,
      options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Engineering']
    },
    {
      title: 'Job Types',
      icon: <Book className="w-5 h-5" />,
      options: ['Internship', 'Full-time', 'Part-time', 'Co-op', 'Remote', 'On-site']
    },
    {
      title: 'Locations',
      icon: <MapPin className="w-5 h-5" />,
      options: ['San Francisco', 'New York', 'Remote', 'Seattle', 'Los Angeles', 'Chicago']
    },
    {
      title: 'Skills',
      icon: <Code className="w-5 h-5" />,
      options: ['React', 'Python', 'Data Analysis', 'UI/UX Design', 'Cloud Computing', 'Machine Learning']
    }
  ]

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest!')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Save interests to database
      const interestsToInsert = selectedInterests.map(interest => ({
        user_id: user.id,
        category: 'user_interest', // You can categorize these better
        value: interest,
        priority: 1
      }))

      const { error } = await supabase
        .from('user_interests')
        .insert(interestsToInsert)

      if (error) {
        console.error('Error saving interests:', error)
        alert('Error saving interests. Please try again.')
      } else {
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white py-6 px-8">
            <h1 className="text-3xl font-bold mb-2">What are you interested in?</h1>
            <p className="text-blue-100">Select your interests to get personalized recommendations</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {interestCategories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {category.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => toggleInterest(option)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedInterests.includes(option)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Selected Interests</h3>
              {selectedInterests.length === 0 ? (
                <p className="text-gray-500">No interests selected yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || selectedInterests.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterestsSetupForm

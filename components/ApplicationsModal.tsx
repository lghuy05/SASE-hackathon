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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-gray-400">
                      Applied on {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                    
                    {/* Message Button */}
                    <button
                      onClick={() => startConversation(application.applicant_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
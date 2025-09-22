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
          onClick={() => {
            startConversation(person.id);
            setActiveTab('messages');
          }}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Chat
        </button>
      )}
    </div>
  </div>
);
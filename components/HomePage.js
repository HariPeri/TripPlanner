
import React from 'react';
import { Calendar, Plus, Search, Users, MapPin } from 'lucide-react';

const HomePage = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">Travel.io</span>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Plan Your Perfect Trip</h1>
        <p className="text-xl text-gray-600 mb-12">
          Organize your travel itineraries, discover amazing activities, and collaborate with friends on
          your next adventure.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
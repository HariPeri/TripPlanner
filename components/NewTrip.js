'use client';
import React from 'react';
import { MapPin, ArrowLeft } from 'lucide-react';
import { sampleCountries } from '@/lib/mockData';

export default function NewTripForm({ newTripForm, setNewTripForm, onCreateTrip, setCurrentView  }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TripPlanner</span>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Trip</h1>
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Title</label>
            <input
              type="text"
              value={newTripForm.title}
              onChange={(e) => setNewTripForm({ ...newTripForm, title: e.target.value })}
              placeholder="e.g., Summer Vacation to Paris"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination Country</label>
            <select
              value={newTripForm.country}
              onChange={(e) => setNewTripForm({ ...newTripForm, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a country</option>
              {sampleCountries.map(country => (
                <option key={country.country_name} value={country.country_name}>
                  {country.country_name} ({country.continent})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
            <input
              type="number"
              min="1"
              max="30"
              value={newTripForm.days}
              onChange={(e) => setNewTripForm({ ...newTripForm, days: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={onCreateTrip}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Create Trip
          </button>
        </div>
      </div>
    </div>
  );
}
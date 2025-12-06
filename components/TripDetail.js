import React from 'react';
import { ArrowLeft, MapPin, Plus, Save, Trash2 } from 'lucide-react';

const TripDetail = ({
  tripDetails,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  setCurrentView,
}) => {
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tripDetails.title}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{tripDetails.country_name}</span>
          </div>
        </div>

        <div className="space-y-6">
          {tripDetails.days?.map((day) => (
            <div key={day.number} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Day {day.number}</h2>
                <button
                  onClick={() => addItineraryItem(day.number)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </button>
              </div>

              <div className="space-y-4">
                {day.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No activities planned yet. Add your first activity!
                  </p>
                ) : (
                  day.items.map((item) => (
                    <div key={item.item_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start
                          </label>
                          <input
                            type="time"
                            value={item.startTime}
                            onChange={(e) =>
                              updateItineraryItem(
                                day.number,
                                item.item_id,
                                'startTime',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                          <input
                            type="time"
                            value={item.endTime}
                            onChange={(e) =>
                              updateItineraryItem(
                                day.number,
                                item.item_id,
                                'endTime',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity
                          </label>
                          <input
                            type="text"
                            value={item.activity}
                            onChange={(e) =>
                              updateItineraryItem(
                                day.number,
                                item.item_id,
                                'activity',
                                e.target.value
                              )
                            }
                            placeholder="What will you do?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              updateItineraryItem(
                                day.number,
                                item.item_id,
                                'notes',
                                e.target.value
                              )
                            }
                            placeholder="Additional details"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          <button
                            onClick={() => deleteItineraryItem(day.number, item.item_id)}
                            className="w-full px-3 py-2 text-red-500 hover:text-red-700 border border-gray-300 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            <Save className="w-5 h-5 mr-2" />
            Save Trip Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
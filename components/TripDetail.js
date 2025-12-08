import React, { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const TripDetail = ({
  tripDetails,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  setCurrentView,
}) => {
  // Track which items are being edited
  const [editingItems, setEditingItems] = useState({});
  // Track temporary values while editing
  const [tempValues, setTempValues] = useState({});

  // Available categories
  const categories = [
    'Cultural',
    'Nature',
    'Historic',
    'Architecture',
    'Museums',
    'Sports',
    'Entertainment',
    'Food & Drink',
    'Shopping',
    'Religious',
    'Other'
  ];

  const startEditing = (dayNumber, itemId, currentItem) => {
    const key = `${dayNumber}-${itemId}`;
    setEditingItems({ ...editingItems, [key]: true });
    setTempValues({
      ...tempValues,
      [key]: {
        startTime: currentItem.startTime || '',
        endTime: currentItem.endTime || '',
        activity: currentItem.activity || '',
        notes: currentItem.notes || '',
        category: currentItem.category || 'Other'
      }
    });
  };

  const cancelEditing = (dayNumber, itemId) => {
    const key = `${dayNumber}-${itemId}`;
    const newEditingItems = { ...editingItems };
    const newTempValues = { ...tempValues };
    delete newEditingItems[key];
    delete newTempValues[key];
    setEditingItems(newEditingItems);
    setTempValues(newTempValues);
  };

  const saveEditing = async (dayNumber, itemId) => {
    const key = `${dayNumber}-${itemId}`;
    const values = tempValues[key];
    
    // Save all fields including category
    await updateItineraryItem(dayNumber, itemId, {
      startTime: values.startTime,
      endTime: values.endTime,
      activity: values.activity,
      notes: values.notes,
      category: values.category
    });
    
    // Clear editing state
    cancelEditing(dayNumber, itemId);
  };

  const updateTempValue = (dayNumber, itemId, field, value) => {
    const key = `${dayNumber}-${itemId}`;
    setTempValues({
      ...tempValues,
      [key]: {
        ...tempValues[key],
        [field]: value
      }
    });
  };

  const isEditing = (dayNumber, itemId) => {
    return editingItems[`${dayNumber}-${itemId}`];
  };

  const getTempValue = (dayNumber, itemId, field, defaultValue) => {
    const key = `${dayNumber}-${itemId}`;
    return tempValues[key]?.[field] ?? defaultValue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">Travel.io</span>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  day.items.map((item) => {
                    const editing = isEditing(day.number, item.item_id);
                    
                    return (
                      <div key={item.item_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-13 gap-4">
                          {/* Start Time */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start
                            </label>
                            <input
                              type="time"
                              value={editing ? getTempValue(day.number, item.item_id, 'startTime', item.startTime) : item.startTime}
                              onChange={(e) =>
                                editing && updateTempValue(day.number, item.item_id, 'startTime', e.target.value)
                              }
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          {/* End Time */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                            <input
                              type="time"
                              value={editing ? getTempValue(day.number, item.item_id, 'endTime', item.endTime) : item.endTime}
                              onChange={(e) =>
                                editing && updateTempValue(day.number, item.item_id, 'endTime', e.target.value)
                              }
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          {/* Activity */}
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Activity
                            </label>
                            <input
                              type="text"
                              value={editing ? getTempValue(day.number, item.item_id, 'activity', item.activity) : item.activity}
                              onChange={(e) =>
                                editing && updateTempValue(day.number, item.item_id, 'activity', e.target.value)
                              }
                              disabled={!editing}
                              placeholder="What will you do?"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          {/* Category */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              value={editing ? getTempValue(day.number, item.item_id, 'category', item.category || 'Other') : (item.category || 'Other')}
                              onChange={(e) =>
                                editing && updateTempValue(day.number, item.item_id, 'category', e.target.value)
                              }
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Notes */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={editing ? getTempValue(day.number, item.item_id, 'notes', item.notes) : item.notes}
                              onChange={(e) =>
                                editing && updateTempValue(day.number, item.item_id, 'notes', e.target.value)
                              }
                              disabled={!editing}
                              placeholder="Additional details"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="md:col-span-1 flex items-end gap-2">
                            {!editing ? (
                              <>
                                <button
                                  onClick={() => startEditing(day.number, item.item_id, item)}
                                  className="flex-1 px-3 py-2 text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50"
                                  title="Edit"
                                >
                                  <Edit2 className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                  onClick={() => deleteItineraryItem(day.number, item.item_id)}
                                  className="flex-1 px-3 py-2 text-red-500 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5 mx-auto" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => saveEditing(day.number, item.item_id)}
                                  className="flex-1 px-3 py-2 text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                                  title="Save"
                                >
                                  <Check className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                  onClick={() => cancelEditing(day.number, item.item_id)}
                                  className="flex-1 px-3 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5 mx-auto" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
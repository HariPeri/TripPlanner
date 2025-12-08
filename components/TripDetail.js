import React, { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import SuggestedActivityPicker from "./SuggestedActivityPicker";

const TripDetail = ({
  tripDetails,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  setCurrentView,
}) => {

  const [editingItems, setEditingItems] = useState({});
  const [tempValues, setTempValues] = useState({});
  const [newActivityType, setNewActivityType] = useState("custom");

  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [selectedDayForSuggested, setSelectedDayForSuggested] = useState(null);

  const categories = [
    'Cultural', 'Nature', 'Historic', 'Architecture', 'Museums',
    'Sports', 'Entertainment', 'Food & Drink', 'Shopping',
    'Religious', 'Other'
  ];

  const startEditing = (dayNumber, itemId, item) => {
    const key = `${dayNumber}-${itemId}`;
    setEditingItems(prev => ({ ...prev, [key]: true }));

    setTempValues(prev => ({
      ...prev,
      [key]: {
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        activity: item.activity || '',
        notes: item.notes || '',
        category: item.category || 'Other',
        activityType: item.activityType || 'custom',
        activityId: item.activityId || null
      }
    }));
  };

  const cancelEditing = (dayNumber, itemId) => {
    const key = `${dayNumber}-${itemId}`;
    setEditingItems(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setTempValues(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const saveEditing = async (dayNumber, itemId) => {
    const key = `${dayNumber}-${itemId}`;
    const values = tempValues[key];

    await updateItineraryItem(dayNumber, itemId, {
      startTime: values.startTime,
      endTime: values.endTime,
      notes: values.notes,
      activity: values.activity,
      category: values.category,
      activityType: values.activityType,
      activityId: values.activityId
    });

    cancelEditing(dayNumber, itemId);
  };

  const updateTempValue = (dayNumber, itemId, field, value) => {
    const key = `${dayNumber}-${itemId}`;
    setTempValues(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const isEditing = (d, id) => editingItems[`${d}-${id}`];
  const getTempValue = (d, id, field, fallback) =>
    tempValues[`${d}-${id}`]?.[field] ?? fallback;

  const openSuggestedPicker = (dayNumber) => {
    setSelectedDayForSuggested(dayNumber);
    setShowSuggestedModal(true);
  };

  const handleSuggestedSelect = async (dayNumber, activity) => {
    const itemId = await addItineraryItem(dayNumber, "suggested", activity.activity_id);

    await updateItineraryItem(dayNumber, itemId, {
      activity: activity.name,
      category: activity.category || "Other",
      notes: "",
      startTime: null,
      endTime: null,
      activityType: "suggested",
      activityId: activity.activity_id
    });

    setShowSuggestedModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">Travel.io</span>
          </div>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{tripDetails.title}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="w-5 h-5 mr-2" />
            {tripDetails.country_name}
          </div>
        </div>

        <div className="space-y-6">
          {tripDetails.days?.map(day => (
            <div key={day.number} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Day {day.number}</h2>

                <div className="flex items-center gap-2">
                  <select
                    className="border border-gray-300 rounded px-2 py-1"
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                  >
                    <option value="custom">Custom Activity</option>
                    <option value="suggested">Suggested Activity</option>
                  </select>

                  <button
                    onClick={() =>
                      newActivityType === "custom"
                        ? addItineraryItem(day.number, "custom")
                        : openSuggestedPicker(day.number)
                    }
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Activity
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {day.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No activities planned yet.
                  </p>
                ) : (
                  day.items.map(item => {
                    const editing = isEditing(day.number, item.item_id);
                    const type = item.activityType;

                    const canEditActivityName = editing && type === "custom";
                    const canEditCategory = editing && type === "custom";

                    return (
                      <div key={item.item_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-13 gap-4">

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Start</label>
                            <input
                              type="time"
                              disabled={!editing}
                              value={editing ? getTempValue(day.number, item.item_id, "startTime", item.startTime) : item.startTime}
                              onChange={(e) => updateTempValue(day.number, item.item_id, "startTime", e.target.value)}
                              className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium">End</label>
                            <input
                              type="time"
                              disabled={!editing}
                              value={editing ? getTempValue(day.number, item.item_id, "endTime", item.endTime) : item.endTime}
                              onChange={(e) => updateTempValue(day.number, item.item_id, "endTime", e.target.value)}
                              className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium">Activity</label>
                            <input
                              type="text"
                              disabled={!canEditActivityName}
                              value={editing ? getTempValue(day.number, item.item_id, "activity", item.activity) : item.activity}
                              onChange={(e) => updateTempValue(day.number, item.item_id, "activity", e.target.value)}
                              className={`w-full px-3 py-2 border rounded ${!canEditActivityName ? "bg-gray-100" : ""}`}
                            />

                            <span className={`mt-1 inline-block text-xs px-2 py-1 rounded ${
                              type === "suggested"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {type === "suggested" ? "Suggested" : "Custom"}
                            </span>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Category</label>
                            <select
                              disabled={!canEditCategory}
                              value={editing ? getTempValue(day.number, item.item_id, "category", item.category) : item.category}
                              onChange={(e) => updateTempValue(day.number, item.item_id, "category", e.target.value)}
                              className={`w-full px-3 py-2 border rounded ${!canEditCategory ? "bg-gray-100" : ""}`}
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Notes</label>
                            <input
                              type="text"
                              disabled={!editing}
                              value={editing ? getTempValue(day.number, item.item_id, "notes", item.notes) : item.notes}
                              onChange={(e) => updateTempValue(day.number, item.item_id, "notes", e.target.value)}
                              className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                            />
                          </div>

                          <div className="md:col-span-1 flex items-end gap-2">
                            {!editing ? (
                              <>
                                <button
                                  onClick={() => startEditing(day.number, item.item_id, item)}
                                  className="px-3 py-2 border rounded text-indigo-600 hover:bg-indigo-50"
                                >
                                  <Edit2 className="w-5 h-5 mx-auto" />
                                </button>

                                <button
                                  onClick={() => deleteItineraryItem(day.number, item.item_id)}
                                  className="px-3 py-2 border rounded text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-5 h-5 mx-auto" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => saveEditing(day.number, item.item_id)}
                                  className="px-3 py-2 border rounded text-green-600 hover:bg-green-50"
                                >
                                  <Check className="w-5 h-5 mx-auto" />
                                </button>

                                <button
                                  onClick={() => cancelEditing(day.number, item.item_id)}
                                  className="px-3 py-2 border rounded text-gray-600 hover:bg-gray-50"
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

      {showSuggestedModal && (
        <SuggestedActivityPicker
          country={tripDetails.country_name}
          dayNumber={selectedDayForSuggested}
          onClose={() => setShowSuggestedModal(false)}
          onSelectActivity={handleSuggestedSelect}
        />
      )}
    </div>
  );
};

export default TripDetail;

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const SuggestedActivityPicker = ({
  country,
  onClose,
  onSelectActivity,
  dayNumber
}) => {
  const [loading, setLoading] = useState(true);
  const [suggestedActivities, setSuggestedActivities] = useState([]);

  useEffect(() => {
    async function fetchSuggested() {
      try {
        const res = await fetch(`/api/activities/suggested?country=${country}`);
        const data = await res.json();
        setSuggestedActivities(data.activities || []);
      } catch (err) {
        console.error("Failed to load suggested activities", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggested();
  }, [country]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pick a Suggested Activity</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading...</p>
        ) : suggestedActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No suggested activities found.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {suggestedActivities.map((activity) => (
              <button
                key={activity.activity_id}
                onClick={() => onSelectActivity(dayNumber, activity)}
                className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-indigo-50 transition"
              >
                <p className="font-semibold text-gray-900">{activity.name}</p>
                {activity.categories?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {activity.categories.join(", ")}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedActivityPicker;

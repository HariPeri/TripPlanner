import pool from '@/lib/db';

export async function PUT(request) {
  try {
    const { itemId, dayNumber, tripId, field, value } = await request.json();
    
    if (field === 'activity') {
      // Handle activity updates through the activity/specifies tables
      
      if (!value || value.trim() === '') {
        // If empty, remove the activity link
        await pool.query(
          'DELETE FROM specifies WHERE item_id = ? AND number = ? AND trip_id = ?',
          [itemId, dayNumber, tripId]
        );
        return Response.json({ success: true });
      }
      
      // Check if activity already exists
      const [existingActivity] = await pool.query(
        'SELECT activity_id FROM activity WHERE name = ? AND country_name = (SELECT country_name FROM trip WHERE trip_id = ?)',
        [value, tripId]
      );
      
      let activityId;
      
      if (existingActivity.length > 0) {
        activityId = existingActivity[0].activity_id;
      } else {
        // Create new custom activity
        const [result] = await pool.query(
          'INSERT INTO activity (name, country_name) SELECT ?, country_name FROM trip WHERE trip_id = ?',
          [value, tripId]
        );
        activityId = result.insertId;
      }
      
      // Link activity to itinerary item through specifies table
      await pool.query(
        'INSERT INTO specifies (item_id, number, trip_id, activity_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE activity_id = ?',
        [itemId, dayNumber, tripId, activityId, activityId]
      );
      
      return Response.json({ success: true });
    }
    
    // Handle other fields (startTime, endTime, notes)
    const fieldMap = {
      startTime: 'start_time',
      endTime: 'end_time',
      notes: 'notes'
    };
    
    const dbField = fieldMap[field];
    
    await pool.query(
      `UPDATE itinerary_item SET ${dbField} = ? WHERE item_id = ? AND number = ? AND trip_id = ?`,
      [value, itemId, dayNumber, tripId]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Update item error:', error);
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
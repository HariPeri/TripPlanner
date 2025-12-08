import pool from '@/lib/db';

export async function PUT(request) {
  try {
    const { itemId, dayNumber, tripId, updates, userEmail } = await request.json();
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update times and notes in itinerary_item table
      await connection.query(
        'UPDATE itinerary_item SET start_time = ?, end_time = ?, notes = ? WHERE item_id = ? AND number = ? AND trip_id = ?',
        [updates.startTime || null, updates.endTime || null, updates.notes || '', itemId, dayNumber, tripId]
      );
      
      // Handle activity field
      if (updates.activity !== undefined) {
        if (!updates.activity || updates.activity.trim() === '') {
          // Remove activity link if empty
          await connection.query(
            'DELETE FROM specifies WHERE item_id = ? AND number = ? AND trip_id = ?',
            [itemId, dayNumber, tripId]
          );
        } else {
          // Get the trip's country
          const [trips] = await connection.query(
            'SELECT country_name FROM trip WHERE trip_id = ?',
            [tripId]
          );
          
          if (trips.length === 0) {
            throw new Error('Trip not found');
          }
          
          const countryName = trips[0].country_name;
          
          // Check if activity already exists
          const [existingActivity] = await connection.query(
            'SELECT activity_id FROM activity WHERE name = ? AND country_name = ?',
            [updates.activity.trim(), countryName]
          );
          
          let activityId;
          
          if (existingActivity.length > 0) {
            activityId = existingActivity[0].activity_id;
          } else {
            // Create new activity with description
            const description = updates.description || updates.notes || '';
            
            const [result] = await connection.query(
              'INSERT INTO activity (name, description, country_name) VALUES (?, ?, ?)',
              [updates.activity.trim(), description.substring(0, 255), countryName]
            );
            activityId = result.insertId;
            
            // Mark as custom activity (user-created)
            if (userEmail) {
              await connection.query(
                'INSERT INTO custom_activity (activity_id, email) VALUES (?, ?)',
                [activityId, userEmail]
              );
            }
            
            // Add default category for custom activities
            await connection.query(
                'INSERT INTO activity_category (activity_id, category) VALUES (?, ?)',
                [activityId, 'Custom']
            );
            
            // If additional categories provided, add them
            if (updates.categories && Array.isArray(updates.categories)) {
                for (const category of updates.categories) {
                await connection.query(
                    'INSERT IGNORE INTO activity_category (activity_id, category) VALUES (?, ?)',
                    [activityId, category]
                );
                }
            }
            
            // Add user-selected category
            const category = updates.category || 'Custom';
            await connection.query(
                'INSERT INTO activity_category (activity_id, category) VALUES (?, ?)',
                [activityId, category]
            );
          }
          
          // Link activity to itinerary item
          await connection.query(
            'INSERT INTO specifies (item_id, number, trip_id, activity_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE activity_id = ?',
            [itemId, dayNumber, tripId, activityId, activityId]
          );
        }
      }
      
      await connection.commit();
      return Response.json({ success: true });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update item error:', error);
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
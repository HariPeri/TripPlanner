import pool from '@/lib/db';

export async function PUT(request) {
  try {
    const {
      itemId,
      dayNumber,
      tripId,
      updates,
      userEmail
    } = await request.json();

    const {
      startTime,
      endTime,
      notes,
      activity,
      category,
      activityType,
      activityId
    } = updates;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ALWAYS update base itinerary_item fields
      await connection.query(
        `UPDATE itinerary_item
         SET start_time = ?, end_time = ?, notes = ?
         WHERE item_id = ? AND number = ? AND trip_id = ?`,
        [
          startTime || null,
          endTime || null,
          notes || '',
          itemId,
          dayNumber,
          tripId
        ]
      );

      // HANDLE SUGGESTED ACTIVITIES
      if (activityType === "suggested") {

        // Update activity_type ONLY
        await connection.query(
          `UPDATE itinerary_item
           SET activity_type = 'suggested'
           WHERE item_id = ? AND number = ? AND trip_id = ?`,
          [itemId, dayNumber, tripId]
        );

        // Link to existing activity
        await connection.query(
          `INSERT INTO specifies (item_id, number, trip_id, activity_id)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE activity_id = VALUES(activity_id)`,
          [itemId, dayNumber, tripId, activityId]
        );

        await connection.commit();
        return Response.json({ success: true });
      }

      // 3. CUSTOM ACTIVITY LOGIC
      if (activityType === "custom") {

        // If user cleared the name, remove activity link
        if (!activity || activity.trim() === "") {
          await connection.query(
            `DELETE FROM specifies
             WHERE item_id = ? AND number = ? AND trip_id = ?`,
            [itemId, dayNumber, tripId]
          );

          await connection.query(
            `UPDATE itinerary_item
             SET activity_type = 'custom'
             WHERE item_id = ? AND number = ? AND trip_id = ?`,
            [itemId, dayNumber, tripId]
          );

          await connection.commit();
          return Response.json({ success: true });
        }

        const trimmedName = activity.trim();

        const [tripRows] = await connection.query(
          `SELECT country_name FROM trip WHERE trip_id = ?`,
          [tripId]
        );

        if (tripRows.length === 0) throw new Error("Trip not found");
        const countryName = tripRows[0].country_name;

        const [existingActivity] = await connection.query(
          `SELECT activity_id
           FROM activity
           WHERE name = ? AND country_name = ?`,
          [trimmedName, countryName]
        );

        let newActivityId;

        if (existingActivity.length > 0) {
          newActivityId = existingActivity[0].activity_id;
        } else {
          const description = notes || "";

          const [insertResult] = await connection.query(
            `INSERT INTO activity (name, description, country_name)
             VALUES (?, ?, ?)`,
            [trimmedName, description.substring(0, 255), countryName]
          );

          newActivityId = insertResult.insertId;

          if (userEmail) {
            await connection.query(
              `INSERT INTO custom_activity (activity_id, email)
               VALUES (?, ?)`,
              [newActivityId, userEmail]
            );
          }

          await connection.query(
            `INSERT INTO activity_category (activity_id, category)
             VALUES (?, ?)`,
            [newActivityId, category || "Custom"]
          );
        }

        // Update activity_type flag
        await connection.query(
          `UPDATE itinerary_item
           SET activity_type = 'custom'
           WHERE item_id = ? AND number = ? AND trip_id = ?`,
          [itemId, dayNumber, tripId]
        );

        // Link item → activity
        await connection.query(
          `INSERT INTO specifies (item_id, number, trip_id, activity_id)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE activity_id = VALUES(activity_id)`,
          [itemId, dayNumber, tripId, newActivityId]
        );
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
    console.error("Update item error:", error);
    return Response.json({ error: "Failed to update item" }, { status: 500 });
  }
}

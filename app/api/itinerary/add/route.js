import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { tripId, dayNumber, activityType, activityId } = await request.json();

    if (!tripId || !dayNumber) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // ---------- GET NEXT item_id ----------
    const [maxItem] = await pool.query(
      `SELECT COALESCE(MAX(item_id), 0) + 1 AS next_id
       FROM itinerary_item
       WHERE number = ? AND trip_id = ?`,
      [dayNumber, tripId]
    );

    const itemId = maxItem[0].next_id;

    // ---------- INSERT into itinerary_item ----------
    await pool.query(
      `INSERT INTO itinerary_item (item_id, number, trip_id, activity_type)
       VALUES (?, ?, ?, ?)`,
      [itemId, dayNumber, tripId, activityType || "custom"]
    );

    // ---------- If suggested activity, link it immediately ----------
    if (activityType === "suggested" && activityId) {
      await pool.query(
        `INSERT INTO specifies (item_id, number, trip_id, activity_id)
         VALUES (?, ?, ?, ?)`,
        [itemId, dayNumber, tripId, activityId]
      );
    }

    return Response.json({ 
      success: true,
      itemId 
    });

  } catch (error) {
    console.error("Add item error:", error);
    return Response.json({ error: "Failed to add item" }, { status: 500 });
  }
}

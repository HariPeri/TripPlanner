import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { tripId, dayNumber } = await request.json();
    
    // Get the next item_id for this day/trip combination
    const [maxItem] = await pool.query(
      'SELECT COALESCE(MAX(item_id), 0) + 1 as next_id FROM itinerary_item WHERE number = ? AND trip_id = ?',
      [dayNumber, tripId]
    );
    
    const itemId = maxItem[0].next_id;
    
    // Insert new item
    await pool.query(
      'INSERT INTO itinerary_item (item_id, number, trip_id) VALUES (?, ?, ?)',
      [itemId, dayNumber, tripId]
    );
    
    return Response.json({ 
      success: true, 
      itemId: itemId 
    });
  } catch (error) {
    console.error('Add item error:', error);
    return Response.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
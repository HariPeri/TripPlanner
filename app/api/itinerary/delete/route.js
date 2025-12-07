import pool from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const dayNumber = searchParams.get('dayNumber');
    const tripId = searchParams.get('tripId');
    
    // Delete from specifies first (if foreign key constraints require it)
    await pool.query(
      'DELETE FROM specifies WHERE item_id = ? AND number = ? AND trip_id = ?',
      [itemId, dayNumber, tripId]
    );
    
    // Delete the itinerary item
    await pool.query(
      'DELETE FROM itinerary_item WHERE item_id = ? AND number = ? AND trip_id = ?',
      [itemId, dayNumber, tripId]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
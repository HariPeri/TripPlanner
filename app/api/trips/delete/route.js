import pool from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    
    // Delete trip (cascade will handle creates, days, and items)
    await pool.query('DELETE FROM trip WHERE trip_id = ?', [tripId]);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete trip error:', error);
    return Response.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
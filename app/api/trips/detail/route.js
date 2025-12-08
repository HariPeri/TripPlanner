import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    
    // Get trip info
    const [trips] = await pool.query(
      'SELECT trip_id, title, country_name FROM trip WHERE trip_id = ?',
      [tripId]
    );
    
    if (trips.length === 0) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    // Get all days and their itinerary items with activities
    const [days] = await pool.query(
        `SELECT 
          d.number,
          ii.item_id,
          ii.start_time as startTime,
          ii.end_time as endTime,
          ii.notes,
          a.name as activity,
          GROUP_CONCAT(ac.category) as category
         FROM day d
         LEFT JOIN itinerary_item ii ON d.number = ii.number AND d.trip_id = ii.trip_id
         LEFT JOIN specifies s ON ii.item_id = s.item_id AND ii.number = s.number AND ii.trip_id = s.trip_id
         LEFT JOIN activity a ON s.activity_id = a.activity_id
         LEFT JOIN activity_category ac ON a.activity_id = ac.activity_id
         WHERE d.trip_id = ?
         GROUP BY d.number, ii.item_id
         ORDER BY d.number, ii.start_time`,
        [tripId]
      );
    
    // Group items by day
    const daysMap = {};
    days.forEach(row => {
      if (!daysMap[row.number]) {
        daysMap[row.number] = {
          number: row.number,
          items: []
        };
      }
      
      if (row.item_id !== null) {
        daysMap[row.number].items.push({
          item_id: row.item_id,
          startTime: row.startTime || '',
          endTime: row.endTime || '',
          activity: row.activity || '',
          notes: row.notes || ''
        });
      }
    });
    
    const tripDetails = {
      ...trips[0],
      status: 'Planning',
      days: Object.values(daysMap)
    };
    
    return Response.json({ tripDetails });
  } catch (error) {
    console.error('Trip detail error:', error);
    return Response.json({ error: 'Failed to fetch trip details' }, { status: 500 });
  }
}
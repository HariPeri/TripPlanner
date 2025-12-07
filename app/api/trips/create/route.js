import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email, title, country, days } = await request.json();
    
    // Insert the trip
    const [result] = await pool.query(
      'INSERT INTO trip (title, country_name) VALUES (?, ?)',
      [title, country]
    );
    
    const tripId = result.insertId;
    
    // Link user to trip in creates table
    await pool.query(
      'INSERT INTO creates (email, trip_id) VALUES (?, ?)',
      [email, tripId]
    );
    
    // Create day records for each day
    const dayInserts = [];
    for (let i = 1; i <= days; i++) {
      dayInserts.push([i, tripId]);
    }
    
    await pool.query(
      'INSERT INTO day (number, trip_id) VALUES ?',
      [dayInserts]
    );
    
    return Response.json({ success: true, tripId });
  } catch (error) {
    console.error('Create trip error:', error);
    return Response.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
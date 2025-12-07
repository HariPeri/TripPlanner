import pool from '@/lib/db';

export async function GET(request) {
  try {
    const [countries] = await pool.query(
      'SELECT country_name, continent FROM country ORDER BY country_name'
    );
    
    return Response.json({ countries });
  } catch (error) {
    console.error('List countries error:', error);
    return Response.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
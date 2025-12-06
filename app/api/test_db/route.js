import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test connection
    const [tables] = await pool.query('SHOW TABLES');
    
    // Get count of users
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    return NextResponse.json({ 
      success: true,
      message: 'Connected to GCP database!',
      tables: tables,
      userCount: users[0].count
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
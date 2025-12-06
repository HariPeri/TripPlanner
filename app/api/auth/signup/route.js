import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email, username, password, firstName, lastName } = await request.json();
    
    // Check if email exists
    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    
    if (existing[0].count > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Insert new user
    await pool.query(
      'INSERT INTO users (email, username, user_password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [email, username, password, firstName, lastName]
    );
    
    return NextResponse.json({ 
      success: true, 
      user: { email, username, firstName, lastName }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
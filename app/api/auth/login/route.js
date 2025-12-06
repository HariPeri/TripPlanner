import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const [users] = await pool.query(
      'SELECT email, username, first_name, last_name FROM users WHERE email = ? AND user_password = ?',
      [email, password]
    );
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        email: users[0].email,
        username: users[0].username,
        firstName: users[0].first_name,
        lastName: users[0].last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
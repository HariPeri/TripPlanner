

import { NextResponse } from 'next/server';

import pool from '@/lib/db';


import { verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;


    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    //look up user by email
    const [rows] = await pool.query(
      `
        SELECT * 
        FROM users
        WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = rows[0];

    //compare supplied password with stored hash
    const isValid = await verifyPassword(password, user.user_password);
    if (!isValid) {
      return NextResponse.json(

        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id ?? null,
          email: user.email,
          username: user.username,
          firstName: user.first_name ?? null,
          lastName: user.last_name ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName } = body;

    //basic validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const [existingUsers] = await pool.query(
      'SELECT 1 FROM users WHERE email = ? OR username = ?',
      [email, username]
    );


    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email or username already in use' },
        { status: 409 }
      );
    }

    // hash the password before storing it
    const passwordHash = await hashPassword(password);

    //insert new user with hashed password
    await pool.query(
      `
        INSERT INTO users (email, username, user_password, first_name, last_name)
        VALUES (?, ?, ?, ?, ?)
      `,
      [email, username, passwordHash, firstName ?? null, lastName ?? null]
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          email,
          username,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email required' },
                { status: 400 }
            )
        }

        // Update the most recent open session for this user
        await pool.query(
            `UPDATE login_history
       SET logout_time = NOW()
       WHERE user_email = ?
       AND logout_time IS NULL
       ORDER BY login_time DESC
       LIMIT 1`,
            [email]
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

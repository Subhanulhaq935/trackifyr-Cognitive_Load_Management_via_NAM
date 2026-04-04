import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ensureUsersTable } from '@/lib/usersSchema'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const body = await req.json()
    const { fullName, email, password } = body || {}

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'fullName, email, and password are required' },
        { status: 400 },
      )
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    const passwordHash = await bcrypt.hash(String(password), 10)

    await ensureUsersTable()

    const result = await query(
      `
      INSERT INTO users (full_name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email
    `,
      [String(fullName).trim(), normalizedEmail, passwordHash],
    )

    const user = result.rows[0]
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    })
  } catch (err) {

    console.error("FULL DATABASE ERROR:", err);
    // Unique constraint violation => email already exists
    if (String(err?.message || '').includes('users_email_key')) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json(
      { success: false, error: 'Failed to sign up' },
      { status: 500 },
    )
  }
}


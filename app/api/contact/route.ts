import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { name, email, message } = await request.json()
        
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: process.env.EMAIL || '',
            subject: `New contact from ${name}`,
            html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            `,
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Contact form error:', error)

        if (error.message?.includes('rate limit') || error.status === 429) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to send message. Please try again.' },
            { status: 500 }
        )
    }
}
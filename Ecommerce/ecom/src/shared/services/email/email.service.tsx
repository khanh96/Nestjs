import { Injectable } from '@nestjs/common'
import React from 'react'
import OTPEmail from 'emails/otp'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'

Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  async sendEmailOtp(payload: { from: string; to: string | string[]; subject: string; content: string }) {
    return await this.resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      // html: payload.content,
      react: <OTPEmail otpCode={payload.content} title={payload.subject} />,
    })
  }
}

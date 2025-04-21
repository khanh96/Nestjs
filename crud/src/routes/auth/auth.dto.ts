import { Exclude } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginBodyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string
  @IsString()
  password: string
}

export class LoginResponseDTO {
  accessToken: string
  refreshToken: string

  constructor(partial: Partial<LoginResponseDTO>) {
    Object.assign(this, partial)
  }
}

export class RegisterBodyDTO extends LoginBodyDTO {
  @IsString()
  name: string
  @IsString()
  confirmPassword: string
}

export class RegisterResponseDTO {
  id: number
  email: string
  name: string
  @Exclude() // Exclude password from the response
  password: string
  createdAt: Date
  updatedAt: Date

  //  HIển thị tên và email trong response
  // @Expose()
  // get fullNameEmail(): string {
  //   return `${this.name} - ${this.email}`
  // }

  constructor(partial: Partial<RegisterResponseDTO>) {
    Object.assign(this, partial)
  }
}

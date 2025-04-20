import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginBodyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string
  @IsString()
  password: string
}

export class RegisterBodyDTO extends LoginBodyDTO {
  @IsString()
  name: string
}

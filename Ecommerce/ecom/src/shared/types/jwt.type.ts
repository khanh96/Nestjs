export interface TokenPayload {
  exp: number // Thời gian hết hạn token
  iat: number // Thời gian tạo token
}

export interface AccessTokenPayload extends TokenPayload {
  userId: number // ID người dùng
  deviceId: number // ID thiết bị
  roleId: number // ID quyền
  roleName: string // Tên quyền
}

export interface RefreshTokenPayload extends TokenPayload {
  userId: number // ID người dùng
  deviceId: number // ID thiết bị
}

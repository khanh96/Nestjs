export interface TokenPayload {
  userId: number // ID người dùng
  exp: number // Thời gian hết hạn token
  iat: number // Thời gian tạo token
}

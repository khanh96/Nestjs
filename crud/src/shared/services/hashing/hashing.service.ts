import { Injectable } from '@nestjs/common'
import { hash, compare } from 'bcrypt'

// saltRounds là số lần mã hóa, càng lớn thì càng an toàn nhưng cũng tốn thời gian hơn
const saltRounds = 10
@Injectable()
export class HashingService {
  hash(value: string): Promise<string> {
    // Đoạn code này sẽ mã hóa giá trị đầu vào
    return hash(value, saltRounds)
  }

  compare(value: string, hash: string): Promise<boolean> {
    // Đoạn code này sẽ so sánh giá trị đã hash với giá trị đầu vào
    return compare(value, hash)
  }
}

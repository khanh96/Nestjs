# Redis
- Redis (Remote Dictionary Server) là một hệ thống lưu trữ dữ liệu dạng key-value trong bộ nhớ (in-memory), hoạt động cực kỳ nhanh.

**Đặc điểm chính:**
Lưu trữ trong RAM - tốc độ truy xuất cực nhanh (micro-seconds)
Hỗ trợ nhiều kiểu dữ liệu: strings, lists, sets, sorted sets, hashes, bitmaps, hyperloglogs, streams
Có thể persistence - lưu xuống disk để không mất dữ liệu khi restart
Open source và rất phổ biến

**Dùng để làm gì?**
1. Caching (phổ biến nhất)
```ts
// Lưu kết quả API call để tránh query DB nhiều lần
await redis.set('user:123', JSON.stringify(userData), 'EX', 3600); // expire sau 1h

// Lần sau lấy từ cache
const cached = await redis.get('user:123');
```
2. Session Storage
```ts
// Lưu session của user khi login
await redis.set(`session:${sessionId}`, JSON.stringify(userSession), 'EX', 86400);
```
3. Rate Limiting
```ts
// Giới hạn API calls
const key = `rate_limit:${userId}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 60); // reset sau 60s
}
if (count > 100) {
  throw new Error('Too many requests');
}
```
4. Queue/Message Broker
- Xử lý background jobs (gửi email, process video...)
  - Sử dụng BullMQ (thư viện queue phổ biến cho NestJS)
```ts
// email.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  async process(job: Job): Promise<any> {
    const { to, subject, content } = job.data;
    
    console.log(`Processing email job ${job.id}`);
    
    // Giả lập gửi email
    await this.sendEmail(to, subject, content);
    
    // Update progress
    await job.updateProgress(100);
    
    return { sent: true, timestamp: new Date() };
  }

  private async sendEmail(to: string, subject: string, content: string) {
    // Logic gửi email thực tế
    await new Promise(resolve => setTimeout(resolve, 2000)); // simulate
    console.log(`Email sent to ${to}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed:`, error.message);
  }
}
```

- Pub/Sub messaging giữa các services
1. Real-time Analytics
2. Distributed Lock
```ts
// Đảm bảo chỉ 1 instance xử lý job tại 1 thời điểm
const lock = await redis.set('lock:payment:123', 'locked', 'NX', 'EX', 10);
if (lock) {
  // Xử lý payment
}
```

**Khi nào nên dùng Redis?**
- ✅ Cần tốc độ truy xuất cực nhanh
- ✅ Dữ liệu tạm thời (cache, session)
- ✅ Cần share data giữa nhiều server instances
- ✅ Rate limiting, real-time features
- ❌ Không phù hợp cho dữ liệu quan trọng cần bảo mật cao
- ❌ Không phù hợp làm primary database cho dữ liệu lâu dài


## [Setup Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-mac-os/)

- install redis
```bash
brew install redis
```
- run redis
```bash
redis-server
```
- start redis
```bash
brew services start redis
```
- Check info
```bash
brew services info redis
```
- stop redis
```bash
brew services stop redis
```


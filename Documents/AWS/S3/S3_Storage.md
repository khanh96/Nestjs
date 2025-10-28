### Amazon S3


- Để sử dụng ta và connect với S3 ta sử dụng 2 thư viện:
  - https://www.npmjs.com/package/@aws-sdk/lib-storage
  - https://www.npmjs.com/package/@aws-sdk/client-s3


- Tạo config env để kết nối với s3
  - S3_REGION=ap-southeast-1
  - S3_ACCESS_KEY=your_access_key_here
  - S3_SECRET_KEY=your_secret_key_here


## 🧾 Tóm tắt sự khác biệt

| So sánh | `@aws-sdk/client-s3` | `@aws-sdk/lib-storage` |
|----------|----------------------|------------------------|
| **Mục đích** | Cung cấp API cơ bản cho S3 | Hỗ trợ upload dễ dàng, đặc biệt multipart |
| **Loại** | Core SDK client | Helper library (wrapper) |
| **Multipart Upload** | Tự xử lý thủ công | Tự động chia nhỏ và upload |
| **Theo dõi tiến độ upload** | Không hỗ trợ | Có hỗ trợ (`httpUploadProgress`) |
| **File nhỏ** | ✔️ Rất phù hợp | ✔️ Cũng được |
| **File lớn** | ⚠️ Cần tự xử lý | ✅ Rất phù hợp |
| **Phụ thuộc** | Không phụ thuộc vào thư viện khác | Phụ thuộc `@aws-sdk/client-s3` |

---
- Dùng **`@aws-sdk/client-s3`** nếu bạn chỉ cần thao tác cơ bản:
  - Upload file nhỏ  
  - Xóa hoặc đọc dữ liệu  
  - Quản lý bucket  

- Dùng **`@aws-sdk/lib-storage`** nếu bạn cần:
  - Upload file lớn (tự động multipart)  
  - Theo dõi tiến độ upload  
  - Đơn giản hóa logic upload  



### Setting public access image
[setting permission for website access s3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html)

[setting permission cors when presigned url](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html?icmpid=docs_amazons3_console)

### Lưu ý.
Các file ở trên s3 lưu bằng key. các key trùng nhau sẽ thay thế ảnh.
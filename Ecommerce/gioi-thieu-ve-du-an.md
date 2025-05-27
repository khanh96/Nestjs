# Giới thiệu dự án

Thiết kế 1 website bán hàng tương tự Shopee với các chức năng sau:

- Có 3 vai trò chính: Khách hàng, Người bán (Seller), Admin

- Admin có thể quản lý tất cả các chức năng của website

- Người bán có thể đăng sản phẩm, quản lý sản phẩm, xem lịch sử bán hàng đánh giá khách hàng

- Khách hàng có thể xem sản phẩm, thêm vào giỏ hàng, mua hàng, xem lịch sử mua hàng, đánh giá sản phẩm

## Một số chức năng đặc biệt

- Sử dụng Access Token và Refresh Token cho Authentication, nhưng vẫn quản lý được số lượng thiết bị đăng nhập

- Áp dụng xác thực 2 yếu tố (2FA)

- Phân quyền dựa trên Role và Permission

- Sản phẩm chứa nhiều biến thể như size, màu, số lượng, giá,... (Product Variant)

- Thanh toán đơn hàng online bằng mã QR Code

- Gửi mail thông báo định kỳ cho khách hàng khi có sản phẩm mới (Cron Job)

## Phân tích sơ bộ các đối tượng cần tạo bảng

- **Language**: id, name, code
- **User**: id, name, email, password
- **UserTranslation**: id, userId, languageId, description, address
- **RefreshToken**: token, userId

Để phục vụ cho việc gửi mã OTP 6 số về email khi register hoặc forgot password, cần tạo thêm bảng để lưu mã OTP

- **VerificationCode**: id, email, code, expiresAt

Để phục vụ phân quyền Role và Permission thì

- **Role**: id, name, isActive
- **Permission**: id, name, path, method

> Quan hệ giữa **Role** và **Permission** là n-n, nên cần tạo bảng trung gian (RolePermission)

Liên quan đến sản phẩm

- **Product**: id, price, categoryId
- **ProductTranslation**: id, productId, languageId, name, description
- **Category**: id, parentCategoryId
- **CategoryTranslation**: id, categoryId, languageId, name
- **Brand**: id, logo
- **BrandTranslation**: id, brandId, languageId, name

> Quan hệ giữa **Product** và **Category** là n-n, nên cần tạo bảng trung gian (ProductCategory)
> 1 **Category** cha có thể có nhiều **Category** con, nên cần tạo thêm cột `parentCategoryId` trong bảng **Category**. Đây gọi là **tự** quan hệ 1-n

Hỗ trợ Product Variant

- **Variant**: id, name, productId
- **VariantOption**: id, value, variantId
- **SKU**: id, value, price, stock, images, productId

> Quan hệ giữa **VariantOption** và **SKU** là n-n, nên cần tạo bảng trung gian (VariantOptionSKU)

Hỗ trợ mua hàng

- **CartItem**: id, userId, skuId, quantity
- **ProductSKUSnapshot** (clone sản phẩm sku lúc đó, đề phòng sau này sản phẩm bị thay đổi thì không ảnh hưởng đến lịch sử mua hàng): id, productName, price, images, skuValue, skuId, orderId
- **Order**: id, userId, status

Hỗ trợ đánh giá sản phẩm

- **Review**: id, userId, productId, rating, content

Hỗ trợ thông tin thanh toán chuyển khoản

- **PaymentTransaction** (Đây là payload mà cổng thanh toán bắn cho mình khi có 1 ai đó chuyển khoản vào bank mình): id, gateway, transactionDate, accountNumber, code, body,...

Chức năng nhắn tin

- **Message**: id, fromUserId, toUserId, content, isReadAt

FAQ:

1. Tại sao cần tạo bảng **VerificationCode** mà không gọp vào bảng **User**?

Liên quan đến flow đăng ký tài khoản

Mình muốn verify email trước khi người dùng nhấn submit đăng ký tài khoản, điều này giúp tránh được email rác cũng như là xung đột email giữa các user


## Sử dụng DBML
https://dbml.dbdiagram.io/docs/#schema-definition


### Relationships & Foreign Key Definitions
<: one-to-many. E.g: users.id < posts.user_id
>: many-to-one. E.g: posts.user_id > users.id
-: one-to-one. E.g: users.id - user_infos.user_id
<>: many-to-many. E.g: authors.id <> books.id



## Chức năng

### Auth

#### Sent otp 
1. Người dùng gửi **API Sent OTP auth/sent-otp**
   1. Check xem **email** đã tồn tại hay chưa?
   2. Generate otp dựa vào thuật toán nào đó
   3. Insert **code** vào DB bảng **VerificationCode**
      - Nếu **email** đã tồn tại thì update **code** vào bảng **VerificationCode** của **email** đó
      - Nếu **email** chưa tồn tại thì insert **code** vào bảng **VerificationCode** của **email** đó
   4. Send email với code
      1. Sử dụng Resend để gửi email.


#### Register 
1. Người dùng gửi api **API register auth/register**
2. Validate đàu vào thông tin người dùng đăng nhập (email, password, name, phone,...)
3. Verification code
   - Nếu **code** sai thì báo lỗi sai code
   - Nếu **code** hết hạn thì báo hết hạn    
 - 
4. Hasing password
5. Insert user vào DB bảng **User**

#### Login 
1. Người dùng nhập **email** và **password** gửi **API login auth/login**
   1. Lấy user_agent và ip của người dùng khi gọi api
   2. Kiểm tra email có tồn tại trong DB hay k? 
   3. Kiểm tra password có đúng hay k? (password phải hassing)
   4. Nếu đã bật 2FA thì xác thực 2FA (dựa vào **totp** (app) or **code**(email) gửi từ client)
      1. Kiểu tra mã **totp** or **code** có đúng?
         1. Không: Gửi lỗi **totp** invalid or **code** invalid.
         2. Có: Thực hiện bước tiếp theo.
   5. Tạo record trong bảng **Device** để biết người dùng đang login bằng gì. Từ đó có **deviceId**, **roleId**, **roleName**
   6. Tạo access_token và refresh_token. refresh_token lưu vào bảng **RefreshToken**.
   7. Trả access_token và refresh_token về cho người dùng.

#### Refresh token
- Người dùng hết access_token và muốn cấp lại access_token dựa vào refresh_token để khi đăng khi hết thời hạn access_token sẽ tự động gia hạn ở frontend và sẽ không bị logout ra ngoài.
1. Client gửi **refresh_token** vào api **API auth/refresh-token**
   1. Kiểm tra **refresh_token** có hợp lệ hay không?
   2. Kiểm tra **refresh_token** có tồn tại trong DB không?
   3. Cập nhật lại **userAgent**, **ip** cho table **Device**
   4. Xóa **refresh_token** cũ
   5. Tạo **access_token**. Tạo **refresh_token** mới lưu vào DB
   6. Trả **access_token** và **refresh_token** cho người dùng

#### Logout
- Logout người dùng
1. Client gửi **refresh_token** vào api **API auth/logout**
  1. Kiểm tra **refresh_token** có hợp lệ hay không?
  2. Xóa **refresh_token** trong DB
  3. Cập nhật lại trạng thái login trong **Device**
  4. Gửi message logout

#### Google Oauth
- Đăng ký trên google console để có 3 giá trị **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**, **GOOGLE_REDIRECT_URI**, **GOOGLE_CLIENT_OAUTH_URL**
1. Client call api **API auth/google-link** để lấy authUrl
   1. Tạo url gồm **scope**, **clientID**.
      1. Khởi tạo **scope** cho **url**
      2. Tạo **state** cần truyền cho **url** để gửi cho Client
      3. Generate auth **url** (sử dụng googleapi)
      4. Trả **url** cho client
2. Server redirect client với url định nghĩa ở client **GOOGLE_CLIENT_OAUTH_URL** từ **API google/callback**
   1. Lấy **code**, **state** từ query params.
   2. Dùng Json để parse **state** lấy ra **userAgent** và **ipAddress**
   3. Dùng **googleapis** để lấy **accesstoken** từ **code**
   4. Thiết lập thông tin xác thực với tokens  **setCredentials** từ **googleapis**
   5. Lấy thông tin user profile. Từ đó sẽ có **email**, **name**,...
   6. Xem user đã được sử dụng trong hệ thống chưa?
      1. Nếu chưa có
         1. Lấy roleID
         2. Tạo và hasing password
         3. Tạo user
      2. Nếu tồn tại 
      => Từ đó ta có **userId**,
   7. Tạo device từ **userId**, **ipAddress**, **userAgent**
   8. Generate accessToken, refreshToken 
   9. Tạo url để redirect và gán **accessToken**, **refreshToken** trong url


#### Forgot password
1. Client gửi **email** call **API auth/send-otp**
2. Client nhập **otp**, **confirmPassword**, **password** rồi call API **auth/reset-password**
   1. Kiểm tra **otp** có đúng không, có trong DB k?
      1. Không: Thì báo lỗi Invalid, Or hết hạn thì báo hết hạn.
      2. Có: Lấy ra **email**
   2. Tìm user với **email** có trong DB không?
      1. Không: Báo lỗi không có user
      2. Có: Lấy ra **user**
   3. Hasing **password**
   4. Update **user** với **password** mới.
   5. Xóa **otp** đi
   6. Gửi **message** về cho Client.


#### 2FA (Two-Factor Authentication)
##### Tạo mã 2FA 
1. Client call **API auth/2fa/setup** (authentication requied)
   1. Kiểm tra xem có **user** dựa vào **userId** hay không?
      1. Không: Báo **user** không tồn tại
      2. Có: Xem user đã bật 2FA chưa?
         1. Rồi: thông báo lỗi đã bật 2FA
         2. Chưa: thì làm tiếp
   2. Tạo mã 2FA dựa trên thư viện **otpauth** => **secret** và **uri**
   3. Update field 2FA **totpSecret** in table **User**.
   4. Trả về cho người dùng **URI** để generate ra QR code. và **totp**

##### Vô hiệu hóa mã 2FA
1. Client call **API auth/2fa/disable** và gửi  **totpCode** or **code** 
   1. Kiểm tra xem user có tồn tại không?
      1. Không: Báo lỗi không có user
      2. Có: Kiểm tra dùng **2FA** hay là dùng **otpcode**
         1. Kiểm tra xem bật 2FA chưa?
            1. Chưa: Báo lỗi chưa bật 2FA
            2. Có: Kiểm tra **totpCode** có hợp lệ hay không
               1. Chưa: báo lỗi **totpCode** không hợp lệ
               2. Có: Thì làm tiếp
         2. Kiểm tra dùng **otpcode** đúng không (email)
            1. Chưa: Báo lỗi invalid **otpcode**
            2. Có : Kiểm tra hạn của **otpcode** còn không?
               1. Không: Báo lỗi hết hạn
               2. Có: Thì làm tiếp 
      3. Update user với **totpCode** = null để tắt 2FA
   2. Thông báo cho user biết là **Vô hiệu hóa mã 2FA**


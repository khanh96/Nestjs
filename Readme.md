# Tổng quan

- Keyword: **Cronjob**, 
  - **CronJob** là kiểu viết 1 func thực hiện một nhiệm vụ nào đó khi mình có thể set thời gian cho nó thực hiện.



### Hướng sử dụng authentication

Nếu dự án thấy nhiều router là public thì:
- Không dùng decorator => public
- Dùng decorator => sài guard.

Còn nếu dự án thấy nhiều route là private thì ngược lại
- Dùng decorator isPublic => Mới public
- Không dùng decorator => Mặc định là Beartoken auth.


### Để hệ thống hoạt động ổn dịnh
1. Không cho phép bất kỳ ai có thể xóa role cơ bản này: ADMIN, CLIENT, SELLER. Vì 3 role này chúng ta dùng trong code rất nhiều, ví dụ register là auto role CLIENT.
2. Không cho phép bất kỳ ai cập nhật role ADMIN, kể cả user với role ADMIN. Tránh ADMIN này thay đổi permission tầm bậy làm mất quyền kiểm soát hệ thống.
3. 
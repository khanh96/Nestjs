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
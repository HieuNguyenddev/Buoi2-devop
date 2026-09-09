# Hệ Thống Quản Lý Sinh Viên (ASP.NET Core 10 Web API & EF Core SQL Server)

Ứng dụng Web API Quản lý Sinh viên xây dựng bằng **ASP.NET Core**, **Entity Framework Core (SQL Server Code First)** và **Frontend (HTML5/CSS3/Vanilla JS)**.

---

## 🚀 Tính Năng Chính
- **CRUD Sinh Viên**: Thêm mới, chỉnh sửa, xóa và hiển thị danh sách sinh viên.
- **EF Core Migrations (Code First)**: Tự động khởi tạo và migrate bảng `Students` vào SQL Server khi khởi chạy (`MigrateAsync()`).
- **Swagger / OpenAPI**: Tích hợp UI kiểm thử API chuyên nghiệp.
- **Frontend Tĩnh (`wwwroot`)**: Giao diện responsive, hiện đại tích hợp bộ dữ liệu mẫu dự phòng (Smart Fallback).
- **GitHub Actions CI/CD Pipeline**: Tự động hóa quá trình khôi phục gói, biên dịch `.NET` và deploy giao diện lên Vercel.

---

## 🛠️ Hướng Dẫn Chạy Tại Local

1. **Sao chép cấu hình môi trường**:
   ```bash
   cp .env.example .env
   ```
2. **Khởi chạy ứng dụng**:
   ```bash
   dotnet run
   ```
3. Truy cập Swagger UI tại: `http://localhost:5292/swagger`
4. Truy cập Web Frontend tại: `http://localhost:5292`

---

## 🔄 Quy Trình GitHub Actions CI/CD

File workflow đặt tại: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### 📌 Các bước tự động hóa:
1. **Kiểm tra mã nguồn (Checkout)** mỗi khi có commit hoặc Pull Request vào nhánh `main`.
2. **Setup môi trường .NET SDK** 9.0/10.0 trên Linux Runner (`ubuntu-latest`).
3. **Khôi phục gói & Biên dịch project** (`dotnet restore`, `dotnet build --configuration Release`).
4. **Đóng gói kết quả (Publish)** và lưu trữ Artifact.
5. **Tự động Deploy Frontend lên Vercel**.

### 🔐 Cấu hình GitHub Secrets (Nếu sử dụng Vercel Direct Deploy Action):
- `VERCEL_TOKEN`: Vercel Personal Access Token
- `VERCEL_ORG_ID`: Vercel Organization / Team ID
- `VERCEL_PROJECT_ID`: Vercel Project ID

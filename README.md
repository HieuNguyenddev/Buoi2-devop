# HỆ THỐNG QUẢN LÝ SINH VIÊN

Hệ thống quản lý sinh viên fullstack xây dựng trên nền tảng ASP.NET Core Web API kết hợp Entity Framework Core, hệ quản trị cơ sở dữ liệu SQL Server và giao diện người dùng hiện đại với hiệu ứng Glassmorphism (HTML5, CSS3, JavaScript ES6).

- Công nghệ sử dụng: ASP.NET Core 10, Entity Framework Core, SQL Server, Vanilla JavaScript.
- Địa chỉ ứng dụng trực tuyến: https://buoi2-devop.vercel.app

---

## 1. Cấu Trúc Thư Mục Dự Án

```
buoi2/
|-- Controllers/
|   `-- StudentController.cs     # Bộ điều khiển tiếp nhận và xử lý các yêu cầu HTTP REST API (GET, POST, PUT, DELETE)
|-- Data/
|   `-- AppDbContext.cs          # Cấu hình kết nối Entity Framework Core và dữ liệu mẫu khởi tạo (Seed Data)
|-- Migrations/                  # Các tệp Migration dùng để đồng bộ và cập nhật cấu trúc bảng trong cơ sở dữ liệu
|-- Models/
|   `-- Student.cs               # Lớp đối tượng mô tả cấu trúc dữ liệu của Sinh viên
|-- wwwroot/                     # Thư mục chứa toàn bộ giao diện tĩnh được phân phối qua Vercel
|   |-- css/
|   |   `-- style.css            # Định dạng giao diện theo phong cách Glassmorphism và màu sắc hiện đại
|   |-- js/
|   |   `-- app.js               # Xử lý tương tác giao diện, gọi API và tự động sao lưu dữ liệu cục bộ
|   `-- index.html               # Trang giao diện người dùng chính
|-- .github/
|   `-- workflows/
|       `-- ci-cd.yml            # Quy trình tự động hóa kiểm tra mã nguồn (Build) và triển khai (Deploy) qua GitHub Actions
|-- Program.cs                   # Điểm khởi chạy của ứng dụng, cấu hình Dependency Injection, CORS, Swagger và Middleware
|-- appsettings.json             # Tệp cấu hình ứng dụng mặc định
|-- vercel.json                  # Tệp cấu hình máy chủ tĩnh phục vụ triển khai trên nền tảng Vercel
|-- .env.example                 # Tệp mẫu hướng dẫn khai báo biến môi trường
`-- SimpleCrudApp.csproj         # Tệp cấu hình dự án .NET và các gói thư viện NuGet phụ thuộc
```

---

## 2. Hướng Dẫn Cài Đặt Và Chạy Ứng Dụng Cục Bộ (Local)

### 2.1. Yêu cầu môi trường
- Bộ công cụ .NET SDK phiên bản 9.0 trở lên.
- Hệ quản trị cơ sở dữ liệu Microsoft SQL Server (cài đặt cục bộ, chạy qua Docker hoặc sử dụng dịch vụ đám mây).
- Công cụ dòng lệnh Entity Framework CLI: `dotnet tool install --global dotnet-ef`

### 2.2. Các bước khởi chạy chi tiết

1. Sao chép kho mã nguồn về máy tính cá nhân:
   ```bash
   git clone https://github.com/HieuNguyenddev/Buoi2-devop.git
   cd Buoi2-devop
   ```

2. Tạo tệp cấu hình môi trường từ mẫu:
   ```bash
   cp .env.example .env
   ```
   Mở tệp `.env` và điền chuỗi kết nối đến máy chủ SQL Server của bạn:
   ```env
   ASPNETCORE_ENVIRONMENT=Development
   CONNECTIONSTRINGS__DEFAULTCONNECTION=Server=localhost,1433;Database=QuanLySinhVienDB;User Id=sa;Password=MatKhauCuaBan;TrustServerCertificate=True;
   ```

3. Khởi chạy ứng dụng:
   ```bash
   dotnet run
   ```

4. Truy cập hệ thống trên trình duyệt:
   - Giao diện người dùng: `http://localhost:5292`
   - Tài liệu kiểm thử API (Swagger UI): `http://localhost:5292/swagger`

---

## 3. Quản Lý Cơ Sở Dữ Liệu Và EF Core Migrations

Hệ thống được phát triển theo mô hình Code-First. Khi ứng dụng khởi động thông qua `dotnet run`, hàm `MigrateAsync()` trong `Program.cs` sẽ tự động kiểm tra cơ sở dữ liệu, áp dụng các bản migration chưa chạy và tạo sẵn 5 bản ghi sinh viên mẫu nếu cơ sở dữ liệu còn trống.

Trong trường hợp bạn thay đổi thuộc tính trong lớp `Models/Student.cs`, hãy thực hiện các lệnh sau để cập nhật cấu trúc bảng:
```bash
# 1. Tạo bản ghi migration mới
dotnet ef migrations add <TenMigration>

# 2. Áp dụng thay đổi vào cơ sở dữ liệu
dotnet ef database update
```

---

## 4. Danh Sách Các Điểm Cuối REST API (API Endpoints)

Địa chỉ máy chủ mặc định tại môi trường cục bộ: `http://localhost:5292/api`

| Phương thức HTTP | Đường dẫn API | Mô tả chức năng | Tham số hỗ trợ |
|---|---|---|---|
| GET | /api/student | Lấy toàn bộ danh sách sinh viên | `keyword` (tìm theo tên, mã SV, email), `className` (lọc theo lớp) |
| GET | /api/student/{id} | Lấy thông tin chi tiết của sinh viên theo mã định danh | `id` (số nguyên) |
| POST | /api/student | Thêm mới một hồ sơ sinh viên vào hệ thống | Dữ liệu định dạng JSON trong phần thân yêu cầu (Body) |
| PUT | /api/student/{id} | Cập nhật thông tin hồ sơ sinh viên theo mã định danh | `id` trên đường dẫn và dữ liệu JSON trong phần thân yêu cầu |
| DELETE | /api/student/{id} | Xóa vĩnh viễn hồ sơ sinh viên khỏi hệ thống | `id` (số nguyên) |

---

---

## 5. Luồng Hoạt Động Của Hệ Thống (System Workflows)

### 5.1. Luồng xử lý yêu cầu dữ liệu (Request - Response Lifecycle)

```
[ Trình duyệt Người dùng ]
           │
           │  1. Gửi HTTP Request (Fetch API: GET/POST/PUT/DELETE)
           ▼
[ ASP.NET Core Middleware Pipeline ]
           │  - Kiểm tra Routing
           │  - Kiểm tra Chính sách CORS (Cho phép truy cập)
           │  - Ánh xạ Controller & Action
           ▼
[ StudentController ]
           │  2. Xác thực tính hợp lệ của Model (ModelState.IsValid)
           │  3. Kiểm tra logic nghiệp vụ (Kiểm tra trùng lặp Mã sinh viên)
           ▼
[ Entity Framework Core (AppDbContext) ]
           │  4. Tạo câu lệnh truy vấn T-SQL tương ứng
           ▼
[ Microsoft SQL Server ]
           │  5. Thực thi và phản hồi dữ liệu kết quả
           ▼
[ StudentController ]
           │  6. Đóng gói kết quả thành chuẩn JSON (HTTP 200, 201, 400, 404)
           ▼
[ Trình duyệt Người dùng (app.js) ]
              7. Cập nhật bảng dữ liệu, biểu đồ thống kê và hiển thị thông báo (Toast)
```

### 5.2. Luồng hoạt động lai thông minh của Frontend (Hybrid Client Flow)

Để đảm bảo ứng dụng luôn hoạt động ổn định và có thể kiểm thử mượt mà trong mọi môi trường:

```
Khi người dùng truy cập trang Web:
  │
  ├──> [1] Thử kết nối đến Backend C# API (Local hoặc Cloud)
  │      │
  │      ├──> Kết nối THÀNH CÔNG:
  │      │      Lấy dữ liệu trực tiếp từ SQL Server và hiển thị lên giao diện.
  │      │
  │      └──> Kết nối THẤT BẠI hoặc Hết thời gian chờ (Timeout > 3.5s):
  │             Hệ thống tự động kích hoạt bộ lưu trữ cục bộ (Local Database Storage).
  │             Nạp sẵn 5 sinh viên mẫu và lưu toàn bộ thao tác Thêm/Sửa/Xóa vào trình duyệt.
```

---

## 6. Quy Trình Phân Nhánh Và Tự Động Triển Khai (CI/CD Release Workflow)

Dự án áp dụng quy trình kiểm soát mã nguồn theo nhánh và tự động hóa toàn bộ quy trình phát hành sản phẩm thông qua GitHub Actions và Vercel.

### 6.1. Chiến lược phân nhánh (Branching Strategy)
- **Nhánh `main`**: Dành cho quá trình phát triển tính năng mới, kiểm thử và sửa lỗi.
- **Nhánh `release`**: Nhánh phát hành chính thức. Bất kỳ thay đổi nào được gộp (merge) vào nhánh này sẽ tự động kích hoạt tiến trình triển khai lên môi trường Vercel Production.

### 6.2. Sơ đồ luồng CI/CD tự động

```
[ Developer ]
     │  git push origin main / Pull Request
     ▼
[ GitHub Actions: Job 1 - build-dotnet ]
     │  1. Khởi tạo môi trường Ubuntu & .NET 9 SDK
     │  2. Restore NuGet Packages
     │  3. Biên dịch dự án (dotnet build --Release)
     │  4. Đóng gói bản phát hành (dotnet publish)
     ▼
[ Kiểm thử thành công ]
     │
     │  (Khi gộp mã nguồn vào nhánh release)
     ▼
[ GitHub Actions: Job 2 - deploy-vercel ]
     │  1. Tải và cài đặt Vercel CLI
     │  2. Nhúng biến cấu hình môi trường
     │  3. Triển khai trực tiếp thư mục wwwroot lên Production
     ▼
[ Vercel Production: https://buoi2-devop.vercel.app ]
```

### 6.3. Hướng dẫn phát hành phiên bản mới (Release) từ dòng lệnh
Sau khi hoàn tất việc kiểm thử mã nguồn trên nhánh `main`, thực hiện chuỗi lệnh sau để phát hành lên Production:

```bash
# Bước 1: Chuyển sang nhánh release và cập nhật phiên bản mới nhất từ remote
git checkout release
git pull origin release

# Bước 2: Gộp những thay đổi mới nhất từ nhánh main vào nhánh release
git merge main

# Bước 3: Đẩy mã nguồn lên GitHub để kích hoạt tiến trình tự động triển khai
git push origin release

# Bước 4: Chuyển trở lại nhánh main để tiếp tục phát triển
git checkout main
```

### 6.4. Cấu hình các khóa bí mật (GitHub Secrets)
Để quy trình tự động triển khai hoạt động ổn định, cần thiết lập các giá trị bí mật tại mục **GitHub Repository -> Settings -> Secrets and variables -> Actions**:

| Tên biến bí mật (Secret Name) | Mô tả chi tiết | Tính bắt buộc |
|---|---|---|
| `VERCEL_TOKEN` | Khóa xác thực tài khoản Vercel cá nhân (Tạo tại đường dẫn vercel.com/account/tokens) | Bắt buộc |
| `BACKEND_API_URL` | Địa chỉ URL công khai của máy chủ C# Web API (Ví dụ: `https://my-backend-api.onrender.com`) | Tùy chọn |

---

## 7. Chính Sách Bảo Mật Và Biến Môi Trường

- Tệp cấu hình chứa thông tin nhạy cảm `.env` đã được liệt kê trong danh sách bỏ qua của Git (`.gitignore`).
- Không thực hiện lưu trữ hoặc đẩy các thông tin kết nối cơ sở dữ liệu, tài khoản mật khẩu lên kho mã nguồn công khai.
- Khi triển khai trên các dịch vụ máy chủ đám mây, hãy thiết lập các chuỗi kết nối và thông số cấu hình trực tiếp trong phần Quản lý biến môi trường (Environment Variables) của nhà cung cấp.

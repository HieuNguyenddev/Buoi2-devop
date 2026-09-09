# 📘 Hệ Thống Quản Lý Sinh Viên

**Stack**: ASP.NET Core 10 · Entity Framework Core · SQL Server · Vanilla JS  
**Demo**: [buoi2-devop.vercel.app](https://buoi2-devop.vercel.app)

---

## 🏗️ Kiến Trúc Dự Án

```
buoi2/
├── Controllers/
│   └── StudentController.cs   # REST API: GET / POST / PUT / DELETE
├── Data/
│   └── AppDbContext.cs         # EF Core DbContext + Seed Data
├── Migrations/                 # EF Core Code-First migrations
├── Models/
│   └── Student.cs              # Model sinh viên
├── wwwroot/                    # Frontend tĩnh (Vercel host)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js               # CRUD logic, gọi API C#
├── Program.cs                  # Startup: DI, DB, CORS, Swagger
├── appsettings.json
├── .env                        # Biến môi trường (bị gitignore)
├── .env.example                # File mẫu
├── vercel.json                 # Vercel static config
└── .github/workflows/
    └── ci-cd.yml               # GitHub Actions CI/CD
```

---

## 🚀 Chạy Tại Local

### Yêu cầu
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server (local hoặc remote)
- `dotnet-ef` CLI: `dotnet tool install --global dotnet-ef`

### Bước thực hiện

```bash
# 1. Clone dự án
git clone https://github.com/HieuNguyenddev/Buoi2-devop.git
cd Buoi2-devop

# 2. Tạo file .env từ mẫu và điền chuỗi kết nối SQL Server
cp .env.example .env
# Chỉnh sửa .env: thêm CONNECTIONSTRINGS__DEFAULTCONNECTION=...

# 3. Chạy ứng dụng
dotnet run
```

**Truy cập:**
- 🌐 Web App: `http://localhost:5292`
- 📄 Swagger UI: `http://localhost:5292/swagger`

### Migrations & Database

Ứng dụng tự động gọi `MigrateAsync()` mỗi khi khởi chạy — không cần chạy lệnh thủ công.

Khi thay đổi Model (`Models/Student.cs`), tạo migration mới:

```bash
dotnet ef migrations add <TênMigration>
# Ví dụ:
dotnet ef migrations add AddPhoneNumber
```

Lần chạy tiếp theo, database sẽ được cập nhật tự động.

---

## ☁️ Triển Khai (Deployment)

### Kiến Trúc Deploy

```
┌─────────────────────────────────────────────┐
│  Vercel (Static Hosting)                    │
│  → Phục vụ wwwroot/ (HTML, CSS, JS)         │
│  → URL: https://buoi2-devop.vercel.app       │
└──────────────────┬──────────────────────────┘
                   │ fetch /api/student
                   ▼
┌─────────────────────────────────────────────┐
│  ASP.NET Core Backend (Server riêng)        │
│  → Chạy dotnet run hoặc deploy trên Render  │
│  → Kết nối SQL Server                       │
│  → CORS đã cho phép mọi origin              │
└─────────────────────────────────────────────┘
```

### Backend chạy Local, Frontend trên Vercel

Khi mở trang Vercel, nhấn nút **⚙️ Đổi URL Backend** và nhập:

```
http://localhost:5292
```

URL này được lưu vào `localStorage`, mọi thao tác CRUD sẽ gọi về API local của bạn.

---

## 🔄 GitHub Actions CI/CD Pipeline

File: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### Sơ Đồ Pipeline

```
Push to main
     │
     ▼
┌─────────────────────────────────┐
│  Job 1: build-dotnet            │
│  ┌──────────────────────────┐   │
│  │ 1. Checkout source       │   │
│  │ 2. Setup .NET 9 SDK      │   │
│  │ 3. dotnet restore        │   │
│  │ 4. dotnet build --Release│   │
│  │ 5. dotnet publish        │   │
│  │ 6. Upload artifact       │   │
│  └──────────────────────────┘   │
└────────────────┬────────────────┘
                 │ (success)
                 ▼
┌─────────────────────────────────┐
│  Job 2: deploy-vercel           │
│  ┌──────────────────────────┐   │
│  │ 1. Checkout source       │   │
│  │ 2. Inject BACKEND_API_URL│   │ ← sed thay __API_BASE_URL__
│  │    vào wwwroot/js/app.js  │   │   trong app.js trước khi deploy
│  │ 3. vercel wwwroot --prod │   │ ← Deploy trực tiếp thư mục wwwroot
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Cấu Hình GitHub Secrets

Vào **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Giá trị | Bắt buộc |
|---|---|---|
| `VERCEL_TOKEN` | Personal Access Token tại [vercel.com/account/tokens](https://vercel.com/account/tokens) | ✅ |
| `BACKEND_API_URL` | URL đầy đủ của C# API Backend (ví dụ: `https://my-api.onrender.com`) | ✅ |

### Lấy `VERCEL_TOKEN`

1. Đăng nhập [vercel.com](https://vercel.com) → **Account Settings → Tokens**
2. Nhấn **Create Token**, đặt tên `GitHub Actions`, chọn scope **Full Account**
3. Copy token và lưu vào GitHub Secrets với tên `VERCEL_TOKEN`

### Cấu hình Vercel Project lần đầu (nếu chưa có)

```bash
# Cài Vercel CLI
npm install -g vercel

# Login và liên kết project
vercel login
vercel link

# File .vercel/project.json sẽ được tạo, commit file này vào Git
```

### Luồng hoạt động sau khi cấu hình xong

1. Bạn sửa code, `git push origin main`
2. GitHub Actions tự động chạy:
   - **Build & Verify** toàn bộ C# backend
   - **Inject** URL backend vào `app.js`
   - **Deploy** frontend lên Vercel Production
3. Trang `https://buoi2-devop.vercel.app` được cập nhật trong ~30 giây

---

## 🔌 API Endpoints

Base URL (local): `http://localhost:5292/api`

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/student` | Lấy danh sách sinh viên (hỗ trợ `?keyword=&className=`) |
| `GET` | `/student/{id}` | Lấy sinh viên theo ID |
| `POST` | `/student` | Thêm sinh viên mới |
| `PUT` | `/student/{id}` | Cập nhật thông tin sinh viên |
| `DELETE` | `/student/{id}` | Xóa sinh viên |

Xem chi tiết tại Swagger: `http://localhost:5292/swagger`

---

## 🔐 Cấu Hình Biến Môi Trường

Sao chép `.env.example` thành `.env`:

```env
# Môi trường
ASPNETCORE_ENVIRONMENT=Development

# Chuỗi kết nối SQL Server
CONNECTIONSTRINGS__DEFAULTCONNECTION=Server=HOST,PORT;Database=DB;User Id=USER;Password=PASS;TrustServerCertificate=True;
```

> **Lưu ý:** File `.env` được gitignore và **KHÔNG được commit** lên GitHub để bảo vệ thông tin nhạy cảm.

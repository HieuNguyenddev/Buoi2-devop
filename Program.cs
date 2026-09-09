using Microsoft.EntityFrameworkCore;
using SimpleCrudApp.Data;

// Đọc file .env nếu có và nạp vào Environment Variables
if (File.Exists(".env"))
{
    foreach (var line in File.ReadAllLines(".env"))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;
        var parts = trimmed.Split('=', 2);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Cổng (Port) linh hoạt cho Vercel / Render / Railway / Docker Cloud
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình Database Context cho SQL Server (Đọc chuỗi kết nối từ .env hoặc appsettings.json)
string connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
    ?? Environment.GetEnvironmentVariable("CONNECTIONSTRINGS__DEFAULTCONNECTION")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? string.Empty;

if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(connectionString, sqlServerOptions => 
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 3, 
                maxRetryDelay: TimeSpan.FromSeconds(5), 
                errorNumbersToAdd: null
            ));
    });
}
else
{
    // Fallback dummy context để ứng dụng không bị văng lỗi khi build tĩnh
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer("Server=localhost;Database=DummyDb;Trusted_Connection=True;TrustServerCertificate=True;");
    });
}

// Cấu hình CORS cho phép truy cập frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Tự động Migrate và khởi tạo Database khi khởi chạy ứng dụng (Code First)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            var dbContext = services.GetRequiredService<AppDbContext>();
            logger.LogInformation("Đang kiểm tra và áp dụng EF Core Migrations vào SQL Server...");
            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Cơ sở dữ liệu SQL Server đã được Migrate thành công!");
        }
        else
        {
            logger.LogWarning("Chưa cấu hình DB_CONNECTION_STRING. Bỏ qua bước tự động Migrate.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Cảnh báo: Không thể thực hiện Migrate SQL Server lúc khởi chạy.");
    }
}

// Enable Swagger in Development & Production for easy API testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student CRUD API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

// Cho phép phục vụ Static files (HTML, CSS, JS trong wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();

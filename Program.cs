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


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình Database Context (Đọc chuỗi kết nối trực tiếp từ .env hoặc appsettings.json)
string dbProvider = Environment.GetEnvironmentVariable("USE_DATABASE") 
    ?? builder.Configuration.GetValue<string>("UseDatabase") 
    ?? "SqlServer";

string sqlServerConn = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

string sqliteConn = Environment.GetEnvironmentVariable("SQLITE_CONNECTION_STRING");



builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(sqlServerConn, sqlServerOptions => 
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 3, 
                maxRetryDelay: TimeSpan.FromSeconds(5), 
                errorNumbersToAdd: null
            ));
    }
    else
    {
        options.UseSqlite(sqliteConn);
    }
});

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

// Khởi tạo Database và Seed Data tự động khi khởi chạy
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("Checking database initialization...");
        await dbContext.Database.EnsureCreatedAsync();
        logger.LogInformation("Database ready!");
    }
    catch (Exception ex)
    {
        logger.LogWarning($"Không thể kết nối SQL Server ({ex.Message}). Đang tự động chuyển sang cơ sở dữ liệu SQLite dự phòng...");
        
        // Fallback sang SQLite nếu kết nối SQL Server không khả dụng trên môi trường thử nghiệm
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlite(sqliteConn);
        using var fallbackContext = new AppDbContext(optionsBuilder.Options);
        await fallbackContext.Database.EnsureCreatedAsync();
        logger.LogInformation("SQLite fallback database created successfully at 'quanlysinhvien.db'");
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

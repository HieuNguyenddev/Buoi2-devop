using Microsoft.EntityFrameworkCore;
using SimpleCrudApp.Models;

namespace SimpleCrudApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed initial data
            modelBuilder.Entity<Student>().HasData(
                new Student
                {
                    Id = 1,
                    StudentCode = "SV001",
                    FullName = "Nguyễn Văn An",
                    DateOfBirth = new DateTime(2003, 5, 15),
                    ClassName = "CNTT-K15A",
                    Gpa = 8.5,
                    Email = "an.nguyen@example.com"
                },
                new Student
                {
                    Id = 2,
                    StudentCode = "SV002",
                    FullName = "Trần Thị Bình",
                    DateOfBirth = new DateTime(2003, 8, 20),
                    ClassName = "CNTT-K15B",
                    Gpa = 9.0,
                    Email = "binh.tran@example.com"
                },
                new Student
                {
                    Id = 3,
                    StudentCode = "SV003",
                    FullName = "Lê Hoàng Cường",
                    DateOfBirth = new DateTime(2002, 12, 10),
                    ClassName = "HTTT-K14",
                    Gpa = 7.2,
                    Email = "cuong.le@example.com"
                },
                new Student
                {
                    Id = 4,
                    StudentCode = "SV004",
                    FullName = "Phạm Thu Dung",
                    DateOfBirth = new DateTime(2004, 3, 25),
                    ClassName = "CNTT-K16A",
                    Gpa = 6.8,
                    Email = "dung.pham@example.com"
                },
                new Student
                {
                    Id = 5,
                    StudentCode = "SV005",
                    FullName = "Vũ Minh Đức",
                    DateOfBirth = new DateTime(2003, 1, 5),
                    ClassName = "KTPM-K15",
                    Gpa = 8.8,
                    Email = "duc.vu@example.com"
                }
            );
        }
    }
}

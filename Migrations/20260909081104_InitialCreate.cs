using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SimpleCrudApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClassName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Gpa = table.Column<double>(type: "float", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Students",
                columns: new[] { "Id", "ClassName", "DateOfBirth", "Email", "FullName", "Gpa", "StudentCode" },
                values: new object[,]
                {
                    { 1, "CNTT-K15A", new DateTime(2003, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "an.nguyen@example.com", "Nguyễn Văn An", 8.5, "SV001" },
                    { 2, "CNTT-K15B", new DateTime(2003, 8, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "binh.tran@example.com", "Trần Thị Bình", 9.0, "SV002" },
                    { 3, "HTTT-K14", new DateTime(2002, 12, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "cuong.le@example.com", "Lê Hoàng Cường", 7.2000000000000002, "SV003" },
                    { 4, "CNTT-K16A", new DateTime(2004, 3, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "dung.pham@example.com", "Phạm Thu Dung", 6.7999999999999998, "SV004" },
                    { 5, "KTPM-K15", new DateTime(2003, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "duc.vu@example.com", "Vũ Minh Đức", 8.8000000000000007, "SV005" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}

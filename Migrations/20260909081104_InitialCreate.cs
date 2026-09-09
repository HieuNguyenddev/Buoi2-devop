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
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Students]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [Students] (
                        [Id] int NOT NULL IDENTITY,
                        [StudentCode] nvarchar(20) NOT NULL,
                        [FullName] nvarchar(100) NOT NULL,
                        [DateOfBirth] datetime2 NOT NULL,
                        [ClassName] nvarchar(50) NOT NULL,
                        [Gpa] float NOT NULL,
                        [Email] nvarchar(max) NOT NULL,
                        CONSTRAINT [PK_Students] PRIMARY KEY ([Id])
                    );

                    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClassName', N'DateOfBirth', N'Email', N'FullName', N'Gpa', N'StudentCode') AND [object_id] = OBJECT_ID(N'[Students]'))
                        SET IDENTITY_INSERT [Students] ON;
                    
                    INSERT INTO [Students] ([Id], [ClassName], [DateOfBirth], [Email], [FullName], [Gpa], [StudentCode])
                    VALUES 
                        (1, N'CNTT-K15A', '2003-05-15T00:00:00.0000000', N'an.nguyen@example.com', N'Nguyễn Văn An', 8.5, N'SV001'),
                        (2, N'CNTT-K15B', '2003-08-20T00:00:00.0000000', N'binh.tran@example.com', N'Trần Thị Bình', 9.0, N'SV002'),
                        (3, N'HTTT-K14', '2002-12-10T00:00:00.0000000', N'cuong.le@example.com', N'Lê Hoàng Cường', 7.2, N'SV003'),
                        (4, N'CNTT-K16A', '2004-03-25T00:00:00.0000000', N'dung.pham@example.com', N'Phạm Thu Dung', 6.8, N'SV004'),
                        (5, N'KTPM-K15', '2003-01-05T00:00:00.0000000', N'duc.vu@example.com', N'Vũ Minh Đức', 8.8, N'SV005');

                    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClassName', N'DateOfBirth', N'Email', N'FullName', N'Gpa', N'StudentCode') AND [object_id] = OBJECT_ID(N'[Students]'))
                        SET IDENTITY_INSERT [Students] OFF;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}

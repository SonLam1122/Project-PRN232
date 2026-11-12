-- ==============================================================================
-- KICH BAN TAO CO SO DU LIEU VA CHEN DU LIEU KHOI TAO CHO DU AN PRN232
-- Co so du lieu: PRN232_LibraryDb
-- He quan tri CSDL: Microsoft SQL Server / SQL Server Express / LocalDB
-- ==============================================================================

-- 1. Tao moi Co so du lieu neu chua ton tai
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PRN232_LibraryDb')
BEGIN
    CREATE DATABASE [PRN232_LibraryDb];
END
GO

USE [PRN232_LibraryDb];
GO

-- 2. Xoa cac bang cu theo dung thu tu khoa ngoai neu da ton tai
IF OBJECT_ID(N'dbo.BorrowRecords', N'U') IS NOT NULL DROP TABLE dbo.BorrowRecords;
IF OBJECT_ID(N'dbo.Books', N'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID(N'dbo.Authors', N'U') IS NOT NULL DROP TABLE dbo.Authors;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- 3. Tao bang Nguoi dung (Users)
CREATE TABLE dbo.Users
(
    Id INT IDENTITY(1,1) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT N'User',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id)
);
GO

-- Tao chi muc duy nhat cho Username va Email
CREATE UNIQUE NONCLUSTERED INDEX IX_Users_Username ON dbo.Users (Username);
CREATE UNIQUE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users (Email);
GO

-- 4. Tao bang Tac gia (Authors)
CREATE TABLE dbo.Authors
(
    Id INT IDENTITY(1,1) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Biography NVARCHAR(500) NULL,
    DateOfBirth DATETIME2 NULL,
    CONSTRAINT PK_Authors PRIMARY KEY CLUSTERED (Id)
);
GO

-- 5. Tao bang The loai sach (Categories)
CREATE TABLE dbo.Categories
(
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(250) NULL,
    CONSTRAINT PK_Categories PRIMARY KEY CLUSTERED (Id)
);
GO

-- Tao chi muc duy nhat cho Ten the loai
CREATE UNIQUE NONCLUSTERED INDEX IX_Categories_Name ON dbo.Categories (Name);
GO

-- 6. Tao bang Sach (Books)
CREATE TABLE dbo.Books
(
    Id INT IDENTITY(1,1) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    ISBN NVARCHAR(20) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Price DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    PublishedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    AuthorId INT NOT NULL,
    CategoryId INT NOT NULL,
    CONSTRAINT PK_Books PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Books_Authors_AuthorId FOREIGN KEY (AuthorId) REFERENCES dbo.Authors (Id),
    CONSTRAINT FK_Books_Categories_CategoryId FOREIGN KEY (CategoryId) REFERENCES dbo.Categories (Id)
);
GO

-- Tao chi muc cho ISBN va cac khoa ngoai
CREATE UNIQUE NONCLUSTERED INDEX IX_Books_ISBN ON dbo.Books (ISBN);
CREATE NONCLUSTERED INDEX IX_Books_AuthorId ON dbo.Books (AuthorId);
CREATE NONCLUSTERED INDEX IX_Books_CategoryId ON dbo.Books (CategoryId);
GO

-- 7. Tao bang Phieu muon tra sach (BorrowRecords)
CREATE TABLE dbo.BorrowRecords
(
    Id INT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    BookId INT NOT NULL,
    BorrowDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATETIME2 NOT NULL,
    ReturnDate DATETIME2 NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT N'Borrowing',
    FineAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Notes NVARCHAR(500) NULL,
    CONSTRAINT PK_BorrowRecords PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_BorrowRecords_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE,
    CONSTRAINT FK_BorrowRecords_Books_BookId FOREIGN KEY (BookId) REFERENCES dbo.Books (Id)
);
GO

-- Tao chi muc khoa ngoai cho BorrowRecords
CREATE NONCLUSTERED INDEX IX_BorrowRecords_UserId ON dbo.BorrowRecords (UserId);
CREATE NONCLUSTERED INDEX IX_BorrowRecords_BookId ON dbo.BorrowRecords (BookId);
GO

-- ==============================================================================
-- 8. CHEN DU LIEU KHOI TAO THUC TE (REALISTIC SEED DATA)
-- ==============================================================================

-- A. Chen danh sach The loai sach
SET IDENTITY_INSERT dbo.Categories ON;
INSERT INTO dbo.Categories (Id, Name, Description)
VALUES
(1, N'Van hoc Viet Nam', N'Cac tac pham van hoc kinh dien va hien dai Viet Nam'),
(2, N'Van hoc Nuoc ngoai', N'Tieu thuyet, truyen gia tuong va phap thuat quoc te'),
(3, N'Cong nghe Thong tin', N'Giao trinh lap trinh, thiet ke he thong va kien truc phan mem'),
(4, N'Kinh te & Quan tri', N'Sach quan ly doanh nghiep, dau tu tai chinh va marketing'),
(5, N'Khoa hoc & Lich su', N'Nghien cuu khoa hoc tu nhien, lich su van minh nhan loai'),
(6, N'Ky nang & Tam ly', N'Phat trien ban than, ky nang giao tiep va tam ly hoc ung dung'),
(7, N'Triet hoc & Xa hoi', N'Tac pham kinh dien ve tu tuong, triet hoc va xa hoi hoc'),
(8, N'Ngoai ngu & Tu dien', N'Sach hoc ngon ngu, tu dien chuyen nganh va ngu phap');
SET IDENTITY_INSERT dbo.Categories OFF;
GO

-- B. Chen danh sach Tac gia
SET IDENTITY_INSERT dbo.Authors ON;
INSERT INTO dbo.Authors (Id, FullName, Biography, DateOfBirth)
VALUES
(1, N'Nguyen Nhat Anh', N'Nha van noi tieng Viet Nam voi nhieu tac pham tuoi hoc tro tuoi tho.', '1955-05-07'),
(2, N'J.K. Rowling', N'Nu van si nguoi Anh, tac gia bo tieu thuyet lung danh Harry Potter.', '1965-07-31'),
(3, N'George Orwell', N'Nha van va nha bao nguoi Anh, tac gia cua Trai Suc Vat va 1984.', '1903-06-25'),
(4, N'Nam Cao', N'Nha van hien thuc xuat sac cua nen van hoc hien dai Viet Nam.', '1915-10-29'),
(5, N'Robert C. Martin', N'Chuyen gia phan mem quoc te, dong tac gia Tuyen ngon Agile, Clean Code.', '1952-12-05'),
(6, N'Dale Carnegie', N'Nha van va nha thuyet trinh My, tac gia cuon sach Dac Nhan Tam.', '1888-11-24'),
(7, N'Yuval Noah Harari', N'Nha su hoc va triet gia Israel, tac gia bo sach Sapiens va Homo Deus.', '1976-02-24'),
(8, N'To Hoai', N'Cay dai thu van hoc Viet Nam, tac gia De Men Phieu Luu Ky.', '1920-09-27');
SET IDENTITY_INSERT dbo.Authors OFF;
GO

-- C. Chen danh sach Dau sach thuc te
SET IDENTITY_INSERT dbo.Books ON;
INSERT INTO dbo.Books (Id, Title, ISBN, Description, Price, Quantity, PublishedDate, AuthorId, CategoryId)
VALUES
(1, N'Toi Thay Hoa Vang Tren Co Xanh', N'978-604-2-00001-1', N'Cau chuyen tinh cam tuoi tho am ap tai lang que Viet Nam.', 125000.00, 50, '2010-12-01', 1, 1),
(2, N'Mat Biec', N'978-604-2-00002-8', N'Cau chuyen tinh yeu sau lang va nuoi tiec giua Ngan va Ha Lan.', 110000.00, 35, '1990-08-01', 1, 1),
(3, N'Cho Toi Xin Mot Ve Di Tuoi Tho', N'978-604-2-00004-2', N'Chuyen ve the gioi tre tho hon nhien va nhung bai hoc sau sac.', 98000.00, 45, '2008-01-01', 1, 1),
(4, N'De Men Phieu Luu Ky', N'978-604-2-00005-9', N'Hanh trinh truong thanh va ket giao ban be cua chu De Men.', 75000.00, 60, '1941-10-01', 8, 1),
(5, N'Chi Pheo', N'978-604-2-00003-5', N'Kiet tac van hoc hien thuc phan anh so phan nguoi nong dan Viet Nam.', 85000.00, 55, '1941-01-01', 4, 1),
(6, N'Harry Potter va Hon Da Phu Thuy', N'978-0-7475-3269-9', N'Tap dau tien mo ra the gioi phap thuat ky bi tai truong Hogwarts.', 250000.00, 40, '1997-06-26', 2, 2),
(7, N'Harry Potter va Phong Chua Bi Mat', N'978-0-7475-3849-3', N'Tap hai ve cuoc chien chong lai nhung the luc den toi tai Hogwarts.', 260000.00, 30, '1998-07-02', 2, 2),
(8, N'Trai Suc Vat - Animal Farm', N'978-0-452-28424-1', N'Tieu thuyet cham biem kinh dien mang tinh triet hoc va xa hoi hoc.', 145000.00, 25, '1945-08-17', 3, 7),
(9, N'1984', N'978-0-451-52493-5', N'Tac pham phan dia dang kinh dien ve su kiem soat tu do con nguoi.', 175000.00, 30, '1949-06-08', 3, 7),
(10, N'Clean Code - Nghe Thuat Viet Ma Sach', N'978-0-132-35088-4', N'Cam nang chuan muc ve ky thuat lap trinh chuyen nghiep va toi uu code.', 320000.00, 20, '2008-08-01', 5, 3),
(11, N'Clean Architecture - Kien Truc Phan Mem', N'978-0-134-49416-6', N'Nguyen tac kien truc he thong phan mem huong doi tuong ben vung.', 350000.00, 18, '2017-09-20', 5, 3),
(12, N'Dac Nhan Tam', N'978-604-5-82470-2', N'Nghe thuat thu phuc long nguoi va thuat ung xu thiet thuc hang ngay.', 120000.00, 70, '1936-10-01', 6, 6),
(13, N'Quang Ganh Lo Di Va Vui Song', N'978-604-5-82471-9', N'Giai phap tam ly vuot qua lo au de song binh an va hieu qua.', 115000.00, 40, '1948-01-01', 6, 6),
(14, N'Sapiens - Luoc Su Loai Nguoi', N'978-0-062-31609-7', N'Goc nhin sau sac ve lich su tien hoa va van minh loai nguoi.', 290000.00, 35, '2014-09-04', 7, 5),
(15, N'Homo Deus - Luoc Su Tuong Lai', N'978-0-062-46431-6', N'Du doan ve tuong lai cong nghe, tri tue nhan tao va con nguoi.', 310000.00, 28, '2016-09-08', 7, 5);
SET IDENTITY_INSERT dbo.Books OFF;
GO

-- D. Chen danh sach Nguoi dung (Mat khau bam PBKDF2 kem Salt)
-- admin: Admin@123456
-- user1: User@123456
-- sinhvien1: User@123456
-- giangvien1: User@123456
SET IDENTITY_INSERT dbo.Users ON;
INSERT INTO dbo.Users (Id, Username, Email, PasswordHash, FullName, Role, CreatedAt)
VALUES
(1, N'admin', N'admin@library.com', N'10000.WsZftRIgmXePQKq6gkeLrw==.o3B/WfZgbC1Ti2cyITKJ1qzEQsriPv4gjEVZBohSSX8=', N'Quan Tri Vien', N'Admin', GETUTCDATE()),
(2, N'user1', N'user1@library.com', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Nguoi Dung Mau', N'User', GETUTCDATE()),
(3, N'sinhvien1', N'sinhvien1@fpt.edu.vn', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Nguyen Van An', N'User', GETUTCDATE()),
(4, N'giangvien1', N'giangvien1@fpt.edu.vn', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Tran Thi Binh', N'User', GETUTCDATE());
SET IDENTITY_INSERT dbo.Users OFF;
GO

-- E. Chen danh sach Phieu muon sach mau voi nhieu trang thai
SET IDENTITY_INSERT dbo.BorrowRecords ON;
INSERT INTO dbo.BorrowRecords (Id, UserId, BookId, BorrowDate, DueDate, ReturnDate, Status, FineAmount, Notes)
VALUES
(1, 2, 1, DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 9, GETUTCDATE()), NULL, N'Borrowing', 0.00, N'Muon sach doc cuoi tuan'),
(2, 2, 2, DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -6, GETUTCDATE()), DATEADD(day, -4, GETUTCDATE()), N'Returned', 10000.00, N'Tra tre 2 ngay, da nop phat 10,000 d'),
(3, 3, 10, DATEADD(day, -3, GETUTCDATE()), DATEADD(day, 11, GETUTCDATE()), NULL, N'Borrowing', 0.00, N'Muon phuc vu do an PRN232'),
(4, 3, 6, DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), N'Returned', 0.00, N'Tra dung han, sach nguyen ven'),
(5, 4, 11, DATEADD(day, -7, GETUTCDATE()), DATEADD(day, 7, GETUTCDATE()), NULL, N'Borrowing', 0.00, N'Nghien cuu giao trinh giang day'),
(6, 4, 14, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -16, GETUTCDATE()), DATEADD(day, -16, GETUTCDATE()), N'Returned', 0.00, N'Tra sach dung han');
SET IDENTITY_INSERT dbo.BorrowRecords OFF;
GO

-- 9. Kiem tra va thong ke so luong ban ghi sau khi khoi tao
SELECT 'Categories' AS TableName, COUNT(*) AS TotalRows FROM dbo.Categories
UNION ALL
SELECT 'Authors', COUNT(*) FROM dbo.Authors
UNION ALL
SELECT 'Books', COUNT(*) FROM dbo.Books
UNION ALL
SELECT 'Users', COUNT(*) FROM dbo.Users
UNION ALL
SELECT 'BorrowRecords', COUNT(*) FROM dbo.BorrowRecords;
GO

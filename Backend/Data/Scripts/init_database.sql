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
IF OBJECT_ID(N'dbo.Favorites', N'U') IS NOT NULL DROP TABLE dbo.Favorites;
IF OBJECT_ID(N'dbo.BookReviews', N'U') IS NOT NULL DROP TABLE dbo.BookReviews;
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
    ImageUrl NVARCHAR(500) NULL,
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
    RenewalCount INT NOT NULL DEFAULT 0,
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

-- 8. Tao bang Danh gia va Nhan xet sach (BookReviews)
CREATE TABLE dbo.BookReviews
(
    Id INT IDENTITY(1,1) NOT NULL,
    BookId INT NOT NULL,
    UserId INT NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(1000) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_BookReviews PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_BookReviews_Books_BookId FOREIGN KEY (BookId) REFERENCES dbo.Books (Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookReviews_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE,
    CONSTRAINT CK_BookReviews_Rating CHECK (Rating >= 1 AND Rating <= 5)
);
GO

CREATE NONCLUSTERED INDEX IX_BookReviews_BookId ON dbo.BookReviews (BookId);
CREATE NONCLUSTERED INDEX IX_BookReviews_UserId ON dbo.BookReviews (UserId);
GO

-- 8. Tao bang Sach Yeu Thich cua Doc Gia (Favorites)
CREATE TABLE dbo.Favorites
(
    Id INT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    BookId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_Favorites PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Favorites_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE,
    CONSTRAINT FK_Favorites_Books_BookId FOREIGN KEY (BookId) REFERENCES dbo.Books (Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Favorites_User_Book UNIQUE (UserId, BookId)
);
GO

CREATE NONCLUSTERED INDEX IX_Favorites_UserId ON dbo.Favorites (UserId);
CREATE NONCLUSTERED INDEX IX_Favorites_BookId ON dbo.Favorites (BookId);
GO

-- ==============================================================================
-- 9. CHEN DU LIEU KHOI TAO THUC TE (REALISTIC SEED DATA)
-- ==============================================================================

-- A. Chen danh sach The loai sach
SET IDENTITY_INSERT dbo.Categories ON;
INSERT INTO dbo.Categories (Id, Name, Description)
VALUES
(1, N'Văn học Việt Nam', N'Các tác phẩm văn học kinh điển và hiện đại Việt Nam'),
(2, N'Văn học Nước ngoài', N'Tiểu thuyết, truyện giả tưởng và pháp thuật quốc tế'),
(3, N'Công nghệ Thông tin', N'Giáo trình lập trình, thiết kế hệ thống và kiến trúc phần mềm'),
(4, N'Kinh tế & Quản trị', N'Sách quản lý doanh nghiệp, đầu tư tài chính và marketing'),
(5, N'Khoa học & Lịch sử', N'Nghiên cứu khoa học tự nhiên, lịch sử văn minh nhân loại'),
(6, N'Kỹ năng & Tâm lý', N'Phát triển bản thân, kỹ năng giao tiếp và tâm lý học ứng dụng'),
(7, N'Triết học & Xã hội', N'Tác phẩm kinh điển về tư tưởng, triết học và xã hội học'),
(8, N'Ngoại ngữ & Từ điển', N'Sách học ngôn ngữ, từ điển chuyên ngành và ngữ pháp');
SET IDENTITY_INSERT dbo.Categories OFF;
GO

-- B. Chen danh sach Tac gia
SET IDENTITY_INSERT dbo.Authors ON;
INSERT INTO dbo.Authors (Id, FullName, Biography, DateOfBirth)
VALUES
(1, N'Nguyễn Nhật Ánh', N'Nhà văn nổi tiếng Việt Nam với nhiều tác phẩm tuổi học trò tuổi thơ.', '1955-05-07'),
(2, N'J.K. Rowling', N'Nữ văn sĩ người Anh, tác giả bộ tiểu thuyết lừng danh Harry Potter.', '1965-07-31'),
(3, N'George Orwell', N'Nhà văn và nhà báo người Anh, tác giả của Trại Súc Vật và 1984.', '1903-06-25'),
(4, N'Nam Cao', N'Nhà văn hiện thực xuất sắc của nền văn học hiện đại Việt Nam.', '1915-10-29'),
(5, N'Robert C. Martin', N'Chuyên gia phần mềm quốc tế, đồng tác giả Tuyên ngôn Agile, Clean Code.', '1952-12-05'),
(6, N'Dale Carnegie', N'Nhà văn và nhà thuyết trình Mỹ, tác giả cuốn sách Đắc Nhân Tâm.', '1888-11-24'),
(7, N'Yuval Noah Harari', N'Nhà sử học và triết gia Israel, tác giả bộ sách Sapiens và Homo Deus.', '1976-02-24'),
(8, N'Tô Hoài', N'Cây đại thụ văn học Việt Nam, tác giả Dế Mèn Phiêu Lưu Ký.', '1920-09-27');
SET IDENTITY_INSERT dbo.Authors OFF;
GO

-- C. Chen danh sach Dau sach thuc te
SET IDENTITY_INSERT dbo.Books ON;
INSERT INTO dbo.Books (Id, Title, ISBN, Description, ImageUrl, Price, Quantity, PublishedDate, AuthorId, CategoryId)
VALUES
(1, N'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', N'978-604-2-00001-1', N'Câu chuyện tình cảm tuổi thơ ấm áp tại làng quê Việt Nam.', N'images/books/book-1.svg', 125000.00, 50, '2010-12-01', 1, 1),
(2, N'Mắt Biếc', N'978-604-2-00002-8', N'Câu chuyện tình yêu sâu lắng và nuối tiếc giữa Ngạn và Hà Lan.', N'images/books/book-2.svg', 110000.00, 35, '1990-08-01', 1, 1),
(3, N'Cho Tôi Xin Một Vé Đi Tuổi Thơ', N'978-604-2-00004-2', N'Chuyện về thế giới trẻ thơ hồn nhiên và những bài học sâu sắc.', N'images/books/book-3.svg', 98000.00, 45, '2008-01-01', 1, 1),
(4, N'Dế Mèn Phiêu Lưu Ký', N'978-604-2-00005-9', N'Hành trình trưởng thành và kết giao bạn bè của chú Dế Mèn.', N'images/books/book-4.svg', 75000.00, 60, '1941-10-01', 8, 1),
(5, N'Chí Phèo', N'978-604-2-00003-5', N'Kiệt tác văn học hiện thực phản ánh số phận người nông dân Việt Nam.', N'images/books/book-5.svg', 85000.00, 55, '1941-01-01', 4, 1),
(6, N'Harry Potter và Hòn Đá Phù Thủy', N'978-0-7475-3269-9', N'Tập đầu tiên mở ra thế giới pháp thuật kỳ bí tại trường Hogwarts.', N'images/books/book-6.svg', 250000.00, 40, '1997-06-26', 2, 2),
(7, N'Harry Potter và Phòng Chứa Bí Mật', N'978-0-7475-3849-3', N'Tập hai về cuộc chiến chống lại những thế lực đen tối tại Hogwarts.', N'images/books/book-7.svg', 260000.00, 30, '1998-07-02', 2, 2),
(8, N'Trại Súc Vật - Animal Farm', N'978-0-452-28424-1', N'Tiểu thuyết châm biếm kinh điển mang tính triết học và xã hội học.', N'images/books/book-8.svg', 145000.00, 25, '1945-08-17', 3, 7),
(9, N'1984', N'978-0-451-52493-5', N'Tác phẩm phản địa đàng kinh điển về sự kiểm soát tự do con người.', N'images/books/book-9.svg', 175000.00, 30, '1949-06-08', 3, 7),
(10, N'Clean Code - Nghệ Thuật Viết Mã Sạch', N'978-0-132-35088-4', N'Cẩm nang chuẩn mực về kỹ thuật lập trình chuyên nghiệp và tối ưu mã nguồn.', N'images/books/book-10.svg', 320000.00, 20, '2008-08-01', 5, 3),
(11, N'Clean Architecture - Kiến Trúc Phần Mềm', N'978-0-134-49416-6', N'Nguyên tắc kiến trúc hệ thống phần mềm hướng đối tượng bền vững.', N'images/books/book-11.svg', 350000.00, 18, '2017-09-20', 5, 3),
(12, N'Đắc Nhân Tâm', N'978-604-5-82470-2', N'Nghệ thuật thu phục lòng người và thuật ứng xử thiết thực hàng ngày.', N'images/books/book-12.svg', 120000.00, 70, '1936-10-01', 6, 6),
(13, N'Quẳng Gánh Lo Đi Và Vui Sống', N'978-604-5-82471-9', N'Giải pháp tâm lý vượt qua lo âu để sống bình an và hiệu quả.', N'images/books/book-13.svg', 115000.00, 40, '1948-01-01', 6, 6),
(14, N'Sapiens - Lược Sử Loài Người', N'978-0-062-31609-7', N'Góc nhìn sâu sắc về lịch sử tiến hóa và văn minh loài người.', N'images/books/book-14.svg', 290000.00, 35, '2014-09-04', 7, 5),
(15, N'Homo Deus - Lược Sử Tương Lai', N'978-0-062-46431-6', N'Dự đoán về tương lai công nghệ, trí tuệ nhân tạo và con người.', N'images/books/book-15.svg', 310000.00, 28, '2016-09-08', 7, 5);
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
-- Admin@123456
(1, N'admin', N'admin@library.com', N'10000.WsZftRIgmXePQKq6gkeLrw==.o3B/WfZgbC1Ti2cyITKJ1qzEQsriPv4gjEVZBohSSX8=', N'Quản Trị Viên', N'Admin', GETUTCDATE()),
-- User@123456
(2, N'user1', N'user1@library.com', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Người Dùng Mẫu', N'User', GETUTCDATE()),
(3, N'sinhvien1', N'sinhvien1@fpt.edu.vn', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Nguyễn Văn An', N'User', GETUTCDATE()),
(4, N'giangvien1', N'giangvien1@fpt.edu.vn', N'10000.k2MLdjgO1Rspwm44hirrIw==.hB7TzmT26pDHiUPlqx//3YfqF/O4lrR41WEsKoe+++Y=', N'Trần Thị Bình', N'User', GETUTCDATE());
SET IDENTITY_INSERT dbo.Users OFF;
GO

-- E. Chen danh sach Phieu muon sach mau voi nhieu trang thai
SET IDENTITY_INSERT dbo.BorrowRecords ON;
INSERT INTO dbo.BorrowRecords (Id, UserId, BookId, BorrowDate, DueDate, ReturnDate, Status, FineAmount, RenewalCount, Notes)
VALUES
(1, 2, 1, DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 9, GETUTCDATE()), NULL, N'Borrowing', 0.00, 0, N'Mượn sách đọc cuối tuần'),
(2, 2, 2, DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -6, GETUTCDATE()), DATEADD(day, -4, GETUTCDATE()), N'Returned', 10000.00, 1, N'Trả trễ 2 ngày, đã nộp phạt 10.000 đ'),
(3, 3, 10, DATEADD(day, -3, GETUTCDATE()), DATEADD(day, 11, GETUTCDATE()), NULL, N'Borrowing', 0.00, 0, N'Mượn phục vụ đồ án PRN232'),
(4, 3, 6, DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), N'Returned', 0.00, 0, N'Trả đúng hạn, sách nguyên vẹn'),
(5, 4, 11, DATEADD(day, -7, GETUTCDATE()), DATEADD(day, 7, GETUTCDATE()), NULL, N'Borrowing', 0.00, 0, N'Nghiên cứu giáo trình giảng dạy'),
(6, 4, 14, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -16, GETUTCDATE()), DATEADD(day, -16, GETUTCDATE()), N'Returned', 0.00, 0, N'Trả sách đúng hạn');
SET IDENTITY_INSERT dbo.BorrowRecords OFF;
GO

-- F. Chen danh sach Danh gia va Nhan xet sach mau
SET IDENTITY_INSERT dbo.BookReviews ON;
INSERT INTO dbo.BookReviews (Id, BookId, UserId, Rating, Comment, CreatedAt)
VALUES
(1, 1, 2, 5, N'Tác phẩm chạm đến từng ngóc ngách ký ức tuổi thơ, cốt truyện nhẹ nhàng mà sâu lắng.', DATEADD(day, -4, GETUTCDATE())),
(2, 1, 3, 5, N'Văn phong của Nguyễn Nhật Ánh vô cùng trong sáng và chân thật, rất đáng đọc.', DATEADD(day, -2, GETUTCDATE())),
(3, 2, 2, 4, N'Một câu chuyện tình đẹp nhưng đượm buồn, để lại nhiều tiếc nuối cho người đọc.', DATEADD(day, -3, GETUTCDATE())),
(4, 4, 3, 5, N'Tác phẩm kinh điển gắn liền với bao thế hệ, bài học tình bạn và lòng nhân ái sâu sắc.', DATEADD(day, -5, GETUTCDATE())),
(5, 10, 3, 5, N'Cuốn sách gối đầu giường cho mọi lập trình viên muốn nâng cao tư duy viết mã sạch.', DATEADD(day, -1, GETUTCDATE())),
(6, 10, 4, 5, N'Tài liệu tham khảo xuất sắc trong giảng dạy công nghệ phần mềm và kiến trúc mã nguồn.', DATEADD(day, -6, GETUTCDATE())),
(7, 12, 4, 5, N'Nghệ thuật giao tiếp và ứng xử kinh điển, áp dụng thực tế rất hiệu quả trong cuộc sống.', DATEADD(day, -7, GETUTCDATE()));
SET IDENTITY_INSERT dbo.BookReviews OFF;
GO

-- 10. Kiem tra va thong ke so luong ban ghi sau khi khoi tao
SELECT 'Categories' AS TableName, COUNT(*) AS TotalRows FROM dbo.Categories
UNION ALL
SELECT 'Authors', COUNT(*) FROM dbo.Authors
UNION ALL
SELECT 'Books', COUNT(*) FROM dbo.Books
UNION ALL
SELECT 'Users', COUNT(*) FROM dbo.Users
UNION ALL
SELECT 'BorrowRecords', COUNT(*) FROM dbo.BorrowRecords
UNION ALL
SELECT 'BookReviews', COUNT(*) FROM dbo.BookReviews;
GO

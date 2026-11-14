# Tai lieu Co so Du lieu va Du lieu Khoi tao (PRN232_LibraryDb)

## 1. Tong quan He quan tri CSDL
- **Ten Co so du lieu**: `PRN232_LibraryDb`
- **He quan tri**: Microsoft SQL Server / SQL Server Express / LocalDB (`(localdb)\mssqllocaldb`)
- **Dinh dang ky tu Unicode**: Toan bo truong van ban luu tru duoi dang `NVARCHAR` kem tien to `N''`, dam bao ho tro 100% tieng Viet co dau chuan.
- **Kich ban khoi tao**: `Backend/Data/Scripts/init_database.sql`

---

## 2. Cau truc Cac Bang Chinh

### A. Bang `dbo.Categories` (The loai sach)
- `Id` (INT, IDENTITY, PK)
- `Name` (NVARCHAR(50), NOT NULL, UNIQUE INDEX)
- `Description` (NVARCHAR(250), NULL)

### B. Bang `dbo.Authors` (Tac gia)
- `Id` (INT, IDENTITY, PK)
- `FullName` (NVARCHAR(100), NOT NULL)
- `Biography` (NVARCHAR(500), NULL)
- `DateOfBirth` (DATETIME2, NULL)

### C. Bang `dbo.Books` (Dau sach)
- `Id` (INT, IDENTITY, PK)
- `Title` (NVARCHAR(200), NOT NULL)
- `ISBN` (NVARCHAR(20), NOT NULL, UNIQUE INDEX)
- `Description` (NVARCHAR(1000), NULL)
- `ImageUrl` (NVARCHAR(500), NULL): Duong dan anh bia sach
- `Price` (DECIMAL(18,2), NOT NULL)
- `Quantity` (INT, NOT NULL, DEFAULT 0)
- `PublishedDate` (DATETIME2, NOT NULL)
- `AuthorId` (INT, NOT NULL, FK -> Authors.Id)
- `CategoryId` (INT, NOT NULL, FK -> Categories.Id)

### D. Bang `dbo.Users` (Nguoi dung & Tai khoan)
- `Id` (INT, IDENTITY, PK)
- `Username` (NVARCHAR(50), NOT NULL, UNIQUE INDEX)
- `Email` (NVARCHAR(100), NOT NULL, UNIQUE INDEX)
- `PasswordHash` (NVARCHAR(MAX), NOT NULL): Chuoi bam PBKDF2 kem Salt
- `FullName` (NVARCHAR(100), NOT NULL)
- `Role` (NVARCHAR(20), NOT NULL, DEFAULT N'User')
- `CreatedAt` (DATETIME2, NOT NULL)

### E. Bang `dbo.BorrowRecords` (Phieu muon tra sach)
- `Id` (INT, IDENTITY, PK)
- `UserId` (INT, NOT NULL, FK -> Users.Id)
- `BookId` (INT, NOT NULL, FK -> Books.Id)
- `BorrowDate` (DATETIME2, NOT NULL)
- `DueDate` (DATETIME2, NOT NULL)
- `ReturnDate` (DATETIME2, NULL)
- `Status` (NVARCHAR(20), NOT NULL)
- `FineAmount` (DECIMAL(18,2), NOT NULL, DEFAULT 0)
- `RenewalCount` (INT, NOT NULL, DEFAULT 0): So lan gia han (toi da 2 lan)
- `Notes` (NVARCHAR(500), NULL)

### F. Bang `dbo.BookReviews` (Danh gia va Nhan xet sach)
- `Id` (INT, IDENTITY, PK)
- `BookId` (INT, NOT NULL, FK -> Books.Id, ON DELETE CASCADE)
- `UserId` (INT, NOT NULL, FK -> Users.Id, ON DELETE CASCADE)
- `Rating` (INT, NOT NULL, 1 den 5 sao)
- `Comment` (NVARCHAR(1000), NOT NULL)
- `CreatedAt` (DATETIME2, NOT NULL)

---

## 3. Du lieu Mau Tieng Viet Co Dau Day Du

### The loai sach (8 the loai):
1. Văn học Việt Nam
2. Văn học Nước ngoài
3. Công nghệ Thông tin
4. Kinh tế & Quản trị
5. Khoa học & Lịch sử
6. Kỹ năng & Tâm lý
7. Triết học & Xã hội
8. Ngoại ngữ & Từ điển

### Tac gia (8 tac gia):
1. Nguyễn Nhật Ánh
2. J.K. Rowling
3. George Orwell
4. Nam Cao
5. Robert C. Martin
6. Dale Carnegie
7. Yuval Noah Harari
8. Tô Hoài

### Dau sach tieu bieu (15 cuon):
1. Tôi Thấy Hoa Vàng Trên Cỏ Xanh
2. Mắt Biếc
3. Cho Tôi Xin Một Vé Đi Tuổi Thơ
4. Dế Mèn Phiêu Lưu Ký
5. Chí Phèo
6. Harry Potter và Hòn Đá Phù Thủy
7. Harry Potter và Phòng Chứa Bí Mật
8. Trại Súc Vật - Animal Farm
9. 1984
10. Clean Code - Nghệ Thuật Viết Mã Sạch
11. Clean Architecture - Kiến Trúc Phần Mềm
12. Đắc Nhân Tâm
13. Quẳng Gánh Lo Đi Và Vui Sống
14. Sapiens - Lược Sử Loài Người
15. Homo Deus - Lược Sử Tương Lai

### Tai khoan he thong:
- `admin` / `Admin@123456` (Quản Trị Viên)
- `user1` / `User@123456` (Người Dùng Mẫu)
- `sinhvien1` / `User@123456` (Nguyễn Văn An)
- `giangvien1` / `User@123456` (Trần Thị Bình)


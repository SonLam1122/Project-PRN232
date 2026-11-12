# Tai lieu Kien truc He thong PRN232 - Library Management

## 1. Tong quan He thong
Du an xay dung ung dung RESTful Web API quan ly thu vien sach theo chuan cong nghe ASP.NET Core (.NET 8 LTS), dap ung toan dien cac tieu chi nghiep vu, phan quyen, thuong luong noi dung, va kiem soat toan ven du lieu.

## 2. Mo hinh Du lieu 5 Thuc the (Entity Relationship)
He thong duoc mo hinh hoa voi 5 thuc the quan he chat che:
1. **Users** (`Id`, `Username`, `Email`, `PasswordHash`, `FullName`, `Role`, `CreatedAt`)
   - Rang buoc duy nhat: `Username`, `Email`.
   - Quan he 1-N voi `BorrowRecords`.
2. **Authors** (`Id`, `FullName`, `Biography`, `DateOfBirth`)
   - Quan he 1-N voi `Books`.
3. **Categories** (`Id`, `Name`, `Description`)
   - Rang buoc duy nhat: `Name`.
   - Quan he 1-N voi `Books`.
4. **Books** (`Id`, `Title`, `ISBN`, `Description`, `Price`, `Quantity`, `PublishedDate`, `AuthorId`, `CategoryId`)
   - Rang buoc duy nhat: `ISBN`.
   - Rang buoc gia va so luong hop le (Quantity >= 0).
   - Khoa ngoai den `AuthorId` va `CategoryId`.
   - Quan he 1-N voi `BorrowRecords`.
5. **BorrowRecords** (`Id`, `UserId`, `BookId`, `BorrowDate`, `DueDate`, `ReturnDate`, `Status`, `FineAmount`, `Notes`)
   - Khoa ngoai den `UserId` va `BookId`.
   - Quan ly chu trinh muon, tra, kiem tra han tra va tu dong tinh tien phat tre han.

## 3. Danh muc Controllers va Chinh sach Bao mat (Authorization Policy)
| Controller | Chuc nang | Chinh sach Xac thuc & Phan quyen |
| :--- | :--- | :--- |
| **AuthController** | Dang ky, Dang nhap, Xem thong tin, Doi mat khau | Dang ky/Dang nhap: Public; Me/Doi mat khau: `[Authorize]` |
| **BooksController** | CRUD Sach, OData, Content Negotiation | GET: Public; POST/PUT/DELETE: `[Authorize(Roles = "Admin")]` |
| **CategoriesController** | CRUD The loai sach | GET: Public; POST/PUT/DELETE: `[Authorize(Roles = "Admin")]` |
| **AuthorsController** | CRUD Tac gia sach | GET: Public; POST/PUT/DELETE: `[Authorize(Roles = "Admin")]` |
| **BorrowRecordsController** | Muon sach, Tra sach, Lich su muon | Muon/Tra/Lich su: `[Authorize]`; Toan bo phieu: `[Authorize(Roles = "Admin")]` |
| **UsersController** | Quan ly danh sach tai khoan va phan quyen | Toan bo: `[Authorize(Roles = "Admin")]` |
| **StatisticsController** | Bao cao thong ke tong hop he thong | Toan bo: `[Authorize(Roles = "Admin")]` |

## 4. Cong nghe va Kien truc Cot loi
- **Framework**: ASP.NET Core Web API (.NET 8.0 LTS)
- **ORM**: Entity Framework Core 8.0 Code First (SQL Server / LocalDB)
- **Bao mat & Xac thuc**:
  - JWT Bearer Authentication (HS256)
  - PBKDF2 Password Hasher voi Salt 16 bytes va 10,000 iterations
  - Validate mat khau chat che (it nhat 8 ky tu, chu hoa, chu thuong, chu so, ky tu dac biet)
  - Phan quyen dua tren Role (`Admin`, `User`)
- **Data Validation & Integrity**:
  - Data Annotations tren DTOs va Entities
  - Validate toan ven khoa ngoai khi them/sua
  - Kiem tra so luong ton kho truoc khi cho muon
  - Ngan chan xoa the loai, tac gia hoac sach dang co phieu muon hoat dong
- **Chuyen doi Du lieu**: AutoMapper 12.0.1 (anh xa Profile hai chieu)
- **Truy van OData**: Microsoft.AspNetCore.OData 8.2.5 ($filter, $select, $orderby, $top, $skip, $count)
- **Content Negotiation & Custom Formatter**:
  - `application/json`
  - `application/xml`
  - `text/csv` (Custom CsvOutputFormatter theo RFC 4180)
- **Xu ly Ngoai le & Debug**: GlobalExceptionMiddleware tap trung bat loi he thong va ghi log co cau truc
- **Giao dien Client**: Tach rieng tai thu muc `Frontend/`, goi API qua Fetch AJAX voi CORS day du

## 5. Cau truc Thu muc Du an (Tach rieng Frontend va Backend)
```text
Project PRN232/
├── Backend/                 # Ma nguon Web API ASP.NET Core .NET 8
│   ├── Controllers/         # 7 RESTful API Controllers
│   ├── Data/                # DbContext va Scripts SQL Server
│   │   └── Scripts/         # Kich ban init_database.sql
│   ├── DTOs/                # Data Transfer Objects
│   ├── Entities/            # 5 thuc the Entity Framework
│   ├── Formatters/          # Custom CsvOutputFormatter
│   ├── Middlewares/         # GlobalExceptionMiddleware
│   ├── Profiles/            # AutoMapper Profile
│   ├── Properties/          # launchSettings.json
│   ├── Services/            # PasswordHasher va JwtTokenService
│   ├── appsettings.json     # Cau hinh CSDL va JWT
│   ├── Program.cs           # Pipeline may chu API
│   ├── Project PRN232.csproj
│   └── Project PRN232.http  # Kich ban test REST Client
├── Frontend/                # Giao dien Web Client doc lap
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js           # AJAX Fetch API (ket noi http://localhost:5135)
│   └── index.html           # 3 tab: Quan ly Sach, Phieu Muon Tra, Thong ke
├── doc/                     # Tai lieu he thong
│   ├── api/
│   │   └── api_specification.md
│   └── architecture/
│       └── system_overview.md
├── Project PRN232.sln       # Solution Visual Studio
└── .gitignore               # Cau hinh bo qua tep tam

## 6. Kich ban Co so Du lieu SQL Server
- Du an cung cap san tep script khoi tao CSDL day du tai: `Backend/Data/Scripts/init_database.sql`
- Kich ban bao gom:
  - Tao database `PRN232_LibraryDb`
  - Tao 5 bang voi day du khoa chinh, khoa ngoai, rang buoc toan ven va chi muc Unique
  - Chen du lieu mau khoi tao phong phu (8 The loai, 8 Tac gia, 15 Sach, 4 Nguoi dung, 6 Phieu muon)
- Cach thuc thi:
  - Chay bang SQL Server Management Studio (SSMS), Azure Data Studio hoac Visual Studio
  - Chay bang command line:
    ```powershell
    sqlcmd -S "(localdb)\mssqllocaldb" -i "Backend\Data\Scripts\init_database.sql"
    ```

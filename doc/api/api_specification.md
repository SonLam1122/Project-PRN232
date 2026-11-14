# Dac ta API He thong Library Management (PRN232)

## 1. Tai khoan Mau Khoi tao (Seed Data)
| Ten dang nhap | Mat khau | Vai tro | Quyen han |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123456` | Admin | Toan quyen CRUD, Quan ly tai khoan, Thong ke he thong |
| `user1` | `User@123456` | User | Xem sach, Tra cuu the loai, Dang ky muon va tra sach, Doi mat khau |
| `sinhvien1` | `User@123456` | User | Tai khoan sinh vien, muon doc sach hoc phan |
| `giangvien1` | `User@123456` | User | Tai khoan giang vien, muon sach nghien cuu |

---

## 2. Danh sach Endpoints Chi Tiet

### A. Authentication API (`/api/auth`)
1. **POST `/api/auth/register`**: Dang ky tai khoan moi kem kiem tra trung lap Username va Email, mat khau bao mat manh (chu hoa, chu thuong, so, ky tu dac biet).
2. **POST `/api/auth/login`**: Dang nhap he thong, nhan JWT Token.
3. **GET `/api/auth/me`**: Lay thong tin nguoi dung hien tai tu Claims (`[Authorize]`).
4. **PUT `/api/auth/change-password`**: Nguoi dung doi mat khau co xac thuc mat khau cu (`[Authorize]`).

---

### B. Users Management API (`/api/users`)
1. **GET `/api/users`**: Admin xem danh sach tat ca tai khoan voi OData (`[Authorize(Roles = "Admin")]`).
2. **GET `/api/users/{id}`**: Admin xem chi tiet thong tin tai khoan kem thong ke so luong phieu muon, dang muon, qua han, tong tien phat (`[Authorize(Roles = "Admin")]`).
3. **PUT `/api/users/{id}`**: Admin cap nhat thong tin nguoi dung (Ho ten, Email, Vai tro, tuy chon dat lai mat khau moi) (`[Authorize(Roles = "Admin")]`).
4. **PUT `/api/users/{id}/role`**: Admin cap nhat vai tro (Admin / User) cho tai khoan (`[Authorize(Roles = "Admin")]`).

---

### C. Statistics API (`/api/statistics`)
1. **GET `/api/statistics/summary`**: Admin xem thong ke tong quan he thong (tong sach, ton kho, tac gia, the loai, phieu muon, phieu qua han, tong tien phat) (`[Authorize(Roles = "Admin")]`).
2. **GET `/api/statistics/top-books`**: Admin xem top 5 sach duoc muon nhieu nhat kem so luot muon (`[Authorize(Roles = "Admin")]`).
3. **GET `/api/statistics/category-distribution`**: Admin xem ty le dau sach, ton kho va luot muon theo tung the loai (`[Authorize(Roles = "Admin")]`).

---

### D. Categories API (`/api/categories`)
1. **GET `/api/categories`**: Lay danh sach the loai kem tong so luong sach.
2. **GET `/api/categories/{id}`**: Lay chi tiet the loai.
3. **POST `/api/categories`**: Them the loai moi (`[Authorize(Roles = "Admin")]`).
4. **PUT `/api/categories/{id}`**: Cap nhat the loai (`[Authorize(Roles = "Admin")]`).
5. **DELETE `/api/categories/{id}`**: Xoa the loai (`[Authorize(Roles = "Admin")]`) - chan xoa neu the loai con sach.

---

### E. Authors API (`/api/authors`)
1. **GET `/api/authors`**: Lay danh sach tac gia kem so luong sach.
2. **GET `/api/authors/{id}`**: Lay chi tiet tac gia.
3. **POST `/api/authors`**: Them moi tac gia (`[Authorize(Roles = "Admin")]`).
4. **PUT `/api/authors/{id}`**: Cap nhat tac gia (`[Authorize(Roles = "Admin")]`).
5. **DELETE `/api/authors/{id}`**: Xoa tac gia (`[Authorize(Roles = "Admin")]`) - chan xoa neu con sach.

---

### F. Books API (`/api/books`)
1. **GET `/api/books`**: Lay danh sach sach (OData `$filter`, `$select`, `$orderby`, Content Negotiation JSON/XML/CSV).
2. **GET `/api/books/{id}`**: Lay chi tiet cuon sach.
3. **POST `/api/books`**: Them moi sach (`[Authorize(Roles = "Admin")]`).
4. **PUT `/api/books/{id}`**: Cap nhat sach (`[Authorize(Roles = "Admin")]`).
5. **DELETE `/api/books/{id}`**: Xoa sach (`[Authorize(Roles = "Admin")]`) - chan xoa neu dang co nguoi muon.

---

### G. Book Reviews & Ratings API (`/api/books/{bookId}/reviews`)
1. **GET `/api/books/{bookId}/reviews`**: Lay toan bo danh gia, diem trung binh va nhan xet cua cuon sach. Tra ve them truong `userHasBorrowed` (xac dinh doc gia hien tai da tung muon cuon sach nay chua).
2. **POST `/api/books/{bookId}/reviews`**: Doc gia da dang nhap gui hoac cap nhat danh gia 1 den 5 sao kem nhan xet (`[Authorize]`). He thong kiem tra nghiem ngat: Chi doc gia da tung muon cuon sach nay moi duoc phep danh gia; neu chua tung muon se tra ve HTTP 400 Bad Request kem thong bao yeu cau.
3. **DELETE `/api/books/{bookId}/reviews/{id}`**: Xoa nhan xet (Danh cho Admin hoac chinh chu nhan review) (`[Authorize]`).

---

### H. Borrow Records API (`/api/borrowrecords`)
1. **GET `/api/borrowrecords`**: Admin lay danh sach tat ca phieu muon voi OData (`[Authorize(Roles = "Admin")]`).
2. **GET `/api/borrowrecords/my-history`**: Doc gia xem lich su muon tra ca nhan (`[Authorize]`).
3. **GET `/api/borrowrecords/{id}`**: Lay chi tiet mot phieu muon (`[Authorize]`).
4. **POST `/api/borrowrecords/borrow`**: Dang ky muon sach (`[Authorize]`) - giam ton kho, chan muon trung.
5. **PUT `/api/borrowrecords/{id}/renew`**: Gia han phieu muon them 7 ngay toi da 2 lan (`[Authorize]`).
6. **PUT `/api/borrowrecords/{id}/return`**: Tra sach (`[Authorize]`) - tang lai ton kho, tinh tien phat tre han.

---

### I. Favorites API (`/api/favorites`)
1. **GET `/api/favorites`**: Lay toan bo danh sach sach yeu thich cua doc gia hien tai (`[Authorize]`).
2. **GET `/api/favorites/check/{bookId}`**: Kiem tra trang thai yeu thich cua dau sach doi voi doc gia (`[Authorize]`).
3. **POST `/api/favorites/{bookId}`**: Them cuon sach vao danh sach yeu thich ca nhan (`[Authorize]`).
4. **DELETE `/api/favorites/{bookId}`**: Xoa cuon sach khoi danh sach yeu thich ca nhan (`[Authorize]`).

---

## 3. Xuat file danh sach sach
- Trang quan tri goi `GET /api/books?$top=50` kem bo loc va sap xep hien tai, gui header `Accept` theo nut JSON, XML hoac CSV.
- Frontend tai response thanh `books.json`, `books.xml` hoac `books.csv` bang Blob URL va thuoc tinh `download`; khong hien thi response tho tren giao dien.
- `BookXmlOutputFormatter` chuyen collection sach tu OData thanh `List<BookReadDto>` de xuat XML; formatter XML mac dinh van xu ly ket qua sach theo ID.
- CSV duoc them UTF-8 BOM o frontend de Excel doc dung tieng Viet. Response loi hoac sai Content-Type se khong duoc tai thanh file.

## 4. Huong dan Khoi chay va Kiem thu
1. Khoi chay Web API (Backend):
   ```powershell
   dotnet run --project Backend
   ```
2. Mo giao dien Client (Frontend):
   - Mo tep `Frontend/index.html` de vao truc tiep Trang chu thu vien
   - Dang nhap tai khoan Admin de he thong tu dong dieu huong sang Trang Quan Tri (`Frontend/admin/index.html`)
3. Swagger UI:
   - Truy cap: `http://localhost:5135/swagger`
4. Kiem thu REST Client:
   - Mo file [Project PRN232.http](file:///c:/Users/admin/Documents/Project/Project%20PRN232/Backend/Project%20PRN232.http) trong Visual Studio hoac VS Code.

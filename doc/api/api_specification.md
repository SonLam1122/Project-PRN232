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
1. **POST `/api/auth/register`**: Dang ky tai khoan moi (Mat khau phai co chu hoa, thuong, so, ky tu dac biet).
2. **POST `/api/auth/login`**: Dang nhap he thong, nhan JWT Token.
3. **GET `/api/auth/me`**: Lay thong tin nguoi dung hien tai tu Claims (`[Authorize]`).
4. **PUT `/api/auth/change-password`**: Nguoi dung doi mat khau co xac thuc mat khau cu (`[Authorize]`).

---

### B. Users Management API (`/api/users`)
1. **GET `/api/users`**: Admin xem danh sach tat ca tai khoan voi OData (`[Authorize(Roles = "Admin")]`).
2. **PUT `/api/users/{id}/role`**: Admin cap nhat vai tro (Admin / User) cho tai khoan (`[Authorize(Roles = "Admin")]`).

---

### C. Statistics API (`/api/statistics`)
1. **GET `/api/statistics/summary`**: Admin xem thong ke tong quan he thong (tong sach, ton kho, tac gia, the loai, phieu muon, phieu qua han, tong tien phat) (`[Authorize(Roles = "Admin")]`).

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

### G. Borrow Records API (`/api/borrowrecords`)
1. **GET `/api/borrowrecords`**: Admin lay danh sach tat ca phieu muon voi OData (`[Authorize(Roles = "Admin")]`).
2. **GET `/api/borrowrecords/my-history`**: Doc gia xem lich su muon tra ca nhan (`[Authorize]`).
3. **GET `/api/borrowrecords/{id}`**: Lay chi tiet mot phieu muon (`[Authorize]`).
4. **POST `/api/borrowrecords/borrow`**: Dang ky muon sach (`[Authorize]`) - giam ton kho, chan muon trung.
5. **PUT `/api/borrowrecords/{id}/return`**: Tra sach (`[Authorize]`) - tang lai ton kho, tinh tien phat tre han.

---

## 3. Huong dan Khoi chay va Kiem thu
1. Khoi chay Web API (Backend):
   ```powershell
   dotnet run --project Backend
   ```
2. Mo giao dien Client (Frontend):
   - Mo truc tiep file `Frontend/index.html` tren trinh duyet (Chrome, Edge)
   - Hoac su dung Live Server / http-server tai thu muc `Frontend/`
3. Swagger UI:
   - Truy cap: `http://localhost:5135/swagger`
4. Kiem thu REST Client:
   - Mo file [Project PRN232.http](file:///c:/Users/admin/Documents/Project/Project%20PRN232/Backend/Project%20PRN232.http) trong Visual Studio hoac VS Code.

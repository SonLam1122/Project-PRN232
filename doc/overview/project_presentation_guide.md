# Báo Cáo Toàn Diện Dự Án Quản Lý Thư Viện - PRN232

## 1. Tổng quan Kiến trúc và Công nghệ

Dự án Hệ Thống Quản Lý Thư Viện được xây dựng theo kiến trúc phân tầng chuẩn doanh nghiệp (Client-Server Architecture) tách biệt độc lập giữa Backend API và Frontend giao diện.

### Công nghệ sử dụng:
- **Backend**:
  - Nền tảng: ASP.NET Core 8.0 Web API.
  - Cơ sở dữ liệu và ORM: Microsoft SQL Server LocalDB (`PRN232_LibraryDb`), Entity Framework Core 8.0.
  - Xác thực và Phân quyền: JSON Web Token (JWT Bearer Authentication) với 2 vai trò `Admin` và `User`.
  - Chuẩn truy vấn dữ liệu: Microsoft ASP.NET Core OData (hỗ trợ `$select`, `$filter`, `$orderby`, `$top`, `$skip`, `$count`).
  - Đàm phán nội dung (Content Negotiation): Hỗ trợ xuất dữ liệu đa định dạng JSON, XML và Custom CSV Formatter.
  - Ánh xạ đối tượng: AutoMapper 12.0.1.
  - Mã hóa mật khẩu: Thuật toán băm PBKDF2 với muối ngẫu nhiên (Salt) và 10.000 vòng lặp.
- **Frontend**:
  - Ngôn ngữ: HTML5, CSS3 hiện đại, Vanilla JavaScript (ES6+).
  - Không phụ thuộc thư viện UI cồng kềnh, tối ưu tốc độ tải trang dưới 50ms.
  - Xử lý ảnh bìa sách thông minh với hệ thống ảnh SVG nội bộ và cơ chế tự động bù ảnh mặc định chống lỗi hiển thị.

---

## 2. Cấu trúc Cơ sở dữ liệu và Quan hệ thực thể

Cơ sở dữ liệu gồm 7 bảng nghiệp vụ liên kết chặt chẽ:

1. **Users**: Quản lý tài khoản độc giả và quản trị viên (`Id`, `Username`, `Email`, `PasswordHash`, `FullName`, `Role`, `CreatedAt`). Có Unique Index trên `Username` và `Email`.
2. **Authors**: Quản lý thông tin tác giả sách (`Id`, `FullName`, `Bio`, `BirthYear`).
3. **Categories**: Quản lý thể loại sách (`Id`, `Name`, `Description`). Có Unique Index trên `Name`.
4. **Books**: Kho sách thư viện (`Id`, `Title`, `ISBN`, `CategoryId`, `AuthorId`, `Price`, `Quantity`, `PublishedDate`, `ImageUrl`, `Description`). Có Unique Index trên `ISBN`.
5. **BorrowRecords**: Quản lý hồ sơ mượn trả (`Id`, `UserId`, `BookId`, `BorrowDate`, `DueDate`, `ReturnDate`, `Status`, `FineAmount`, `Notes`, `RenewalCount`).
6. **BookReviews**: Đánh giá và nhận xét của độc giả (`Id`, `BookId`, `UserId`, `Rating`, `Comment`, `CreatedAt`). Điểm đánh giá từ 1 đến 5 sao.
7. **Favorites**: Danh sách sách yêu thích của độc giả (`Id`, `UserId`, `BookId`, `CreatedAt`). Có Unique Index trên cặp `(UserId, BookId)`.

### Ràng buộc toàn vẹn dữ liệu:
- Khi xóa sách: Hệ thống chặn xóa nếu sách đang có phiếu mượn chưa hoàn tất (`Status = Active` hoặc `Overdue`).
- Khi xóa thể loại hoặc tác giả: Hệ thống chặn xóa nếu vẫn còn đầu sách thuộc về thể loại hoặc tác giả đó.
- Xóa người dùng: Tự động xóa liên hoàn (`CASCADE`) các phiếu mượn, nhận xét và danh sách yêu thích tương ứng.

---

## 3. Cách thức hoạt động của các phân hệ nghiệp vụ

### A. Luồng Đăng nhập và Phân quyền tập trung
- Điểm đến mặc định duy nhất khi mở ứng dụng là Trang chủ (`Frontend/index.html`).
- Khi khách vãng lai hoặc độc giả truy cập: Có thể tra cứu sách, tìm kiếm theo tên, sắp xếp theo giá hoặc tiêu đề A-Z mà không cần đăng nhập.
- Khi đăng nhập tài khoản Quản trị (`Admin`): Hệ thống xác thực JWT Token, lưu thông tin phiên và tự động điều hướng sang Trang Quản Trị (`Frontend/admin/index.html`).
- Khi quản trị viên bấm Đăng xuất: Hệ thống xóa sạch JWT Token trong LocalStorage và tự động điều hướng ngay về Trang chủ.
- Bảo mật đường dẫn: Nếu người dùng chưa đăng nhập hoặc không mang vai trò `Admin` cố tình truy cập vào `admin/index.html`, hệ thống tự động kiểm tra token và trả về Trang chủ ngay lập tức.

### B. Luồng Đăng ký tài khoản
- Người dùng nhập Tên đăng nhập, Email, Họ tên và Mật khẩu (yêu cầu tối thiểu 8 ký tự gồm chữ hoa, chữ thường, số, ký tự đặc biệt).
- Khi người dùng gửi form, API `POST /api/auth/register` kiểm tra trùng lặp `Username` và `Email` trong cơ sở dữ liệu. Nếu bị trùng, hệ thống từ chối và hiển thị thông báo lỗi rõ ràng bằng tiếng Việt có dấu.

### C. Luồng Mượn sách và Quản lý Tồn kho
1. Độc giả xem danh mục hoặc chi tiết sách, bấm nút Mượn sách.
2. Hộp thoại mượn sách mở ra, tự động gợi ý hạn trả sau 14 ngày.
3. Khi bấm Xác nhận mượn:
   - Hệ thống kiểm tra số lượng tồn kho (`Quantity > 0`).
   - Kiểm tra độc giả có đang mượn cuốn sách này chưa trả hay không (chống mượn trùng).
   - Tự động trừ 1 đơn vị tồn kho của cuốn sách.
   - Tạo mới bản ghi `BorrowRecords` với trạng thái `Active`.

### D. Luồng Gia hạn và Trả sách
- **Gia hạn phiếu mượn**: Độc giả được phép gia hạn phiếu mượn thêm 7 ngày (tối đa 2 lần gia hạn cho mỗi phiếu mượn, chỉ áp dụng khi phiếu chưa bị quá hạn).
- **Trả sách và Phạt trễ hạn**:
  - Khi độc giả hoặc thủ thư bấm Trả sách, hệ thống ghi nhận ngày trả thực tế `ReturnDate`.
  - Tự động cộng trả lại 1 đơn vị vào số lượng tồn kho của sách.
  - Cập nhật trạng thái phiếu thành `Returned`.
  - Nếu ngày trả thực tế vượt quá ngày hẹn trả (`DueDate`), hệ thống tự động tính tiền phạt phát sinh theo công thức: Số ngày trễ hạn nhân 10.000 đồng/ngày.

### E. Luồng Đánh giá và Nhận xét sách
- Tích hợp ngay trong hộp thoại chi tiết sách.
- Hiển thị điểm sao trung bình và danh sách các nhận xét trước đó.
- Ràng buộc nghiệp vụ nghiêm ngặt: Chỉ độc giả đã đăng nhập và ĐÃ TỪNG MƯỢN cuốn sách đó mới được phép viết nhận xét và gửi điểm đánh giá từ 1 đến 5 sao. Độc giả chưa từng mượn sẽ nhận được thông báo yêu cầu mượn sách trước khi viết đánh giá.

### F. Luồng Sách yêu thích của độc giả
- Độc giả có thể lưu các cuốn sách quan tâm vào danh sách yêu thích cá nhân bằng nút Lưu yêu thích trong hộp thoại chi tiết hoặc bỏ lưu bất cứ lúc nào.
- Tab riêng "Sách yêu thích" trên trang chủ hiển thị toàn bộ sách đã lưu, tình trạng còn hay hết sách, cho phép mượn nhanh hoặc bỏ lưu trực tiếp.

### G. Phân hệ Quản trị Thư viện
- **Quản lý Kho sách**: Thêm mới, chỉnh sửa thông tin sách, cập nhật số lượng tồn, xóa sách an toàn, hỗ trợ đàm phán nội dung tải dữ liệu JSON, XML, CSV.
- **Quản lý Mượn Trả**: Theo dõi toàn bộ phiếu mượn của độc giả toàn thư viện, lọc trạng thái Đang mượn, Đã trả, Quá hạn, thực hiện xác nhận nhận trả sách.
- **Quản lý Thể loại và Tác giả**: Thêm mới, thống kê số lượng sách thuộc thể loại hoặc tác giả, kiểm tra an toàn trước khi xóa.
- **Thống kê Báo cáo**: Tổng hợp số đầu sách, tổng tồn kho, số phiếu đang lưu hành, số phiếu quá hạn, tổng tiền phạt phát sinh, biểu đồ top sách mượn nhiều nhất và phân bổ mượn theo thể loại.
- **Quản lý Người dùng**: Xem danh sách tài khoản, mở hồ sơ chi tiết (xem lịch sử mượn, số sách đang giữ, nợ phạt), chỉnh sửa họ tên, email, thay đổi vai trò (User hoặc Admin) có cơ chế bảo vệ không cho hạ quyền Admin duy nhất, và đặt lại mật khẩu người dùng.

---

## 4. Danh mục API Toàn Diện

| Phân hệ | Phương thức | Endpoint | Phân quyền | Chức năng nghiệp vụ |
|---|---|---|---|---|
| **Xác thực** | POST | `/api/auth/register` | Công khai | Đăng ký tài khoản, kiểm tra trùng username và email |
| | POST | `/api/auth/login` | Công khai | Đăng nhập hệ thống, phát hành mã JWT Token |
| | GET | `/api/auth/me` | Đã đăng nhập | Lấy thông tin tài khoản đang đăng nhập từ Claims |
| | PUT | `/api/auth/change-password` | Đã đăng nhập | Đổi mật khẩu cá nhân có kiểm tra mật khẩu hiện tại |
| **Sách** | GET | `/api/books` | Công khai | Tra cứu sách với OData: filter, sort, paging, top |
| | GET | `/api/books/{id}` | Công khai | Lấy thông tin chi tiết đầy đủ của một đầu sách |
| | POST | `/api/books` | Admin | Thêm sách mới vào kho |
| | PUT | `/api/books/{id}` | Admin | Cập nhật thông tin và số lượng sách |
| | DELETE | `/api/books/{id}` | Admin | Xóa đầu sách (chặn xóa nếu đang được mượn) |
| **Đánh giá** | GET | `/api/books/{bookId}/reviews` | Công khai | Lấy danh sách đánh giá, điểm trung bình và cờ đã mượn |
| | POST | `/api/books/{bookId}/reviews` | Đã đăng nhập | Gửi đánh giá 1-5 sao (chỉ cho phép khi đã mượn sách) |
| | DELETE | `/api/books/{bookId}/reviews/{id}` | Đã đăng nhập | Xóa đánh giá (chính chủ hoặc Admin) |
| **Mượn trả** | GET | `/api/borrowrecords` | Admin | Lấy danh sách tất cả phiếu mượn toàn hệ thống |
| | GET | `/api/borrowrecords/my-history` | Đã đăng nhập | Lấy lịch sử mượn trả cá nhân của độc giả |
| | GET | `/api/borrowrecords/{id}` | Đã đăng nhập | Lấy chi tiết một phiếu mượn cụ thể |
| | POST | `/api/borrowrecords/borrow` | Đã đăng nhập | Đăng ký mượn sách, trừ tồn kho, chặn mượn trùng |
| | PUT | `/api/borrowrecords/{id}/renew` | Đã đăng nhập | Gia hạn phiếu mượn thêm 7 ngày (tối đa 2 lần) |
| | PUT | `/api/borrowrecords/{id}/return` | Đã đăng nhập | Trả sách, hoàn tồn kho, tự động tính tiền phạt trễ hạn |
| **Yêu thích** | GET | `/api/favorites` | Đã đăng nhập | Lấy danh sách sách yêu thích của cá nhân |
| | GET | `/api/favorites/check/{bookId}` | Đã đăng nhập | Kiểm tra trạng thái đã lưu yêu thích của đầu sách |
| | POST | `/api/favorites/{bookId}` | Đã đăng nhập | Lưu sách vào danh sách yêu thích |
| | DELETE | `/api/favorites/{bookId}` | Đã đăng nhập | Bỏ sách khỏi danh sách yêu thích |
| **Thể loại** | GET | `/api/categories` | Công khai | Danh sách thể loại kèm số lượng sách |
| | POST | `/api/categories` | Admin | Thêm mới thể loại |
| | DELETE | `/api/categories/{id}` | Admin | Xóa thể loại (chặn xóa nếu còn sách) |
| **Tác giả** | GET | `/api/authors` | Công khai | Danh sách tác giả kèm số lượng sách |
| | POST | `/api/authors` | Admin | Thêm mới tác giả |
| | DELETE | `/api/authors/{id}` | Admin | Xóa tác giả (chặn xóa nếu còn sách) |
| **Người dùng**| GET | `/api/users` | Admin | Xem danh sách người dùng với OData |
| | GET | `/api/users/{id}` | Admin | Xem chi tiết người dùng và thống kê lịch sử mượn |
| | PUT | `/api/users/{id}` | Admin | Chỉnh sửa thông tin, vai trò, đặt lại mật khẩu |
| **Thống kê** | GET | `/api/statistics/summary` | Admin | Tổng hợp số liệu tổng quan toàn hệ thống |
| | GET | `/api/statistics/top-books` | Admin | Lấy danh sách top sách được mượn nhiều nhất |
| | GET | `/api/statistics/category-distribution`| Admin | Thống kê phân bổ mượn sách theo từng thể loại |

---

## 5. Hướng dẫn Khởi chạy và Trải nghiệm

1. **Khởi động Backend Web API**:
   - Chạy lệnh: `dotnet run --project Backend`
   - Dịch vụ lắng nghe tại: `http://localhost:5135`
   - Tài liệu Swagger UI trực quan: `http://localhost:5135/swagger`
2. **Khởi động Giao diện Frontend**:
   - Mở trực tiếp file `Frontend/index.html` trên trình duyệt Chrome, Edge hoặc thông qua Live Server.
3. **Tài khoản kiểm thử có sẵn**:
   - Tài khoản Quản trị: `admin` / `Admin@123456`
   - Tài khoản Độc giả: `user1` / `User@123456`
   - Tài khoản Sinh viên: `sinhvien1` / `User@123456`


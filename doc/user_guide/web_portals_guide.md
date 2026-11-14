# Huong dan Su dung He thong Web Thu vien (PRN232)

## 1. Tong quan Luong Dieu huong va Phan quyen
He thong thiet ke theo mo hinh truc quan va thuan tien nhat cho nguoi dung:
- **Diem den mac dinh**: Khi truy cap ung dung, nguoi dung vao truc tiep **Trang chu** (`Frontend/index.html`) ma khong phai qua man hinh trung gian.
- **Tra cuu mo cho moi nguoi**: Tat ca nguoi dung, ban doc va khach vang lai deu co the xem danh muc sach, tim kiem va loc theo gia ngay tai Trang chu.
- **Phan quyen sau khi Dang nhap**:
  - Khi dang nhap tai khoan **Admin** (vi du: `admin` / `Admin@123456`), he thong tu dong phan quyen va dieu huong ngay vao **Trang Quan Tri** (`Frontend/admin/index.html`).
  - Khi dang nhap tai khoan **Doc gia** (`User`), he thong xac thuc phien lam viec tai Trang chu, mo khoa chuc nang dang ky muon sach va theo doi phieu muon ca nhan.
  - Quan tri vien khi quay lai Trang chu se co nut "Trang Quan Tri" de quay lai khu vuc quan ly bat cu luc nao.

---

## 2. Huong dan Su dung Trang chu va Ban doc
- **Duong dan truy cap**: `Frontend/index.html`

### Chuc nang chinh:
1. **Tra cuu va Loc sach kem Hinh anh bia sach**:
   - Danh muc sach tich hop hinh anh bia sach truc quan cho tung dau sach (co fallback SVG).
   - Tim kiem sach theo tieu de.
   - Sap xep danh sach theo gia thue tang dan, gia giam dan, hoac tieu de tu A den Z.
   - Xem chi tiet: Hinh anh bia, Ma ISBN, The loai, Tac gia, Gia thue, Tinh trang ton kho.
2. **Xem chi tiet cuon sach (Modal chi tiet)**:
   - Khi nhap chuot vao bat ky dau sach nao trong bang tra cuu, hop thoai chi tiet sach xuat hien ngay lap tuc.
   - Hien thi anh bia lon, tieu de, tac gia, the loai, ma ISBN, gia thue, tinh trang ton kho, ngay phat hanh va toan bo doan van mo ta noi dung sach bang tieng Viet co dau chuan.
   - Tich hop he thong Danh gia & Nhan xet tu ban doc: Hien thi diem sao trung binh va danh sach nhan xet. Doc gia chi co the gui danh gia tu 1 den 5 sao va nhan xet sau khi da thuc te muon cuon sach do tu thu vien; neu chua tung muon, he thong se thong bao va khoa form danh gia.
   - Tich hop nut "Luu yeu thich" de danh dau cuon sach vao danh sach quan tam cua ca nhan.
   - Tich hop nut "Muon sach nay" de chuyen nhanh sang hop thoai xac nhan muon sach neu sach con hang.
3. **Dang ky va Dang nhap Tai khoan**:
   - Nguoi dung co the tao tai khoan moi qua form dang ky (mat khau toi thieu 8 ky tu gom chu hoa, chu thuong, so, ky tu dac biet).
   - Tich hop kiem tra trung lap Username va Email khi bam xac nhan dang ky, canh bao ro rang bang tieng Viet co dau neu thong tin da duoc su dung.
   - Dang nhap bang tai khoan he thong (vi du: `admin`, `user1`, `sinhvien1`).
4. **Dang ky Muon va Thue sach**:
   - Khi doc gia da dang nhap, bam nut "Muon sach" tai hang sach muon muon de mo hop thoai xac nhan.
   - Thiet lap ngay hen tra (mac dinh he thong goi y 14 ngay).
   - Nhap ghi chu muc dich muon sach.
   - Xac nhan muon sach (he thong tu dong giam 1 don vi ton kho sach).
5. **Theo doi Sach dang muon va Lich su**:
   - Xem toan bo phieu muon cua ca nhan.
   - Xem trang thai phieu: Dang muon, Da tra, Qua han.
   - Tich hop chuc nang Gia han phieu muon them 7 ngay (toi da 2 lan gia han khi phieu chua qua han).
   - Kiem tra tien phat phat sinh neu tra qua han.
   - Chu dong thuc hien tra sach ngay tren danh sach phieu.
6. **Quan ly Danh sach Sach Yeu Thich (Wishlist)**:
   - Khi da dang nhap, doc gia co tab "Sach yeu thich" rieng biet de xem toan bo sach da luu.
   - Xem tinh trang ton kho, gia thue, thong tin chi tiet.
   - Thao tac truc tiep: Bam "Muon sach" ngay tren danh sach yeu thich hoac bam "Bo luu" de go khoi danh sach.

---

## 3. Huong dan Su dung Trang Quan tri Thu vien
- **Duong dan truy cap**: `Frontend/admin/index.html`

### Chuc nang chinh:
1. **Bao mat va Kiem soat Quyen Quan tri**:
   - He thong su dung co che dang nhap tap trung duy nhat tai Trang chu.
   - Trang quan tri khong chua form dang nhap rieng. Neu nguoi dung chua dang nhap hoac khong co quyen Admin, he thong tu dong chuyen huong ve Trang chu.
   - Khi quan tri vien bam Dang xuat, he thong xoa phien lam viec va tu dong tra ve Trang chu ngay lap tuc.
2. **Quan ly Kho sach (Book Management)**:
   - Them moi dau sach: Tieu de, ISBN, The loai, Tac gia, Gia, Ton kho, Ngay xuat ban, Mo ta.
   - Chinh sua thong tin sach va cap nhat ton kho.
   - Xoa dau sach (chan xoa neu sach dang co phieu muon chua hoan tat).
   - Bam JSON, XML hoac CSV de tai file `books.json`, `books.xml` hoac `books.csv` ve may qua Content Negotiation.
   - File xuat dung bo loc va sap xep hien tai, toi da 50 sach nhu bang danh sach. Khong con khung hien thi phan hoi tho.
   - CSV co UTF-8 BOM de Excel doc dung tieng Viet. Neu API loi hoac tra sai dinh dang, giao dien thong bao loi va khong tai file.
3. **Quan ly Muon Tra (Borrow Records Management)**:
   - Xem toan bo phieu muon cua tat ca doc gia trong thu vien.
   - Xac nhan nhan tra sach, hoan tra so luong kho va tu dong tinh tien phat tre han (10.000 dong/ngay).
4. **Quan ly The loai va Tac gia**:
   - Them the loai moi, theo doi so dau sach, chan xoa neu con sach.
   - Them tac gia moi, ghi nhan tieu su, chan xoa neu con sach.
5. **Thong ke Bao cao Quan tri**:
   - Tong so dau sach, tong ton kho, phieu dang luu hanh, phieu qua han, tong tien phat thu duoc.
6. **Quan ly Nguoi dung va Phan quyen**:
   - Danh sach toan bo tai khoan he thong.
   - Xem chi tiet nguoi dung: Thong tin ca nhan, ngay tao, tong so luot muon, so sach dang muon, so phieu qua han va tong tien phat da phat sinh.
   - Chinh sua thong tin nguoi dung: Sua ho ten, email, phan quyen vai tro (User hoac Admin), va dat lai mat khau moi truc tiep. Chuc nang co co che chan ha quyen admin duy nhat de bao ve he thong.

---

## 4. Huong dan Khoi dong He thong
1. **Khoi dong Backend Web API**:
   ```powershell
   dotnet run --project Backend
   ```
   May chu Web API se lang nghe tai dia chi `http://localhost:5135`.
2. **Mo Giao dien Web**:
   - Mo tep `Frontend/index.html` tren trinh duyet de vao thang Trang chu.
   - Dang nhap bang tai khoan Admin neu muon vao khu vuc quan tri.

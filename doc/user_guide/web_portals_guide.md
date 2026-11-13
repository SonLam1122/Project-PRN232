# Huong dan Su dung Hai Phan he Web Thu vien (PRN232)

## 1. Tong quan Phan tach He thong Web
He thong duoc tach biet thanh hai phan he web doc lap phuc vu hai nhom doi tuong nguoi dung rieng biet:
- **Web Doc Gia (User Portal)**: Danh cho ban doc thuc hien tra cuu, thue sach, muon sach va theo doi lich su muon ca nhan.
- **Web Quan Tri Thu Vien (Admin Portal)**: Danh cho thu thu va quan tri vien quan ly toan dien kho sach, danh muc the loai, tac gia, kiem duyet phieu muon tra, tinh phat va bao cao thong ke.
- **Cong Dieu Huong Trung Tam (Portal Hub)**: Diem truy cap chung giup nguoi dung lua chon vao phan he mong muon.

---

## 2. Huong dan Su dung Web Doc Gia (User Portal)
- **Duong dan truy cap**: `Frontend/user/index.html`

### Chuc nang chinh:
1. **Dang ky va Dang nhap Tai khoan**:
   - Nguoi dung co the tao tai khoan moi qua form dang ky (yeu cau mat khau co chu hoa, chu thuong, so, ky tu dac biet).
   - Dang nhap he thong de lay JWT Token xac thuc.
   - Ho tro cac tai khoan mau: `user1`, `sinhvien1` voi mat khau `User@123456`.
2. **Tra cuu va Loc sach de Thue / Muon**:
   - Tim kiem sach theo tieu de sach.
   - Sap xep danh sach theo gia thue tang dan, gia giam dan, hoac tieu de A-Z.
   - Xem thong tin chi tiet: Ma ISBN, The loai, Tac gia, Gia thue, So luong sach con trong kho.
   - Nut "Chon muon" giup tu dong dien sach vao form dang ky muon.
3. **Dang ky Muon va Thue sach**:
   - Chon dau sach con trong kho.
   - Thiet lap ngay hen tra (he thong tu dong goi y mac dinh 14 ngay).
   - Nhap ghi chu muc dich muon sach.
   - Gui yeu cau muon sach (he thong tu dong giam 1 don vi ton kho sach).
4. **Theo doi Sach dang muon va Lich su**:
   - Xem toan bo cac phieu muon cua ca nhan nguoi dung.
   - Xem trang thai phieu: Dang muon (Active), Da tra (Returned), Qua han (Overdue).
   - Kiem tra tien phat phat sinh neu tra qua han.
   - Thuc hien chu dong tra sach truc tiep tu giao dien ca nhan.

---

## 3. Huong dan Su dung Web Quan Tri Thu Vien (Admin Portal)
- **Duong dan truy cap**: `Frontend/admin/index.html`

### Chuc nang chinh:
1. **Dang nhap Quan tri vien**:
   - Yeu cau tai khoan co vai tro Admin (`admin` / `Admin@123456`).
   - He thong kiem tra quyen nghiem ngat, chan tai khoan User thuong truy cap khu vuc quan tri.
2. **Quan ly Kho sach (Book Management)**:
   - Form them moi dau sach: Tieu de, ISBN, The loai, Tac gia, Gia, So luong ton kho, Ngay xuat ban, Mo ta.
   - Chinh sua thong tin sach va cap nhat ton kho.
   - Xoa dau sach (he thong tu dong chan xoa neu sach dang co phieu muon chua hoan tat).
   - Xuat du lieu theo co che Content Negotiation (JSON, XML, CSV).
3. **Quan ly Muon Tra (Borrow Records Management)**:
   - Hien thi toan bo phieu muon cua tat ca doc gia trong thu vien.
   - Quan tri vien thuc hien nut "Nhan tra" de xac nhan doc gia da tra sach, he thong tu dong hoan tra so luong ton kho va tinh tien phat tre han (10.000 dong/ngay tre).
4. **Quan ly The loai va Tac gia**:
   - Quan ly The loai (Categories): Them the loai moi, theo doi tong so dau sach thuoc the loai, chan xoa neu the loai con sach.
   - Quan ly Tac gia (Authors): Them tac gia moi, ghi nhan tieu su, chan xoa neu tac gia con sach trong thu vien.
5. **Thong ke Bao cao Quan tri (Statistics Summary)**:
   - Bao cao tong so dau sach trong thu vien.
   - Bao cao tong so ban sach ton kho.
   - So luong phieu muon dang luu hanh.
   - So luong phieu muon bi qua han.
   - Tong so tien phat da thu duoc.
6. **Quan ly Nguoi dung va Phan quyen (Users Management)**:
   - Xem danh sach toan bo tai khoan trong he thong.
   - Chuyen doi vai tro giua User va Admin nhanh chong.

---

## 4. Huong dan Khoi dong He thong
1. **Khoi dong Backend Web API**:
   ```powershell
   dotnet run --project Backend
   ```
   May chu Web API se lang nghe tai dia chi `http://localhost:5135`.
2. **Mo Giao dien Web**:
   - Mo tep `Frontend/index.html` de vao Cong Dieu Huong trung tam.
   - Chon "Truy cap Cong Doc Gia" hoac "Truy cap Cong Quan Tri" theo nhu cau.


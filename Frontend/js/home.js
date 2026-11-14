// Cau hinh dia chi may chu Web API
const API_BASE_URL = "http://localhost:5135";

// Trang thai nguoi dung va giao dien hien tai
const homeState = {
    token: localStorage.getItem("jwt_token") || "",
    role: localStorage.getItem("user_role") || "",
    username: localStorage.getItem("user_name") || "",
    activeMainTab: "catalog"
};

// Khoi chay khi giao dien tai xong
document.addEventListener("DOMContentLoaded", () => {
    updateAuthUi();
    loadBooks();
    setDefaultDueDate();
});

// Thiet lap ngay hen tra mac dinh sau 14 ngay
function setDefaultDueDate() {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const dueDateInput = document.getElementById("borrowDueDate");
    if (dueDateInput) dueDateInput.value = today.toISOString().split("T")[0];
}

// Chuyen doi Tab giua Danh muc sach, Sach yeu thich va Phieu muon ca nhan
function switchMainTab(tabName) {
    homeState.activeMainTab = tabName;
    document.getElementById("tabCatalogBtn").classList.toggle("active", tabName === "catalog");
    const favBtn = document.getElementById("tabFavoritesBtn");
    if (favBtn) favBtn.classList.toggle("active", tabName === "favorites");
    document.getElementById("tabMyBorrowsBtn").classList.toggle("active", tabName === "myBorrows");

    document.getElementById("tabCatalogSection").classList.toggle("hidden", tabName !== "catalog");
    const favSec = document.getElementById("tabFavoritesSection");
    if (favSec) favSec.classList.toggle("hidden", tabName !== "favorites");
    document.getElementById("tabMyBorrowsSection").classList.toggle("hidden", tabName !== "myBorrows");

    if (tabName === "catalog") loadBooks();
    else if (tabName === "favorites" && typeof loadFavorites === "function") loadFavorites();
    else if (tabName === "myBorrows") loadMyBorrowRecords();
}

// Chuyen doi giua Tab Dang nhap va Tab Dang ky trong modal
function switchAuthTab(type) {
    const isLogin = type === "login";
    document.getElementById("tabAuthLoginBtn").classList.toggle("active", isLogin);
    document.getElementById("tabAuthRegisterBtn").classList.toggle("active", !isLogin);
    document.getElementById("loginForm").classList.toggle("hidden", !isLogin);
    document.getElementById("registerForm").classList.toggle("hidden", isLogin);
}

// Mo va dong cac hop thoai
function openAuthModal() { document.getElementById("authModal").classList.remove("hidden"); switchAuthTab("login"); }
function closeAuthModal() { document.getElementById("authModal").classList.add("hidden"); }
function openChangePasswordModal() { document.getElementById("changePasswordModal").classList.remove("hidden"); }
function closeChangePasswordModal() { document.getElementById("changePasswordModal").classList.add("hidden"); }

// Mo va dong hop thoai muon sach
function openBorrowModal(bookId, bookTitle) {
    if (!homeState.token) {
        showAlert("Vui lòng đăng nhập để thực hiện mượn sách", true);
        openAuthModal();
        return;
    }
    document.getElementById("borrowBookId").value = bookId;
    document.getElementById("borrowBookTitle").value = bookTitle;
    setDefaultDueDate();
    document.getElementById("borrowModal").classList.remove("hidden");
}

function closeBorrowModal() { document.getElementById("borrowModal").classList.add("hidden"); document.getElementById("borrowForm").reset(); }

// Cap nhat thanh trang thai xac thuc tren dau trang
function updateAuthUi() {
    const statusElem = document.getElementById("userStatus");
    const openAuthBtn = document.getElementById("btnOpenAuth");
    const logoutBtn = document.getElementById("btnLogout");
    const changePassBtn = document.getElementById("btnChangePasswordModal");
    const adminPortalBtn = document.getElementById("btnAdminPortal");
    const tabFavoritesBtn = document.getElementById("tabFavoritesBtn");
    const tabMyBorrowsBtn = document.getElementById("tabMyBorrowsBtn");
    const isLogged = Boolean(homeState.token && homeState.username);
    const isAdmin = homeState.role === "Admin";

    openAuthBtn.classList.toggle("hidden", isLogged);
    logoutBtn.classList.toggle("hidden", !isLogged);
    changePassBtn.classList.toggle("hidden", !isLogged);
    adminPortalBtn.classList.toggle("hidden", !(isLogged && isAdmin));
    if (tabFavoritesBtn) tabFavoritesBtn.classList.toggle("hidden", !(isLogged && !isAdmin));
    tabMyBorrowsBtn.classList.toggle("hidden", !(isLogged && !isAdmin));

    if (isLogged) {
        statusElem.textContent = `${homeState.username} - ${isAdmin ? "Quản trị viên" : "Độc giả"}`;
        statusElem.className = `badge ${isAdmin ? "badge-admin" : "badge-user"}`;
    } else {
        statusElem.textContent = "Chưa đăng nhập";
        statusElem.className = "badge badge-guest";
        if (homeState.activeMainTab === "myBorrows" || homeState.activeMainTab === "favorites") switchMainTab("catalog");
    }
}

// Hien thi thong bao thoi gian thuc tren giao dien
function showAlert(message, isError = false) {
    const box = document.getElementById("notification");
    box.textContent = message;
    box.className = `alert ${isError ? "alert-error" : "alert-success"}`;
    box.classList.remove("hidden");
    setTimeout(() => {
        box.classList.add("hidden");
    }, 4500);
}

// Xu ly dang nhap tai khoan va phan luong dieu huong
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            homeState.token = data.token;
            homeState.role = data.role;
            homeState.username = data.username;

            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_name", data.username);

            closeAuthModal();

            // Neu la tai khoan quan tri thi tu dong chuyen toi trang quan tri
            if (data.role === "Admin") {
                showAlert("Đăng nhập quyền Quản trị thành công. Đang chuyển tới trang Quản trị...");
                setTimeout(() => {
                    window.location.href = "admin/index.html";
                }, 600);
                return;
            }

            // Neu la doc gia thi giu o Trang chu va cap nhat trang thai
            updateAuthUi();
            showAlert(`Đăng nhập thành công với tài khoản ${data.username}`);
            if (homeState.activeMainTab === "myBorrows") {
                loadMyBorrowRecords();
            }
        } else {
            console.error("Loi dang nhap:", data);
            showAlert(data.message || "Tên đăng nhập hoặc mật khẩu không chính xác", true);
        }
    } catch (err) {
        console.error("Loi ket noi dang nhap:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}

// Xu ly dang ky tai khoan moi
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const fullName = document.getElementById("regFullName").value.trim();
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, fullName, password })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert("Đăng ký tài khoản thành công. Vui lòng tiến hành đăng nhập");
            document.getElementById("registerForm").reset();
            switchAuthTab("login");
            document.getElementById("loginUsername").value = username;
            document.getElementById("loginPassword").value = password;
        } else {
            console.error("Loi dang ky:", data);
            const errorMsg = data.message || data.Message || (data.errors ? Object.values(data.errors).flat().join(", ") : "Đăng ký không thành công");
            showAlert(errorMsg, true);
        }
    } catch (err) {
        console.error("Loi ket noi dang ky:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}

// Xu ly doi mat khau ca nhan
async function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            showAlert("Đổi mật khẩu thành công");
            document.getElementById("changePasswordForm").reset();
            closeChangePasswordModal();
        } else {
            console.error("Loi doi mat khau:", data);
            showAlert(data.message || "Đổi mật khẩu thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi doi mat khau:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}

// Xu ly dang xuat khoi phien lam viec
function handleLogout() {
    homeState.token = homeState.role = homeState.username = "";
    ["jwt_token", "user_role", "user_name"].forEach(k => localStorage.removeItem(k));
    updateAuthUi();
    showAlert("Đã đăng xuất");

    const myBorrowsTable = document.getElementById("myBorrowsTableBody");
    if (myBorrowsTable) {
        myBorrowsTable.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Vui lòng đăng nhập để xem danh sách phiếu mượn</td></tr>`;
    }
}

// Tai danh sach sach phuc vu tra cuu cong khai (khong can dang nhap)
async function loadBooks() {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const sort = document.getElementById("sortOrder").value;

    let url = `${API_BASE_URL}/api/books?$top=50`;
    if (keyword) url += `&$filter=contains(tolower(Title), '${keyword.toLowerCase()}')`;
    if (sort) url += `&$orderby=${encodeURIComponent(sort)}`;

    try {
        const response = await fetch(url, {
            headers: { "Accept": "application/json" }
        });
        const data = await response.json();

        if (response.ok) {
            const books = Array.isArray(data) ? data : (data.value || []);
            renderBooksTable(books);
        } else {
            console.error("Loi tai danh sach sach:", data);
            showAlert("Không thể tải danh sách sách", true);
        }
    } catch (err) {
        console.error("Loi ket noi tai sach:", err);
        showAlert("Không thể kết nối đến máy chủ để tải sách", true);
    }
}

// Lay anh bia sach tu thuoc tinh CSDL hoac duong dan cuc bo
function getBookCover(book) {
    if (book.imageUrl) return book.imageUrl;
    if (book.id && book.id <= 15) return `images/books/book-${book.id}.svg`;
    return "images/books/book-default.svg";
}

// Do du lieu danh sach sach vao bang hien thi
function renderBooksTable(books) {
    const tbody = document.getElementById("booksTableBody");
    if (!books || books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Không tìm thấy sách phù hợp</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map(b => {
        const safeTitle = escapeHtml(b.title);
        const isAvailable = Number(b.quantity || 0) > 0;
        const coverUrl = getBookCover(b);
        return `
            <tr class="book-row-clickable" onclick="showBookDetail(${b.id})">
                <td style="width: 70px; text-align: center;">
                    <img src="${coverUrl}" alt="${safeTitle}" class="book-thumb" loading="lazy" onerror="this.onerror=null;this.src='images/books/book-default.svg';">
                </td>
                <td><strong class="book-title-clickable">${safeTitle}</strong></td>
                <td><code>${escapeHtml(b.isbn || "-")}</code></td>
                <td>${escapeHtml(b.categoryName || "-")}</td>
                <td>${escapeHtml(b.authorName || "-")}</td>
                <td style="white-space: nowrap;">${Number(b.price || 0).toLocaleString("vi-VN")} đ</td>
                <td style="white-space: nowrap;">
                    <span class="badge ${isAvailable ? "badge-returned" : "badge-overdue"}">
                        ${isAvailable ? `Còn ${b.quantity} cuốn` : "Hết sách"}
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openBorrowModal(${b.id}, '${safeTitle.replace(/'/g, "\\'")}')" ${!isAvailable ? "disabled" : ""}>
                        Mượn sách
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Hien thi hop thoai chi tiet thong tin sach
async function showBookDetail(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            showAlert("Không thể tải thông tin chi tiết sách", true);
            return;
        }
        const b = await response.json();
        const safeTitle = escapeHtml(b.title);
        const isAvailable = Number(b.quantity || 0) > 0;

        const coverElem = document.getElementById("detailBookCover");
        coverElem.src = getBookCover(b);
        coverElem.alt = safeTitle;
        coverElem.onerror = () => { coverElem.onerror = null; coverElem.src = "images/books/book-default.svg"; };
        document.getElementById("detailBookTitle").textContent = b.title || "-";
        document.getElementById("detailBookAuthor").textContent = b.authorName || "-";
        document.getElementById("detailBookCategory").textContent = b.categoryName || "-";
        document.getElementById("detailBookIsbn").textContent = b.isbn || "-";
        document.getElementById("detailBookPrice").textContent = `${Number(b.price || 0).toLocaleString("vi-VN")} đ`;
        document.getElementById("detailBookPublished").textContent = formatDate(b.publishedDate);
        document.getElementById("detailBookDesc").textContent = b.description || "Chưa có mô tả chi tiết cho cuốn sách này.";
        document.getElementById("detailBookQuantity").innerHTML = `<span class="badge ${isAvailable ? "badge-returned" : "badge-overdue"}">${isAvailable ? `Còn ${b.quantity} cuốn` : "Hết sách"}</span>`;

        const borrowBtn = document.getElementById("detailBorrowBtn");
        borrowBtn.disabled = !isAvailable;
        borrowBtn.textContent = isAvailable ? "Mượn sách này" : "Hết sách";
        borrowBtn.onclick = isAvailable ? () => { closeBookDetailModal(); openBorrowModal(b.id, b.title); } : null;

        document.getElementById("bookDetailModal").classList.remove("hidden");
        if (typeof loadBookReviews === "function") loadBookReviews(b.id);
        if (typeof checkDetailFavorite === "function") checkDetailFavorite(b.id);
    } catch (err) {
        console.error("Loi hien thi chi tiet sach:", err);
        showAlert("Lỗi khi tải chi tiết sách", true);
    }
}

// Dong hop thoai chi tiet sach
function closeBookDetailModal() {
    const modal = document.getElementById("bookDetailModal");
    if (modal) modal.classList.add("hidden");
}

// Dong hop thoai khi nguoi dung bam vung ngoai hop thoai
function handleDetailOverlayClick(event) {
    if (event.target && event.target.id === "bookDetailModal") closeBookDetailModal();
}

// Dat lai bo loc tim kiem ve trang thai ban dau
function resetFilters() {
    document.getElementById("searchKeyword").value = "";
    document.getElementById("sortOrder").value = "";
    loadBooks();
}

// Xu ly dang ky muon sach
async function handleBorrowBook(event) {
    event.preventDefault();
    if (!homeState.token) {
        showAlert("Vui lòng đăng nhập để đăng ký mượn sách", true);
        closeBorrowModal();
        openAuthModal();
        return;
    }

    const bookId = parseInt(document.getElementById("borrowBookId").value, 10);
    const dueDate = document.getElementById("borrowDueDate").value;
    const notes = document.getElementById("borrowNotes").value.trim();
    if (!bookId) {
        showAlert("Thông tin sách mượn không hợp lệ", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/borrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            },
            body: JSON.stringify({ bookId, dueDate, notes: notes || null })
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            showAlert("Đăng ký mượn sách thành công");
            closeBorrowModal();
            loadBooks();
            if (homeState.activeMainTab === "myBorrows") loadMyBorrowRecords();
        } else {
            console.error("Loi muon sach:", data);
            showAlert(data.message || data.Message || "Đăng ký mượn sách không thành công", true);
        }
    } catch (err) {
        console.error("Loi ket noi muon sach:", err);
        showAlert("Không thể kết nối đến máy chủ khi đăng ký mượn", true);
    }
}

// Tai danh sach phieu muon cua ca nhan doc gia
async function loadMyBorrowRecords() {
    if (!homeState.token) {
        const tbody = document.getElementById("myBorrowsTableBody");
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Vui lòng đăng nhập để xem danh sách phiếu mượn</td></tr>`;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/my-history`, {
            headers: { "Authorization": `Bearer ${homeState.token}` }
        });

        const data = await response.json().catch(() => []);
        if (response.ok) {
            renderMyBorrowsTable(Array.isArray(data) ? data : []);
        } else {
            console.error("Loi tai phieu muon ca nhan:", data);
            showAlert(data.message || data.Message || "Không thể tải danh sách phiếu mượn", true);
        }
    } catch (err) {
        console.error("Loi ket noi tai phieu muon:", err);
        showAlert("Không thể kết nối đến máy chủ khi tải phiếu mượn", true);
    }
}

// Hien thi bang phieu muon ca nhan
function renderMyBorrowsTable(records) {
    const tbody = document.getElementById("myBorrowsTableBody");
    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Bạn chưa có phiếu mượn sách nào</td></tr>`;
        return;
    }

    tbody.innerHTML = records.map(r => {
        let badgeClass = "badge-guest";
        let statusText = r.status;
        if (r.status === "Active" || r.status === "Borrowing") {
            badgeClass = "badge-active";
            statusText = "Đang mượn";
        } else if (r.status === "Returned") {
            badgeClass = "badge-returned";
            statusText = "Đã trả";
        } else if (r.status === "Overdue") {
            badgeClass = "badge-overdue";
            statusText = "Quá hạn";
        }

        const isReturnable = r.status === "Active" || r.status === "Borrowing" || r.status === "Overdue";
        const canRenew = (r.status === "Active" || r.status === "Borrowing") && Number(r.renewalCount || 0) < 2;

        return `
            <tr>
                <td>#${r.id}</td>
                <td><strong>${escapeHtml(r.bookTitle || "Sách không xác định")}</strong></td>
                <td>${formatDate(r.borrowDate)}</td>
                <td>${formatDate(r.dueDate)}</td>
                <td>${r.returnDate ? formatDate(r.returnDate) : "Chưa trả"}</td>
                <td>
                    <span class="badge ${badgeClass}">${statusText}</span>
                    ${Number(r.renewalCount || 0) > 0 ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Gia hạn: ${r.renewalCount}/2 lần</div>` : ""}
                </td>
                <td>${Number(r.fineAmount || 0).toLocaleString("vi-VN")} đ</td>
                <td style="white-space: nowrap;">
                    ${canRenew ? `<button type="button" class="btn btn-primary btn-sm" style="margin-right: 4px;" onclick="handleRenewBook(${r.id})">Gia hạn</button>` : ""}
                    ${isReturnable ? `<button type="button" class="btn btn-secondary btn-sm" onclick="handleReturnBook(${r.id})">Trả sách</button>` : "-"}
                </td>
            </tr>
        `;
    }).join("");
}

// Xu ly gia han phieu muon them 7 ngay
async function handleRenewBook(recordId) {
    if (!confirm(`Xác nhận gia hạn phiếu mượn mã #${recordId} thêm 7 ngày?`)) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/${recordId}/renew`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${homeState.token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            showAlert(data.message || "Gia hạn phiếu mượn thành công");
            loadMyBorrowRecords();
        } else {
            console.error("Loi gia han:", data);
            showAlert(data.message || data.Message || "Gia hạn phiếu mượn không thành công", true);
        }
    } catch (err) {
        console.error("Loi ket noi gia han:", err);
        showAlert("Lỗi kết nối khi gửi yêu cầu gia hạn", true);
    }
}

// Xu ly tra sach truc tiep tu phia nguoi dung
async function handleReturnBook(recordId) {
    if (!confirm(`Xác nhận trả sách cho phiếu mượn mã #${recordId}?`)) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/${recordId}/return`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${homeState.token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            showAlert(`Đã hoàn tất trả sách cho phiếu #${recordId}`);
            loadMyBorrowRecords();
            loadBooks();
        } else {
            console.error("Loi tra sach:", data);
            showAlert(data.message || data.Message || "Xử lý trả sách thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi tra sach:", err);
        showAlert("Lỗi kết nối khi gửi yêu cầu trả sách", true);
    }
}

// Dinh dang chuoi ngay thang hien thi
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("vi-VN");
}

// Ma hoa chuoi ky tu phong tranh tan cong XSS
function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

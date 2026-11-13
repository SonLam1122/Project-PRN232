// Cau hinh dia chi may chu Web API
const API_BASE_URL = "http://localhost:5135";

// Trang thai nguoi dung va giao dien hien tai
const userState = {
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
    if (dueDateInput) {
        dueDateInput.value = today.toISOString().split("T")[0];
    }
}

// Chuyen doi Tab giua Danh muc va Phieu muon
function switchMainTab(tabName) {
    userState.activeMainTab = tabName;
    const catalogBtn = document.getElementById("tabCatalogBtn");
    const myBorrowsBtn = document.getElementById("tabMyBorrowsBtn");
    const catalogSec = document.getElementById("tabCatalogSection");
    const myBorrowsSec = document.getElementById("tabMyBorrowsSection");

    catalogBtn.classList.remove("active");
    myBorrowsBtn.classList.remove("active");
    catalogSec.classList.add("hidden");
    myBorrowsSec.classList.add("hidden");

    if (tabName === "catalog") {
        catalogBtn.classList.add("active");
        catalogSec.classList.remove("hidden");
        loadBooks();
    } else if (tabName === "myBorrows") {
        myBorrowsBtn.classList.add("active");
        myBorrowsSec.classList.remove("hidden");
        loadMyBorrowRecords();
    }
}

// Chuyen doi Tab giua Dang nhap va Dang ky
function switchAuthTab(type) {
    const loginBtn = document.getElementById("tabAuthLoginBtn");
    const regBtn = document.getElementById("tabAuthRegisterBtn");
    const loginForm = document.getElementById("loginForm");
    const regForm = document.getElementById("registerForm");

    if (type === "login") {
        loginBtn.classList.add("active");
        regBtn.classList.remove("active");
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
    } else {
        regBtn.classList.add("active");
        loginBtn.classList.remove("active");
        regForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    }
}

// Cap nhat thanh trang thai dang nhap
function updateAuthUi() {
    const statusElem = document.getElementById("userStatus");
    const logoutBtn = document.getElementById("btnLogout");
    const changePassBtn = document.getElementById("btnChangePasswordModal");
    const authCard = document.getElementById("authCard");

    if (userState.token && userState.username) {
        statusElem.textContent = `${userState.username} - ${userState.role}`;
        statusElem.className = "badge badge-user";
        logoutBtn.classList.remove("hidden");
        changePassBtn.classList.remove("hidden");
        if (authCard) {
            authCard.classList.add("hidden");
        }
    } else {
        statusElem.textContent = "Chưa đăng nhập";
        statusElem.className = "badge badge-guest";
        logoutBtn.classList.add("hidden");
        changePassBtn.classList.add("hidden");
        if (authCard) {
            authCard.classList.remove("hidden");
        }
    }
}

// Dong mo hop thoai doi mat khau
function toggleChangePasswordCard() {
    const card = document.getElementById("changePasswordCard");
    card.classList.toggle("hidden");
}

// Dien thong tin tai khoan mau de dang nhap nhanh
function fillAccount(username, password) {
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = password;
}

// Hien thi thong bao tren man hinh
function showAlert(message, isError = false) {
    const box = document.getElementById("notification");
    box.textContent = message;
    box.className = `alert ${isError ? "alert-error" : "alert-success"}`;
    box.classList.remove("hidden");
    setTimeout(() => {
        box.classList.add("hidden");
    }, 4500);
}

// Xu ly dang nhap tai khoan
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
            userState.token = data.token;
            userState.role = data.role;
            userState.username = data.username;

            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_name", data.username);

            updateAuthUi();
            showAlert(`Đăng nhập thành công với tài khoản ${data.username}`);
            if (userState.activeMainTab === "myBorrows") {
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
            showAlert("Đăng ký tài khoản thành công. Vui lòng đăng nhập.");
            switchAuthTab("login");
            fillAccount(username, password);
        } else {
            console.error("Loi dang ky:", data);
            showAlert(data.message || "Đăng ký không thành công. Kiểm tra lại thông tin.", true);
        }
    } catch (err) {
        console.error("Loi ket noi dang ky:", err);
        showAlert("Lỗi kết nối khi đăng ký tài khoản", true);
    }
}

// Xu ly doi mat khau
async function handleChangePassword(event) {
    event.preventDefault();
    if (!userState.token) {
        showAlert("Vui lòng đăng nhập để đổi mật khẩu", true);
        return;
    }

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userState.token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert("Đổi mật khẩu thành công");
            document.getElementById("changePasswordForm").reset();
            toggleChangePasswordCard();
        } else {
            console.error("Loi doi mat khau:", data);
            showAlert(data.message || "Đổi mật khẩu không thành công", true);
        }
    } catch (err) {
        console.error("Loi ket noi doi mat khau:", err);
        showAlert("Lỗi kết nối đến máy chủ", true);
    }
}

// Xu ly dang xuat
function handleLogout() {
    userState.token = "";
    userState.role = "";
    userState.username = "";
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    updateAuthUi();
    showAlert("Đã đăng xuất tài khoản");
    if (userState.activeMainTab === "myBorrows") {
        document.getElementById("myBorrowsTableBody").innerHTML = `
            <tr><td colspan="8" style="text-align: center; color: #64748b;">Vui lòng đăng nhập để xem danh sách phiếu mượn</td></tr>
        `;
    }
}

// Tai danh sach sach de tra cuu va thue
async function loadBooks() {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const sort = document.getElementById("sortOrder").value;

    let url = `${API_BASE_URL}/api/books?$top=50`;
    if (keyword) {
        url += `&$filter=contains(tolower(Title), '${keyword.toLowerCase()}')`;
    }
    if (sort) {
        url += `&$orderby=${encodeURIComponent(sort)}`;
    }

    try {
        const response = await fetch(url, {
            headers: { "Accept": "application/json" }
        });
        const books = await response.json();
        renderBooksTable(books);
        populateBorrowSelect(books);
    } catch (err) {
        console.error("Loi tai danh sach sach:", err);
        showAlert("Không thể tải danh mục sách", true);
    }
}

// Dat lai bo loc tim kiem
function resetFilters() {
    document.getElementById("searchKeyword").value = "";
    document.getElementById("sortOrder").value = "";
    loadBooks();
}

// Do du lieu vao bang sach
function renderBooksTable(books) {
    const tbody = document.getElementById("booksTableBody");
    if (!books || books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b;">Không tìm thấy sách nào</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map(b => `
        <tr>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.isbn)}</td>
            <td>${escapeHtml(b.categoryName || "Chưa phân loại")}</td>
            <td>${escapeHtml(b.authorName || "Khuyết danh")}</td>
            <td>${Number(b.price).toLocaleString("vi-VN")} đ</td>
            <td>${b.quantity > 0 ? b.quantity : '<span style="color:#ef4444;font-weight:600;">Hết sách</span>'}</td>
            <td>
                <button type="button" class="btn btn-primary btn-sm" onclick="selectBookForBorrow(${b.id})" ${b.quantity === 0 ? "disabled" : ""}>
                    Chọn mượn
                </button>
            </td>
        </tr>
    `).join("");
}

// Do danh sach sach vao the select mượn sách
function populateBorrowSelect(books) {
    const select = document.getElementById("borrowBookSelect");
    select.innerHTML = '<option value="">Chọn sách</option>';
    books.forEach(b => {
        if (b.quantity > 0) {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.textContent = `${b.title} - Còn: ${b.quantity}`;
            select.appendChild(opt);
        }
    });
}

// Chon nhanh mot dau sach tu bang de muon
function selectBookForBorrow(bookId) {
    const select = document.getElementById("borrowBookSelect");
    select.value = bookId;
    select.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Xu ly dang ky muon sach
async function handleBorrowBook(event) {
    event.preventDefault();
    if (!userState.token) {
        showAlert("Vui lòng đăng nhập trước khi thực hiện mượn sách", true);
        return;
    }

    const bookId = parseInt(document.getElementById("borrowBookSelect").value, 10);
    const dueDate = document.getElementById("borrowDueDate").value;
    const notes = document.getElementById("borrowNotes").value.trim();

    if (!bookId || !dueDate) {
        showAlert("Vui lòng chọn sách và chọn hạn hẹn trả", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/borrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userState.token}`
            },
            body: JSON.stringify({ bookId, dueDate, notes })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert("Đăng ký mượn sách thành công");
            document.getElementById("borrowNotes").value = "";
            loadBooks();
            if (userState.activeMainTab === "myBorrows") {
                loadMyBorrowRecords();
            }
        } else {
            console.error("Loi dang ky muon sach:", data);
            showAlert(data.message || "Không thể tạo phiếu mượn sách", true);
        }
    } catch (err) {
        console.error("Loi ket noi muon sach:", err);
        showAlert("Lỗi kết nối khi gửi yêu cầu mượn sách", true);
    }
}

// Tai danh sach phieu muon cua ca nhan nguoi dung
async function loadMyBorrowRecords() {
    if (!userState.token) {
        document.getElementById("myBorrowsTableBody").innerHTML = `
            <tr><td colspan="8" style="text-align: center; color: #64748b;">Vui lòng đăng nhập để xem danh sách phiếu mượn</td></tr>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/my-history`, {
            headers: { "Authorization": `Bearer ${userState.token}` }
        });

        if (!response.ok) {
            throw new Error("Không thể tải lịch sử mượn");
        }

        const records = await response.json();
        renderMyBorrowsTable(records);
    } catch (err) {
        console.error("Loi tai lich su muon:", err);
        showAlert("Không thể tải danh sách phiếu mượn cá nhân", true);
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
        if (r.status === "Active") {
            badgeClass = "badge-active";
            statusText = "Đang mượn";
        } else if (r.status === "Returned") {
            badgeClass = "badge-returned";
            statusText = "Đã trả";
        } else if (r.status === "Overdue") {
            badgeClass = "badge-overdue";
            statusText = "Quá hạn";
        }

        const isReturnable = r.status === "Active" || r.status === "Overdue";

        return `
            <tr>
                <td>#${r.id}</td>
                <td><strong>${escapeHtml(r.bookTitle || "Sách không xác định")}</strong></td>
                <td>${formatDate(r.borrowDate)}</td>
                <td>${formatDate(r.dueDate)}</td>
                <td>${r.returnDate ? formatDate(r.returnDate) : "Chưa trả"}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>${Number(r.fineAmount || 0).toLocaleString("vi-VN")} đ</td>
                <td>
                    ${isReturnable ? `<button type="button" class="btn btn-secondary btn-sm" onclick="handleReturnBook(${r.id})">Trả sách</button>` : "-"}
                </td>
            </tr>
        `;
    }).join("");
}

// Xu ly tra sach tu phia nguoi dung
async function handleReturnBook(recordId) {
    if (!confirm(`Xác nhận trả sách cho phiếu mượn mã #${recordId}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/${recordId}/return`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${userState.token}` }
        });

        const data = await response.json();
        if (response.ok) {
            showAlert(`Đã hoàn tất trả sách cho phiếu #${recordId}`);
            loadMyBorrowRecords();
            loadBooks();
        } else {
            console.error("Loi tra sach:", data);
            showAlert(data.message || "Xử lý trả sách thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi tra sach:", err);
        showAlert("Lỗi kết nối khi gửi yêu cầu trả sách", true);
    }
}

// Dinh dang chuoi ngay thang de hien thi
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("vi-VN");
}

// Ma hoa chuoi ky tu HTML phong tranh loi XSS
function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


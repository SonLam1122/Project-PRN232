// Cau hinh dia chi may chu Web API
const API_BASE_URL = "http://localhost:5135";

// Trang thai quan tri vien va giao dien hien tai
const adminState = {
    token: localStorage.getItem("jwt_token") || "",
    role: localStorage.getItem("user_role") || "",
    username: localStorage.getItem("user_name") || "",
    activeTab: "books"
};

// Khoi chay khi trang tai xong
document.addEventListener("DOMContentLoaded", () => {
    updateAuthUi();
    if (adminState.token && adminState.role === "Admin") {
        initAdminData();
    }
});

// Khoi tao cac danh muc can thiet cho quan tri
function initAdminData() {
    loadCategories();
    loadAuthors();
    loadBooks();
    loadCategoriesList();
    loadAuthorsList();
}

// Chuyen doi Tab chuc nang quan tri
function switchTab(tabName) {
    adminState.activeTab = tabName;
    const tabButtons = ["tabBooksBtn", "tabBorrowsBtn", "tabMetaBtn", "tabStatsBtn", "tabUsersBtn"];
    const tabSections = ["tabBooksSection", "tabBorrowsSection", "tabMetaSection", "tabStatsSection", "tabUsersSection"];

    tabButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.remove("active");
    });

    tabSections.forEach(secId => {
        const sec = document.getElementById(secId);
        if (sec) sec.classList.add("hidden");
    });

    if (tabName === "books") {
        document.getElementById("tabBooksBtn").classList.add("active");
        document.getElementById("tabBooksSection").classList.remove("hidden");
        loadBooks();
    } else if (tabName === "borrows") {
        document.getElementById("tabBorrowsBtn").classList.add("active");
        document.getElementById("tabBorrowsSection").classList.remove("hidden");
        loadBorrowRecords();
    } else if (tabName === "meta") {
        document.getElementById("tabMetaBtn").classList.add("active");
        document.getElementById("tabMetaSection").classList.remove("hidden");
        loadCategoriesList();
        loadAuthorsList();
    } else if (tabName === "stats") {
        document.getElementById("tabStatsBtn").classList.add("active");
        document.getElementById("tabStatsSection").classList.remove("hidden");
        loadStatistics();
    } else if (tabName === "users") {
        document.getElementById("tabUsersBtn").classList.add("active");
        document.getElementById("tabUsersSection").classList.remove("hidden");
        loadUsers();
    }
}

// Cap nhat thanh trang thai dang nhap
function updateAuthUi() {
    const statusElem = document.getElementById("userStatus");
    const logoutBtn = document.getElementById("btnLogout");
    const changePassBtn = document.getElementById("btnChangePasswordModal");
    const loginCard = document.getElementById("loginCard");
    const mainSection = document.getElementById("mainAdminSection");

    if (adminState.token && adminState.role === "Admin") {
        statusElem.textContent = `${adminState.username} - Quản trị viên`;
        statusElem.className = "badge badge-admin";
        logoutBtn.classList.remove("hidden");
        changePassBtn.classList.remove("hidden");
        loginCard.classList.add("hidden");
        mainSection.classList.remove("hidden");
    } else {
        statusElem.textContent = "Chưa đăng nhập quản trị";
        statusElem.className = "badge badge-guest";
        logoutBtn.classList.add("hidden");
        changePassBtn.classList.add("hidden");
        loginCard.classList.remove("hidden");
        mainSection.classList.add("hidden");
    }
}

// Dong mo hop thoai doi mat khau
function toggleChangePasswordCard() {
    const card = document.getElementById("changePasswordCard");
    card.classList.toggle("hidden");
}

// Dien thong tin tai khoan mau admin
function fillAdminAccount() {
    document.getElementById("loginUsername").value = "admin";
    document.getElementById("loginPassword").value = "Admin@123456";
}

// Hien thi thong bao he thong
function showAlert(message, isError = false) {
    const box = document.getElementById("notification");
    box.textContent = message;
    box.className = `alert ${isError ? "alert-error" : "alert-success"}`;
    box.classList.remove("hidden");
    setTimeout(() => {
        box.classList.add("hidden");
    }, 4500);
}

// Dang nhap tai khoan quan tri
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
            if (data.role !== "Admin") {
                showAlert("Tài khoản không có quyền quản trị viên thư viện", true);
                return;
            }

            adminState.token = data.token;
            adminState.role = data.role;
            adminState.username = data.username;

            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_name", data.username);

            updateAuthUi();
            initAdminData();
            showAlert(`Chào mừng quản trị viên ${data.username}`);
        } else {
            console.error("Loi dang nhap:", data);
            showAlert(data.message || "Tên đăng nhập hoặc mật khẩu không đúng", true);
        }
    } catch (err) {
        console.error("Loi ket noi dang nhap:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}

// Doi mat khau quan tri
async function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminState.token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert("Đổi mật khẩu quản trị thành công");
            document.getElementById("changePasswordForm").reset();
            toggleChangePasswordCard();
        } else {
            console.error("Loi doi mat khau:", data);
            showAlert(data.message || "Đổi mật khẩu thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi doi mat khau:", err);
        showAlert("Lỗi kết nối đến máy chủ", true);
    }
}

// Dang xuat
function handleLogout() {
    adminState.token = "";
    adminState.role = "";
    adminState.username = "";
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    updateAuthUi();
    showAlert("Đã đăng xuất phiên làm việc quản trị");
}

// Header xac thuc kem JWT token
function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminState.token}`
    };
}

// Tai bao cao thong ke
async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/statistics/summary`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error("Không thể tải thống kê");
        const s = await res.json();
        const container = document.getElementById("statsContainer");
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${s.totalBooks || 0}</div>
                    <div class="stat-label">Tổng đầu sách</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${s.totalCopies || 0}</div>
                    <div class="stat-label">Tổng sách trong kho</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${s.activeBorrowRecords || 0}</div>
                    <div class="stat-label">Phiếu đang mượn</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #ef4444;">${s.overdueBorrowRecords || 0}</div>
                    <div class="stat-label">Phiếu quá hạn</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #16a34a;">${Number(s.totalFinesCollected || 0).toLocaleString("vi-VN")} đ</div>
                    <div class="stat-label">Tổng tiền phạt thu được</div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Loi tai thong ke:", err);
        showAlert("Không thể tải báo cáo thống kê", true);
    }
}

// Tai danh sach nguoi dung
async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users?$top=50`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error("Không thể tải người dùng");
        const users = await res.json();
        const tbody = document.getElementById("usersTableBody");
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.fullName || "-")}</td>
                <td><span class="badge ${u.role === "Admin" ? "badge-admin" : "badge-user"}">${u.role}</span></td>
                <td>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="changeRole(${u.id}, '${u.role === "Admin" ? "User" : "Admin"}')">
                        Đổi sang ${u.role === "Admin" ? "User" : "Admin"}
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Loi tai danh sach nguoi dung:", err);
        showAlert("Không thể tải danh sách tài khoản", true);
    }
}

// Thay doi vai tro nguoi dung
async function changeRole(userId, newRole) {
    if (!confirm(`Xác nhận đổi quyền tài khoản #${userId} thành ${newRole}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ newRole })
        });

        if (res.ok) {
            showAlert(`Đã cập nhật vai trò người dùng thành ${newRole}`);
            loadUsers();
        } else {
            const data = await res.json();
            showAlert(data.message || "Cập nhật vai trò thất bại", true);
        }
    } catch (err) {
        console.error("Loi cap nhat vai tro:", err);
        showAlert("Lỗi kết nối khi cập nhật vai trò", true);
    }
}

// Dinh dang ngay thang
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("vi-VN");
}

// Ma hoa ky tu HTML de phong tranh loi XSS
function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


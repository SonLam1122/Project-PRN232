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
    // Neu chua dang nhap hoac khong phai quan tri vien thi dieu huong ve trang chinh
    if (!adminState.token || adminState.role !== "Admin") {
        window.location.replace("../index.html");
        return;
    }
    updateAuthUi();
    initAdminData();
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

    statusElem.textContent = `${adminState.username} - Quản trị viên`;
    statusElem.className = "badge badge-admin";
    logoutBtn.classList.remove("hidden");
    changePassBtn.classList.remove("hidden");
}

// Dong mo hop thoai doi mat khau
function toggleChangePasswordCard() {
    const card = document.getElementById("changePasswordCard");
    card.classList.toggle("hidden");
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

// Dang xuat va tra ve trang chu
function handleLogout() {
    adminState.token = "";
    adminState.role = "";
    adminState.username = "";
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    window.location.replace("../index.html");
}

// Header xac thuc kem JWT token
function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminState.token}`
    };
}

// Tai bao cao thong ke tong quan va chuyen sau
async function loadStatistics() {
    try {
        const [sumRes, topRes, catRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/statistics/summary`, { headers: getAuthHeaders() }),
            fetch(`${API_BASE_URL}/api/statistics/top-books`, { headers: getAuthHeaders() }),
            fetch(`${API_BASE_URL}/api/statistics/category-distribution`, { headers: getAuthHeaders() })
        ]);

        if (!sumRes.ok) throw new Error("Không thể tải thống kê");
        const s = await sumRes.json();
        const topBooks = topRes.ok ? await topRes.json() : [];
        const catStats = catRes.ok ? await catRes.json() : [];

        const container = document.getElementById("statsContainer");
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${s.totalBooks || 0}</div>
                    <div class="stat-label">Tổng đầu sách</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${s.totalCopiesInStock || s.totalCopies || 0}</div>
                    <div class="stat-label">Tổng sách trong kho</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${s.activeBorrowingCount || s.activeBorrowRecords || 0}</div>
                    <div class="stat-label">Phiếu đang mượn</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #ef4444;">${s.overdueCount || s.overdueBorrowRecords || 0}</div>
                    <div class="stat-label">Phiếu quá hạn</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #16a34a;">${Number(s.totalFinesCollected || 0).toLocaleString("vi-VN")} đ</div>
                    <div class="stat-label">Tổng tiền phạt thu được</div>
                </div>
            </div>

            <div class="two-col-grid" style="margin-top: 24px;">
                <!-- Top 5 sach muon nhieu nhat -->
                <div class="card" style="margin-bottom: 0;">
                    <div class="card-title">Top 5 sách được mượn nhiều nhất</div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tiêu đề sách</th>
                                    <th>Giá thuê</th>
                                    <th style="text-align: right;">Số lượt mượn</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topBooks.length === 0 ? `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu</td></tr>` : topBooks.map(b => `
                                    <tr>
                                        <td><strong>${escapeHtml(b.title)}</strong></td>
                                        <td>${Number(b.price || 0).toLocaleString("vi-VN")} đ</td>
                                        <td style="text-align: right;"><span class="badge badge-active">${b.borrowCount} lượt</span></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Phan bo theo the loai -->
                <div class="card" style="margin-bottom: 0;">
                    <div class="card-title">Tỷ lệ mượn theo thể loại</div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên thể loại</th>
                                    <th>Số đầu sách</th>
                                    <th style="text-align: right;">Số lượt mượn</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${catStats.length === 0 ? `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu</td></tr>` : catStats.map(c => `
                                    <tr>
                                        <td><strong>${escapeHtml(c.categoryName)}</strong></td>
                                        <td>${c.bookCount} sách</td>
                                        <td style="text-align: right;"><span class="badge badge-returned">${c.borrowCount} lượt</span></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
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
                <td>${escapeHtml(u.fullName || "-")}</td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge ${u.role === "Admin" ? "badge-admin" : "badge-user"}">${u.role}</span></td>
                <td>${formatDate(u.createdAt)}</td>
                <td style="white-space: nowrap;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="viewUserDetail(${u.id})">Chi tiết</button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="openEditUserModal(${u.id})">Chỉnh sửa</button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Loi tai danh sach nguoi dung:", err);
        showAlert("Không thể tải danh sách tài khoản", true);
    }
}

// Xem chi tiet thong tin va thong ke nguoi dung
async function viewUserDetail(userId) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            showAlert("Không thể tải chi tiết thông tin người dùng", true);
            return;
        }

        const u = await res.json();
        document.getElementById("detailUserId").textContent = `#${u.id}`;
        document.getElementById("detailUserUsername").textContent = u.username;
        document.getElementById("detailUserFullName").textContent = u.fullName || "-";
        document.getElementById("detailUserEmail").textContent = u.email;
        document.getElementById("detailUserRole").innerHTML = `<span class="badge ${u.role === "Admin" ? "badge-admin" : "badge-user"}">${u.role}</span>`;
        document.getElementById("detailUserCreatedAt").textContent = formatDate(u.createdAt);
        document.getElementById("detailUserTotalBorrowed").textContent = `${u.totalBorrowed} lượt`;
        document.getElementById("detailUserCurrentlyBorrowing").textContent = `${u.currentlyBorrowing} cuốn`;
        document.getElementById("detailUserOverdueCount").textContent = `${u.overdueCount} phiếu`;
        document.getElementById("detailUserTotalFines").textContent = `${Number(u.totalFines || 0).toLocaleString("vi-VN")} đ`;

        document.getElementById("btnSwitchToEditUser").onclick = () => {
            closeUserDetailModal();
            openEditUserModal(userId);
        };

        document.getElementById("userDetailModal").classList.remove("hidden");
    } catch (err) {
        console.error("Loi xem chi tiet nguoi dung:", err);
        showAlert("Lỗi khi tải chi tiết người dùng", true);
    }
}

// Dong hop thoai xem chi tiet nguoi dung
function closeUserDetailModal() {
    const modal = document.getElementById("userDetailModal");
    if (modal) modal.classList.add("hidden");
}

// Mo hop thoai chinh sua thong tin nguoi dung
async function openEditUserModal(userId) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            showAlert("Không thể lấy thông tin người dùng để sửa", true);
            return;
        }

        const u = await res.json();
        document.getElementById("editUserId").value = u.id;
        document.getElementById("editUsername").value = u.username;
        document.getElementById("editFullName").value = u.fullName || "";
        document.getElementById("editEmail").value = u.email || "";
        document.getElementById("editRole").value = u.role || "User";
        document.getElementById("editPassword").value = "";

        document.getElementById("editUserModal").classList.remove("hidden");
    } catch (err) {
        console.error("Loi mo hop thoai sua nguoi dung:", err);
        showAlert("Lỗi khi nạp dữ liệu chỉnh sửa người dùng", true);
    }
}

// Dong hop thoai chinh sua nguoi dung
function closeEditUserModal() {
    const modal = document.getElementById("editUserModal");
    if (modal) {
        modal.classList.add("hidden");
        document.getElementById("editUserForm").reset();
    }
}

// Xu ly luu cap nhat thong tin nguoi dung
async function handleSaveUser(event) {
    event.preventDefault();

    const userId = parseInt(document.getElementById("editUserId").value, 10);
    const fullName = document.getElementById("editFullName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const role = document.getElementById("editRole").value;
    const newPassword = document.getElementById("editPassword").value;

    if (!userId) {
        showAlert("Mã người dùng không hợp lệ", true);
        return;
    }

    const payload = {
        fullName,
        email,
        role,
        newPassword: newPassword || null
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            showAlert(data.message || "Đã lưu thay đổi thông tin người dùng");
            closeEditUserModal();
            loadUsers();
        } else {
            console.error("Loi cap nhat nguoi dung:", data);
            showAlert(data.message || "Cập nhật thông tin người dùng thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi cap nhat nguoi dung:", err);
        showAlert("Không thể kết nối đến máy chủ khi cập nhật", true);
    }
}

// Xu ly dong modal khi bam ra vung nen ngoai
function handleUserModalOverlayClick(event, modalId) {
    if (event.target && event.target.id === modalId) {
        if (modalId === "userDetailModal") closeUserDetailModal();
        if (modalId === "editUserModal") closeEditUserModal();
    }
}

// Thay doi vai tro nguoi dung nhanh
async function changeRole(userId, newRole) {
    if (!confirm(`Xác nhận đổi quyền tài khoản #${userId} thành ${newRole}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role: newRole })
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


// Cau hinh dia chi goc cua may chu Web API (Backend)
const API_BASE_URL = "http://localhost:5135";

// Quan ly trang thai ung dung client
const state = {
    token: localStorage.getItem("jwt_token") || "",
    role: localStorage.getItem("user_role") || "",
    username: localStorage.getItem("user_name") || "",
    activeTab: "books"
};

// Khoi chay khi trang duoc tai
document.addEventListener("DOMContentLoaded", () => {
    updateAuthUi();
    loadAuthors();
    loadCategories();
    loadBooks();
    setDefaultDueDate();
});

// Thiet lap ngay hen tra mac dinh la 14 ngay sau
function setDefaultDueDate() {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const dueDateInput = document.getElementById("borrowDueDate");
    if (dueDateInput) {
        dueDateInput.value = today.toISOString().split("T")[0];
    }
}

// Chuyen doi Tab hien thi
function switchTab(tabName) {
    state.activeTab = tabName;
    const booksTabBtn = document.getElementById("tabBooksBtn");
    const borrowTabBtn = document.getElementById("tabBorrowBtn");
    const statsTabBtn = document.getElementById("tabStatsBtn");

    const booksSection = document.getElementById("tabBooksSection");
    const borrowSection = document.getElementById("tabBorrowsSection");
    const statsSection = document.getElementById("tabStatsSection");

    booksTabBtn.classList.remove("active");
    borrowTabBtn.classList.remove("active");
    statsTabBtn.classList.remove("active");

    booksSection.classList.add("hidden");
    borrowSection.classList.add("hidden");
    statsSection.classList.add("hidden");

    if (tabName === "books") {
        booksTabBtn.classList.add("active");
        booksSection.classList.remove("hidden");
        loadBooks();
    } else if (tabName === "borrows") {
        borrowTabBtn.classList.add("active");
        borrowSection.classList.remove("hidden");
        loadBorrowRecords();
    } else if (tabName === "stats") {
        statsTabBtn.classList.add("active");
        statsSection.classList.remove("hidden");
        loadStatistics();
    }
}

// Cap nhat giao dien dang nhap va phan quyen
function updateAuthUi() {
    const statusElem = document.getElementById("userStatus");
    const logoutBtn = document.getElementById("btnLogout");
    const changePassBtn = document.getElementById("btnChangePasswordModal");

    if (state.token && state.username) {
        statusElem.textContent = `${state.username} - Quyền: ${state.role}`;
        statusElem.className = state.role === "Admin" ? "badge badge-admin" : "badge badge-user";
        logoutBtn.classList.remove("hidden");
        changePassBtn.classList.remove("hidden");
    } else {
        statusElem.textContent = "Chưa đăng nhập";
        statusElem.className = "badge badge-guest";
        logoutBtn.classList.add("hidden");
        changePassBtn.classList.add("hidden");
    }
}

// Dong mo form doi mat khau
function toggleChangePasswordCard() {
    const card = document.getElementById("changePasswordCard");
    card.classList.toggle("hidden");
}

// Xu ly doi mat khau qua AJAX
async function handleChangePassword(event) {
    event.preventDefault();
    if (!state.token) {
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
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        setOutput(data);

        if (!response.ok) {
            showAlert(data.message || "Đổi mật khẩu thất bại", true);
            return;
        }

        showAlert("Đổi mật khẩu thành công");
        document.getElementById("changePasswordForm").reset();
        toggleChangePasswordCard();
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gửi yêu cầu đổi mật khẩu", true);
    }
}

// Hien thi thong bao tren giao dien
function showAlert(message, isError = false) {
    const alertBox = document.getElementById("notification");
    alertBox.textContent = message;
    alertBox.className = `alert ${isError ? "alert-error" : "alert-success"}`;
    alertBox.classList.remove("hidden");
    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 4000);
}

// Hien thi du lieu tho vao vung ket qua phan hoi API
function setOutput(content) {
    const outputElem = document.getElementById("apiOutput");
    if (typeof content === "object") {
        outputElem.textContent = JSON.stringify(content, null, 2);
    } else {
        outputElem.textContent = content;
    }
}

// Dien thong tin tai khoan mau
function fillAccount(username, password) {
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = password;
}

// Xu ly dang nhap qua AJAX
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        setOutput(data);

        if (!response.ok) {
            showAlert(data.message || "Đăng nhập thất bại", true);
            return;
        }

        state.token = data.token;
        state.username = data.username;
        state.role = data.role;
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user_name", data.username);
        localStorage.setItem("user_role", data.role);

        updateAuthUi();
        showAlert(`Đăng nhập thành công với vai trò ${data.role}`);
        document.getElementById("loginPassword").value = "";

        if (state.activeTab === "borrows") {
            loadBorrowRecords();
        } else if (state.activeTab === "stats") {
            loadStatistics();
        }
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi kết nối máy chủ", true);
    }
}

// Xu ly dang xuat
function handleLogout() {
    state.token = "";
    state.username = "";
    state.role = "";
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    updateAuthUi();
    showAlert("Đã đăng xuất khỏi hệ thống");
    setOutput("Đã đăng xuất");
}

// Tai danh sach tac gia
async function loadAuthors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/authors`);
        if (response.ok) {
            const authors = await response.json();
            const select = document.getElementById("bookAuthorId");
            select.innerHTML = '<option value="">Chọn tác giả</option>';
            authors.forEach(author => {
                const opt = document.createElement("option");
                opt.value = author.id;
                opt.textContent = author.fullName;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Lỗi tải tác giả", error);
    }
}

// Tai danh sach the loai
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (response.ok) {
            const categories = await response.json();
            const select = document.getElementById("bookCategoryId");
            select.innerHTML = '<option value="">Chọn thể loại</option>';
            categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.id;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Lỗi tải thể loại", error);
    }
}

// Tai danh sach sach voi OData query qua AJAX
async function loadBooks() {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const sort = document.getElementById("sortOrder").value;

    const params = new URLSearchParams();
    if (keyword) {
        params.append("$filter", `contains(tolower(Title), '${keyword.toLowerCase()}')`);
    }
    if (sort) {
        params.append("$orderby", sort);
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/api/books?${queryString}` : `${API_BASE_URL}/api/books`;

    try {
        const response = await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            showAlert("Không thể tải danh sách sách", true);
            return;
        }

        const data = await response.json();
        setOutput(data);
        const bookList = Array.isArray(data) ? data : (data.value || []);
        renderBooksTable(bookList);
        populateBorrowBookSelect(bookList);
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gọi API danh sách sách", true);
    }
}

// Do danh sach sach con ton kho vao the chon muon sach
function populateBorrowBookSelect(books) {
    const select = document.getElementById("borrowBookSelect");
    select.innerHTML = '<option value="">Chọn sách</option>';
    books.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = `${b.title} - Còn: ${b.quantity}`;
        if (b.quantity <= 0) {
            opt.disabled = true;
        }
        select.appendChild(opt);
    });
}

// Ve du lieu vao bang danh sach sach
function renderBooksTable(books) {
    const tbody = document.getElementById("booksTableBody");
    if (!books || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Không có dữ liệu phù hợp</td></tr>';
        return;
    }

    tbody.innerHTML = books.map(b => `
        <tr>
            <td>${b.id}</td>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.isbn)}</td>
            <td>${escapeHtml(b.categoryName)}</td>
            <td>${b.price.toLocaleString("vi-VN")} đ</td>
            <td>${b.quantity}</td>
            <td>${escapeHtml(b.authorName)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="viewBookDetails(${b.id})">Xem</button>
                    <button class="btn btn-secondary btn-sm" onclick="editBook(${b.id})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBook(${b.id})">Xóa</button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Xem chi tiet mot dau sach
async function viewBookDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
            headers: { "Accept": "application/json" }
        });
        const data = await response.json();
        setOutput(data);
        if (response.ok) {
            showAlert(`Đã tải chi tiết sách mã ${id}`);
        } else {
            showAlert(data.message || "Không tìm thấy sách", true);
        }
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi tải chi tiết sách", true);
    }
}

// Do du lieu sach len form de chinh sua
async function editBook(id) {
    if (state.role !== "Admin") {
        showAlert("Chỉ tài khoản Admin mới có quyền sửa sách", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
        if (!response.ok) {
            showAlert("Không tìm thấy sách cần sửa", true);
            return;
        }

        const book = await response.json();
        document.getElementById("bookId").value = book.id;
        document.getElementById("bookTitle").value = book.title;
        document.getElementById("bookISBN").value = book.isbn;
        document.getElementById("bookCategoryId").value = book.categoryId;
        document.getElementById("bookPrice").value = book.price;
        document.getElementById("bookQuantity").value = book.quantity;
        document.getElementById("bookAuthorId").value = book.authorId;
        document.getElementById("bookDescription").value = book.description || "";
        
        if (book.publishedDate) {
            document.getElementById("bookPublishedDate").value = book.publishedDate.split("T")[0];
        }

        document.getElementById("formTitle").textContent = `Sửa sách mã ${book.id}`;
        document.getElementById("btnCancelEdit").classList.remove("hidden");
        document.getElementById("bookTitle").focus();
    } catch (error) {
        showAlert("Lỗi khi chuẩn bị dữ liệu sửa", true);
    }
}

// Luu thong tin sach: POST neu them moi, PUT neu cap nhat
async function handleSaveBook(event) {
    event.preventDefault();

    if (!state.token) {
        showAlert("Vui lòng đăng nhập quyền Admin để thao tác", true);
        return;
    }

    const id = document.getElementById("bookId").value;
    const isEdit = Boolean(id);

    const payload = {
        title: document.getElementById("bookTitle").value.trim(),
        isbn: document.getElementById("bookISBN").value.trim(),
        categoryId: parseInt(document.getElementById("bookCategoryId").value, 10),
        price: parseFloat(document.getElementById("bookPrice").value),
        quantity: parseInt(document.getElementById("bookQuantity").value, 10),
        authorId: parseInt(document.getElementById("bookAuthorId").value, 10),
        publishedDate: document.getElementById("bookPublishedDate").value,
        description: document.getElementById("bookDescription").value.trim()
    };

    const url = isEdit ? `${API_BASE_URL}/api/books/${id}` : `${API_BASE_URL}/api/books`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            showAlert("Hết phiên làm việc hoặc chưa đăng nhập", true);
            return;
        }
        if (response.status === 403) {
            showAlert("Bạn không có quyền thực hiện thao tác này", true);
            return;
        }

        if (!response.ok) {
            const errData = await response.json();
            setOutput(errData);
            showAlert(errData.message || "Dữ liệu không hợp lệ", true);
            return;
        }

        const result = isEdit ? { message: `Cập nhật thành công sách ${id}` } : await response.json();
        setOutput(result);
        showAlert(isEdit ? "Cập nhật sách thành công" : "Thêm mới sách thành công");
        resetBookForm();
        loadBooks();
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gửi yêu cầu lưu sách", true);
    }
}

// Xoa sach khoi he thong
async function deleteBook(id) {
    if (!state.token) {
        showAlert("Vui lòng đăng nhập quyền Admin để xóa", true);
        return;
    }

    if (!confirm(`Xác nhận xóa sách mã ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${state.token}`
            }
        });

        if (response.status === 401) {
            showAlert("Chưa đăng nhập", true);
            return;
        }
        if (response.status === 403) {
            showAlert("Chỉ tài khoản Admin mới có quyền xóa", true);
            return;
        }

        if (response.ok) {
            showAlert(`Đã xóa sách mã ${id}`);
            setOutput({ message: `Đã xóa sách mã ${id} thành công` });
            loadBooks();
        } else {
            const errData = await response.json();
            setOutput(errData);
            showAlert(errData.message || "Xóa thất bại", true);
        }
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gửi yêu cầu xóa", true);
    }
}

// Mượn sách qua AJAX
async function handleBorrowBook(event) {
    event.preventDefault();

    if (!state.token) {
        showAlert("Vui lòng đăng nhập để mượn sách", true);
        return;
    }

    const bookId = parseInt(document.getElementById("borrowBookSelect").value, 10);
    const dueDate = document.getElementById("borrowDueDate").value;
    const notes = document.getElementById("borrowNotes").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/borrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify({ bookId, dueDate, notes })
        });

        const data = await response.json();
        setOutput(data);

        if (!response.ok) {
            showAlert(data.message || "Không thể tạo phiếu mượn", true);
            return;
        }

        showAlert("Đăng ký mượn sách thành công");
        document.getElementById("borrowForm").reset();
        setDefaultDueDate();
        loadBooks();
        if (state.activeTab === "borrows") {
            loadBorrowRecords();
        }
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gửi yêu cầu mượn sách", true);
    }
}

// Tai danh sach phieu muon tra
async function loadBorrowRecords() {
    if (!state.token) {
        const tbody = document.getElementById("borrowsTableBody");
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Vui lòng đăng nhập để xem phiếu mượn</td></tr>';
        return;
    }

    const url = state.role === "Admin" ? `${API_BASE_URL}/api/borrowrecords` : `${API_BASE_URL}/api/borrowrecords/my-history`;

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${state.token}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            showAlert("Không thể tải danh sách phiếu mượn", true);
            return;
        }

        const data = await response.json();
        setOutput(data);
        const records = Array.isArray(data) ? data : (data.value || []);
        renderBorrowTable(records);
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi tải phiếu mượn", true);
    }
}

// Ve du lieu vao bang phieu muon
function renderBorrowTable(records) {
    const tbody = document.getElementById("borrowsTableBody");
    if (!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Chưa có phiếu mượn nào</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${escapeHtml(r.username || r.userFullName)}</td>
            <td><strong>${escapeHtml(r.bookTitle)}</strong></td>
            <td>${r.borrowDate.split("T")[0]}</td>
            <td>${r.dueDate.split("T")[0]}</td>
            <td>
                <span class="badge ${r.status === 'Borrowing' ? 'badge-borrowing' : 'badge-returned'}">
                    ${r.status === 'Borrowing' ? 'Đang mượn' : 'Đã trả'}
                </span>
            </td>
            <td>${r.fineAmount > 0 ? r.fineAmount.toLocaleString("vi-VN") + " đ" : "0 đ"}</td>
            <td>
                ${r.status === 'Borrowing' ? `<button class="btn btn-secondary btn-sm" onclick="returnBook(${r.id})">Trả sách</button>` : 'Hoàn tất'}
            </td>
        </tr>
    `).join("");
}

// Tra sach qua AJAX
async function returnBook(recordId) {
    if (!confirm(`Xác nhận trả sách cho phiếu mượn mã ${recordId}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/borrowrecords/${recordId}/return`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify({ notes: "Trả sách đúng quy trình" })
        });

        const data = await response.json();
        setOutput(data);

        if (!response.ok) {
            showAlert(data.message || "Trả sách thất bại", true);
            return;
        }

        showAlert(`Đã hoàn tất trả sách. Tiền phạt: ${data.fineAmount.toLocaleString("vi-VN")} đ`);
        loadBooks();
        loadBorrowRecords();
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi gửi yêu cầu trả sách", true);
    }
}

// Tai bao cao thong ke tong quan
async function loadStatistics() {
    if (!state.token || state.role !== "Admin") {
        document.getElementById("statsContainer").innerHTML = '<p style="color: #dc2626;">Chỉ tài khoản Admin mới có quyền xem thống kê hệ thống.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/statistics/summary`, {
            headers: {
                "Authorization": `Bearer ${state.token}`
            }
        });

        if (!response.ok) {
            showAlert("Không thể tải báo cáo thống kê", true);
            return;
        }

        const data = await response.json();
        setOutput(data);

        document.getElementById("statsContainer").innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Tổng đầu sách</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.totalBooks}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Tổng sách trong kho</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.totalCopiesInStock}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Tổng tác giả</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.totalAuthors}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Tổng thể loại</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.totalCategories}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Người dùng</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1e293b;">${data.totalUsers}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Phiếu đang mượn</div>
                    <div style="font-size: 24px; font-weight: 700; color: #ea580c;">${data.activeBorrowingCount}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Phiếu quá hạn</div>
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${data.overdueCount}</div>
                </div>
                <div class="card" style="margin: 0; background: #f8fafc;">
                    <div style="font-size: 13px; color: #64748b;">Tổng tiền phạt</div>
                    <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${data.totalFinesCollected.toLocaleString("vi-VN")} đ</div>
                </div>
            </div>
        `;
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi khi tải báo cáo", true);
    }
}

// Reset form ve trang thai them moi
function resetBookForm() {
    document.getElementById("bookForm").reset();
    document.getElementById("bookId").value = "";
    document.getElementById("formTitle").textContent = "Thêm sách mới";
    document.getElementById("btnCancelEdit").classList.add("hidden");
}

// Reset bo loc OData
function resetFilters() {
    document.getElementById("searchKeyword").value = "";
    document.getElementById("sortOrder").value = "";
    loadBooks();
}

// Kiem tra tinh nang Content Negotiation va Media Formatter
async function fetchContent(mediaType) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/books`, {
            headers: {
                "Accept": mediaType
            }
        });

        const contentType = response.headers.get("content-type");
        const text = await response.text();

        setOutput(`Content-Type nhận được: ${contentType}\n\n${text}`);
        showAlert(`Đã nhận phản hồi với định dạng ${mediaType}`);
    } catch (error) {
        setOutput(error.message);
        showAlert("Lỗi yêu cầu định dạng", true);
    }
}

// Ma hoa ky tu HTML de tranh XSS
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

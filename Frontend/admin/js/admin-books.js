// Quan ly Nghiep vu Kho sach, The loai, Tac gia va Phieu muon

// Tai the loai vao select form sach
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const cats = await res.json();
        const sel = document.getElementById("bookCategoryId");
        sel.innerHTML = '<option value="">Chọn thể loại</option>';
        cats.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error("Loi tai danh the loai:", err);
    }
}

// Tai tac gia vao select form sach
async function loadAuthors() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/authors`);
        const authors = await res.json();
        const sel = document.getElementById("bookAuthorId");
        sel.innerHTML = '<option value="">Chọn tác giả</option>';
        authors.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a.id;
            opt.textContent = a.fullName;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error("Loi tai danh sach tac gia:", err);
    }
}

// Dung chung truy van de file xuat khop danh sach sach dang hien thi.
function getBooksUrl() {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const sort = document.getElementById("sortOrder").value;

    let url = `${API_BASE_URL}/api/books?$top=50`;
    if (keyword) {
        const escapedKeyword = keyword.toLowerCase().replace(/'/g, "''");
        url += `&$filter=${encodeURIComponent(`contains(tolower(Title), '${escapedKeyword}')`)}`;
    }
    if (sort) url += `&$orderby=${encodeURIComponent(sort)}`;

    return url;
}

// Tai danh sach sach
async function loadBooks() {
    try {
        const res = await fetch(getBooksUrl(), { headers: { "Accept": "application/json" } });
        const books = await res.json();
        renderBooksTable(books);
    } catch (err) {
        console.error("Loi tai sach:", err);
        showAlert("Không thể tải danh sách sách", true);
    }
}

// Reset loc sach
function resetBookFilters() {
    document.getElementById("searchKeyword").value = "";
    document.getElementById("sortOrder").value = "";
    loadBooks();
}

// Hien thi bang sach quan tri
function renderBooksTable(books) {
    const tbody = document.getElementById("booksTableBody");
    if (!books || books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Kho chưa có sách nào</td></tr>`;
        return;
    }

    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.id}</td>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.isbn)}</td>
            <td>${escapeHtml(b.categoryName || "-")}</td>
            <td>${Number(b.price).toLocaleString("vi-VN")} đ</td>
            <td>${b.quantity}</td>
            <td>${escapeHtml(b.authorName || "-")}</td>
            <td>
                <button type="button" class="btn btn-secondary btn-sm" onclick="editBook(${b.id})">Sửa</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteBook(${b.id})">Xóa</button>
            </td>
        </tr>
    `).join("");
}

// Luu sach moi hoac cap nhat
async function handleSaveBook(event) {
    event.preventDefault();
    const bookId = document.getElementById("bookId").value;
    const isEdit = Boolean(bookId);

    const payload = {
        title: document.getElementById("bookTitle").value.trim(),
        isbn: document.getElementById("bookISBN").value.trim(),
        categoryId: parseInt(document.getElementById("bookCategoryId").value, 10),
        price: parseFloat(document.getElementById("bookPrice").value),
        quantity: parseInt(document.getElementById("bookQuantity").value, 10),
        authorId: parseInt(document.getElementById("bookAuthorId").value, 10),
        publishedDate: document.getElementById("bookPublishedDate").value,
        imageUrl: document.getElementById("bookImageUrl") ? document.getElementById("bookImageUrl").value.trim() : null,
        description: document.getElementById("bookDescription").value.trim()
    };

    const url = isEdit ? `${API_BASE_URL}/api/books/${bookId}` : `${API_BASE_URL}/api/books`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showAlert(isEdit ? "Cập nhật sách thành công" : "Thêm sách mới thành công");
            resetBookForm();
            loadBooks();
        } else {
            const errData = await res.json();
            console.error("Loi luu sach:", errData);
            showAlert(errData.message || "Lưu sách thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi luu sach:", err);
        showAlert("Lỗi kết nối khi lưu sách", true);
    }
}

// Chuyen form sang che do sua
async function editBook(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/books/${id}`);
        if (!res.ok) throw new Error("Không thể tải thông tin sách");
        const b = await res.json();

        document.getElementById("bookId").value = b.id;
        document.getElementById("bookTitle").value = b.title;
        document.getElementById("bookISBN").value = b.isbn;
        document.getElementById("bookCategoryId").value = b.categoryId;
        document.getElementById("bookPrice").value = b.price;
        document.getElementById("bookQuantity").value = b.quantity;
        document.getElementById("bookAuthorId").value = b.authorId;
        document.getElementById("bookPublishedDate").value = b.publishedDate.split("T")[0];
        document.getElementById("bookImageUrl").value = b.imageUrl || "";
        document.getElementById("bookDescription").value = b.description || "";

        document.getElementById("formTitle").textContent = `Chỉnh sửa sách #${b.id}`;
        document.getElementById("btnSaveBook").textContent = "Cập nhật thay đổi";
        document.getElementById("btnCancelEdit").classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
        console.error("Loi doc thong tin sach:", err);
        showAlert("Lỗi khi tải chi tiết sách", true);
    }
}

// Xoa sach
async function deleteBook(id) {
    if (!confirm(`Xác nhận xóa cuốn sách mã #${id}? Thao tác này sẽ thất bại nếu sách đang có phiếu mượn.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/books/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.ok) {
            showAlert(`Đã xóa thành công sách #${id}`);
            loadBooks();
        } else {
            const data = await res.json();
            console.error("Loi xoa sach:", data);
            showAlert(data.message || "Không thể xóa sách", true);
        }
    } catch (err) {
        console.error("Loi ket noi xoa sach:", err);
        showAlert("Lỗi kết nối khi xóa sách", true);
    }
}

// Reset form nhap sach
function resetBookForm() {
    document.getElementById("bookForm").reset();
    document.getElementById("bookId").value = "";
    if (document.getElementById("bookImageUrl")) document.getElementById("bookImageUrl").value = "";
    document.getElementById("formTitle").textContent = "Thêm sách mới vào kho";
    document.getElementById("btnSaveBook").textContent = "Lưu thông tin sách";
    document.getElementById("btnCancelEdit").classList.add("hidden");
}

// Tai file theo Content Negotiation; chi tao file khi API tra dung dinh dang.
async function fetchContent(mediaType) {
    const extensions = { "application/json": "json", "application/xml": "xml", "text/csv": "csv" };
    const extension = extensions[mediaType];
    if (!extension) return;

    try {
        const res = await fetch(getBooksUrl(), {
            headers: { "Accept": mediaType }
        });
        if (!res.ok) throw new Error(`Không thể xuất dữ liệu. HTTP ${res.status}`);
        if (res.headers.get("Content-Type")?.split(";")[0].trim() !== mediaType) {
            throw new Error("API trả về sai định dạng dữ liệu");
        }

        // BOM giup Excel nhan dung tieng Viet trong file CSV.
        const content = await res.blob();
        const file = mediaType === "text/csv"
            ? new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" })
            : content;
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = `books.${extension}`;
        document.body.appendChild(link);
        try {
            link.click();
        } finally {
            link.remove();
            // Cho trinh duyet bat dau tai truoc khi giai phong URL tam.
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    } catch (err) {
        console.error("Loi xuat noi dung:", err);
        showAlert(err.message, true);
    }
}

// Tai toan bo phieu muon trong he thong
async function loadBorrowRecords() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/borrowrecords?$top=50`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Lỗi khi tải phiếu mượn");
        const records = await res.json();
        renderBorrowRecords(records);
    } catch (err) {
        console.error("Loi tai danh sach phieu muon:", err);
        showAlert("Không thể tải danh sách phiếu mượn", true);
    }
}

// Hien thi bang phieu muon
function renderBorrowRecords(records) {
    const tbody = document.getElementById("borrowsTableBody");
    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b;">Không có phiếu mượn nào</td></tr>`;
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

        const canReturn = r.status === "Active" || r.status === "Borrowing" || r.status === "Overdue";
        const canRenew = (r.status === "Active" || r.status === "Borrowing") && Number(r.renewalCount || 0) < 2;

        return `
            <tr>
                <td>#${r.id}</td>
                <td>${escapeHtml(r.username || "-")}</td>
                <td><strong>${escapeHtml(r.bookTitle || "-")}</strong></td>
                <td>${formatDate(r.borrowDate)}</td>
                <td>${formatDate(r.dueDate)}</td>
                <td>${r.returnDate ? formatDate(r.returnDate) : "-"}</td>
                <td>
                    <span class="badge ${badgeClass}">${statusText}</span>
                    ${Number(r.renewalCount || 0) > 0 ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Gia hạn: ${r.renewalCount}/2 lần</div>` : ""}
                </td>
                <td>${Number(r.fineAmount || 0).toLocaleString("vi-VN")} đ</td>
                <td style="white-space: nowrap;">
                    ${canRenew ? `<button type="button" class="btn btn-secondary btn-sm" style="margin-right: 4px;" onclick="renewBookAdmin(${r.id})">Gia hạn</button>` : ""}
                    ${canReturn ? `<button type="button" class="btn btn-primary btn-sm" onclick="returnBookAdmin(${r.id})">Nhận trả</button>` : "-"}
                </td>
            </tr>
        `;
    }).join("");
}

// Quan tri vien gia han phieu muon them 7 ngay
async function renewBookAdmin(id) {
    if (!confirm(`Xác nhận gia hạn phiếu #${id} thêm 7 ngày?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/borrowrecords/${id}/renew`, {
            method: "PUT",
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            showAlert(data.message || "Gia hạn phiếu mượn thành công");
            loadBorrowRecords();
        } else {
            console.error("Loi gia han:", data);
            showAlert(data.message || "Gia hạn thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi gia han:", err);
        showAlert("Lỗi kết nối khi gửi yêu cầu gia hạn", true);
    }
}

// Quan tri vien xac nhan nhan tra sach
async function returnBookAdmin(id) {
    if (!confirm(`Xác nhận nhận trả sách cho phiếu #${id}? Hệ thống sẽ hoàn tồn kho và tính phạt nếu quá hạn.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/borrowrecords/${id}/return`, {
            method: "PUT",
            headers: getAuthHeaders()
        });

        const data = await res.json();
        if (res.ok) {
            showAlert(`Đã nhận trả sách phiếu #${id}. Tiền phạt: ${Number(data.fineAmount || 0).toLocaleString("vi-VN")} đ`);
            loadBorrowRecords();
        } else {
            console.error("Loi nhan tra sach:", data);
            showAlert(data.message || "Xử lý trả sách thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi nhan tra sach:", err);
        showAlert("Lỗi kết nối khi nhận trả sách", true);
    }
}

// Quan ly the loai: danh sach
async function loadCategoriesList() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const cats = await res.json();
        const tbody = document.getElementById("categoriesTableBody");
        tbody.innerHTML = cats.map(c => `
            <tr>
                <td>#${c.id}</td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${c.bookCount || 0}</td>
                <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">Xóa</button></td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Loi doc the loai:", err);
    }
}

// Them the loai moi
async function handleAddCategory(event) {
    event.preventDefault();
    const name = document.getElementById("catName").value.trim();
    const description = document.getElementById("catDescription").value.trim();

    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, description })
        });

        if (res.ok) {
            showAlert("Thêm thể loại mới thành công");
            document.getElementById("categoryForm").reset();
            loadCategoriesList();
            loadCategories();
        } else {
            const data = await res.json();
            showAlert(data.message || "Thêm thể loại thất bại", true);
        }
    } catch (err) {
        console.error("Loi them the loai:", err);
        showAlert("Lỗi kết nối khi thêm thể loại", true);
    }
}

// Xoa the loai
async function deleteCategory(id) {
    if (!confirm(`Xác nhận xóa thể loại #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.ok) {
            showAlert("Đã xóa thể loại");
            loadCategoriesList();
            loadCategories();
        } else {
            const data = await res.json();
            showAlert(data.message || "Không thể xóa thể loại còn sách", true);
        }
    } catch (err) {
        console.error("Loi xoa the loai:", err);
        showAlert("Lỗi kết nối khi xóa thể loại", true);
    }
}

// Quan ly tac gia: danh sach
async function loadAuthorsList() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/authors`);
        const authors = await res.json();
        const tbody = document.getElementById("authorsTableBody");
        tbody.innerHTML = authors.map(a => `
            <tr>
                <td>#${a.id}</td>
                <td><strong>${escapeHtml(a.fullName)}</strong></td>
                <td>${a.bookCount || 0}</td>
                <td><button type="button" class="btn btn-danger btn-sm" onclick="deleteAuthor(${a.id})">Xóa</button></td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Loi doc tac gia:", err);
    }
}

// Them tac gia moi
async function handleAddAuthor(event) {
    event.preventDefault();
    const fullName = document.getElementById("authorFullName").value.trim();
    const biography = document.getElementById("authorBio").value.trim();

    try {
        const res = await fetch(`${API_BASE_URL}/api/authors`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ fullName, biography })
        });

        if (res.ok) {
            showAlert("Thêm tác giả mới thành công");
            document.getElementById("authorForm").reset();
            loadAuthorsList();
            loadAuthors();
        } else {
            const data = await res.json();
            showAlert(data.message || "Thêm tác giả thất bại", true);
        }
    } catch (err) {
        console.error("Loi them tac gia:", err);
        showAlert("Lỗi kết nối khi thêm tác giả", true);
    }
}

// Xoa tac gia
async function deleteAuthor(id) {
    if (!confirm(`Xác nhận xóa tác giả #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/authors/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.ok) {
            showAlert("Đã xóa tác giả");
            loadAuthorsList();
            loadAuthors();
        } else {
            const data = await res.json();
            showAlert(data.message || "Không thể xóa tác giả còn sách", true);
        }
    } catch (err) {
        console.error("Loi xoa tac gia:", err);
        showAlert("Lỗi kết nối khi xóa tác giả", true);
    }
}


// Quan ly danh sach sach yeu thich cua doc gia

const homeFavoritesState = {
    currentDetailBookId: null,
    isCurrentDetailFavorite: false
};

// Tai danh sach sach yeu thich cua doc gia
async function loadFavorites() {
    const tbody = document.getElementById("favoritesTableBody");
    if (!tbody) return;

    if (!homeState.token) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Vui lòng đăng nhập để xem danh sách yêu thích</td></tr>`;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/favorites`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            }
        });

        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626;">Không thể tải danh sách yêu thích</td></tr>`;
            return;
        }

        const list = await response.json();
        if (!list || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b;">Bạn chưa lưu cuốn sách nào vào danh sách yêu thích</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => {
            const safeTitle = escapeHtml(item.bookTitle);
            const isAvailable = Number(item.quantity || 0) > 0;
            const coverUrl = item.imageUrl || (item.bookId <= 15 ? `images/books/book-${item.bookId}.svg` : "images/books/book-default.svg");

            return `
                <tr class="book-row-clickable" onclick="showBookDetail(${item.bookId})">
                    <td style="width: 70px; text-align: center;">
                        <img src="${coverUrl}" alt="${safeTitle}" class="book-thumb" loading="lazy" onerror="this.onerror=null;this.src='images/books/book-default.svg';">
                    </td>
                    <td><strong class="book-title-clickable">${safeTitle}</strong></td>
                    <td><code>${escapeHtml(item.bookIsbn || "-")}</code></td>
                    <td>${escapeHtml(item.categoryName || "-")}</td>
                    <td>${escapeHtml(item.authorName || "-")}</td>
                    <td style="white-space: nowrap;">${Number(item.price || 0).toLocaleString("vi-VN")} đ</td>
                    <td style="white-space: nowrap;">
                        <span class="badge ${isAvailable ? "badge-returned" : "badge-overdue"}">
                            ${isAvailable ? `Còn ${item.quantity} cuốn` : "Hết sách"}
                        </span>
                    </td>
                    <td style="white-space: nowrap;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openBorrowModal(${item.bookId}, '${safeTitle.replace(/'/g, "\\'")}')" ${!isAvailable ? "disabled" : ""}>
                            Mượn sách
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="event.stopPropagation(); handleRemoveFavorite(${item.bookId})">
                            Bỏ lưu
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        console.error("Loi tai danh sach yeu thich:", err);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626;">Lỗi kết nối khi tải danh sách yêu thích</td></tr>`;
    }
}

// Kiem tra trang thai yeu thich cua cuon sach khi mo modal chi tiet
async function checkDetailFavorite(bookId) {
    homeFavoritesState.currentDetailBookId = bookId;
    const btn = document.getElementById("detailFavoriteBtn");
    if (!btn) return;

    if (!homeState.token) {
        homeFavoritesState.isCurrentDetailFavorite = false;
        btn.textContent = "Lưu yêu thích";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/favorites/check/${bookId}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            homeFavoritesState.isCurrentDetailFavorite = Boolean(data.isFavorite);
            btn.textContent = data.isFavorite ? "Đã lưu yêu thích" : "Lưu yêu thích";
        }
    } catch (err) {
        console.error("Loi kiem tra yeu thich:", err);
    }
}

// Xu ly bam nut Luu hoac Bo luu yeu thich trong modal chi tiet
async function handleDetailToggleFavorite() {
    if (!homeState.token) {
        showAlert("Vui lòng đăng nhập để lưu sách vào danh sách yêu thích", true);
        openAuthModal();
        return;
    }

    const bookId = homeFavoritesState.currentDetailBookId;
    if (!bookId) return;

    const isFav = homeFavoritesState.isCurrentDetailFavorite;
    const url = `${API_BASE_URL}/api/favorites/${bookId}`;
    const method = isFav ? "DELETE" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            }
        });

        if (response.ok) {
            homeFavoritesState.isCurrentDetailFavorite = !isFav;
            const btn = document.getElementById("detailFavoriteBtn");
            if (btn) btn.textContent = !isFav ? "Đã lưu yêu thích" : "Lưu yêu thích";
            showAlert(!isFav ? "Đã thêm vào danh sách sách yêu thích" : "Đã bỏ cuốn sách khỏi danh sách yêu thích");
            if (homeState.activeMainTab === "favorites") loadFavorites();
        } else {
            showAlert("Thao tác yêu thích không thành công", true);
        }
    } catch (err) {
        console.error("Loi thao tac yeu thich:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}

// Xoa cuon sach khoi danh sach yeu thich tu bang
async function handleRemoveFavorite(bookId) {
    if (!homeState.token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/favorites/${bookId}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            }
        });
        if (response.ok) {
            showAlert("Đã xóa sách khỏi danh sách yêu thích");
            loadFavorites();
        } else {
            showAlert("Xóa sách khỏi danh sách yêu thích không thành công", true);
        }
    } catch (err) {
        console.error("Loi xoa yeu thich:", err);
        showAlert("Không thể kết nối đến máy chủ", true);
    }
}


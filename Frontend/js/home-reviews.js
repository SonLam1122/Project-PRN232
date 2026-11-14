// Xu ly Tai va Gui Danh gia sach danh cho doc gia

// Tai danh sach danh gia va diem trung binh cua dau sach
async function loadBookReviews(bookId) {
    const listElem = document.getElementById("detailReviewsList");
    const avgElem = document.getElementById("detailAvgRating");
    const formContainer = document.getElementById("reviewFormContainer");
    const loginPrompt = document.getElementById("reviewLoginPrompt");
    const reviewBookIdInput = document.getElementById("reviewBookId");

    if (reviewBookIdInput) {
        reviewBookIdInput.value = bookId;
    }

    try {
        const headers = { "Accept": "application/json" };
        if (homeState.token) {
            headers["Authorization"] = `Bearer ${homeState.token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/reviews`, { headers });

        if (!res.ok) {
            listElem.innerHTML = `<div style="color: #64748b; font-size: 13px;">Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá cuốn sách này.</div>`;
            avgElem.textContent = "0 sao";
            return;
        }

        const data = await res.json();
        avgElem.textContent = `${data.averageRating} sao - ${data.totalReviews} nhận xét`;

        // Kiem tra quyen danh gia: phai dang nhap va da tung muon cuon sach
        const isLogged = Boolean(homeState.token);
        if (formContainer && loginPrompt) {
            if (!isLogged) {
                formContainer.classList.add("hidden");
                loginPrompt.textContent = "Đăng nhập tài khoản để viết nhận xét và chia sẻ đánh giá cho cuốn sách này.";
                loginPrompt.classList.remove("hidden");
            } else if (!data.userHasBorrowed) {
                formContainer.classList.add("hidden");
                loginPrompt.textContent = "Bạn chỉ có thể đánh giá và nhận xét sau khi đã mượn cuốn sách này.";
                loginPrompt.classList.remove("hidden");
            } else {
                formContainer.classList.remove("hidden");
                loginPrompt.classList.add("hidden");
            }
        }

        if (!data.reviews || data.reviews.length === 0) {
            listElem.innerHTML = `<div style="color: #64748b; font-size: 13px;">Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá cuốn sách này.</div>`;
            return;
        }

        listElem.innerHTML = data.reviews.map(r => {
            const safeName = escapeHtml(r.userFullName || r.username);
            const safeComment = escapeHtml(r.comment);
            const starsText = `${r.rating} sao`;
            return `
                <div class="review-item">
                    <div class="review-item-header">
                        <strong>${safeName}</strong>
                        <div>
                            <span class="rating-badge">${starsText}</span>
                            <span style="margin-left: 6px;">${formatDate(r.createdAt)}</span>
                        </div>
                    </div>
                    <div class="review-item-comment">${safeComment}</div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Loi tai danh gia sach:", err);
        listElem.innerHTML = `<div style="color: #dc2626; font-size: 13px;">Không thể tải đánh giá vào lúc này.</div>`;
    }
}

// Gui danh gia va nhan xet sach moi
async function handleSubmitReview(event) {
    event.preventDefault();

    if (!homeState.token) {
        showAlert("Vui lòng đăng nhập để gửi nhận xét và đánh giá", true);
        return;
    }

    const bookId = parseInt(document.getElementById("reviewBookId").value, 10);
    const rating = parseInt(document.getElementById("reviewRating").value, 10);
    const comment = document.getElementById("reviewComment").value.trim();

    if (!bookId || !rating || !comment) {
        showAlert("Vui lòng điền đầy đủ đánh giá và nhận xét", true);
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${homeState.token}`
            },
            body: JSON.stringify({ rating, comment })
        });

        const data = await res.json();
        if (res.ok) {
            showAlert("Gửi đánh giá cuốn sách thành công");
            document.getElementById("bookReviewForm").reset();
            loadBookReviews(bookId);
        } else {
            console.error("Loi gui danh gia:", data);
            showAlert(data.message || data.Message || "Gửi đánh giá thất bại", true);
        }
    } catch (err) {
        console.error("Loi ket noi gui danh gia:", err);
        showAlert("Không thể kết nối đến máy chủ khi gửi đánh giá", true);
    }
}

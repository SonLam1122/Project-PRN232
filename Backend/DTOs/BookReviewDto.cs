using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO hien thi thong tin danh gia sach
    public class BookReviewReadDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // DTO gui danh gia sach moi tu doc gia
    public class BookReviewCreateDto
    {
        [Required(ErrorMessage = "Diem danh gia la bat buoc")]
        [Range(1, 5, ErrorMessage = "Diem danh gia tu 1 den 5 sao")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Noi dung nhan xet la bat buoc")]
        [StringLength(1000, MinimumLength = 5, ErrorMessage = "Nhan xet tu 5 den 1000 ky tu")]
        public string Comment { get; set; } = string.Empty;
    }

    // DTO tong hop diem danh gia cua dau sach
    public class BookRatingSummaryDto
    {
        public int BookId { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public bool UserHasBorrowed { get; set; }
        public List<BookReviewReadDto> Reviews { get; set; } = new();
    }
}

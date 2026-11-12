using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO tra ve thong tin phieu muon sach
    public class BorrowRecordReadDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal FineAmount { get; set; }
        public string? Notes { get; set; }
    }

    // DTO yeu cau muon sach moi
    public class BorrowCreateDto
    {
        [Required(ErrorMessage = "Ma sach la bat buoc")]
        [Range(1, int.MaxValue, ErrorMessage = "Ma sach phai hop le")]
        public int BookId { get; set; }

        [Required(ErrorMessage = "Ngay het han muon la bat buoc")]
        [DataType(DataType.Date)]
        public DateTime DueDate { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chu toi da 500 ky tu")]
        public string? Notes { get; set; }
    }

    // DTO tra sach va cap nhat ghi chu
    public class BorrowReturnDto
    {
        [StringLength(500, ErrorMessage = "Ghi chu toi da 500 ky tu")]
        public string? Notes { get; set; }
    }
}


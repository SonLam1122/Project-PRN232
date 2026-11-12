using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Phieu muon tra sach
    [Table("BorrowRecords")]
    public class BorrowRecord
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ma nguoi dung la bat buoc")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required(ErrorMessage = "Ma sach la bat buoc")]
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime BorrowDate { get; set; } = DateTime.UtcNow;

        [Required]
        [DataType(DataType.Date)]
        public DateTime DueDate { get; set; }

        [DataType(DataType.Date)]
        public DateTime? ReturnDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Borrowing"; // "Borrowing", "Returned", "Overdue"

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 10000000.0, ErrorMessage = "Tien phat khong the am")]
        public decimal FineAmount { get; set; } = 0;

        [StringLength(500, ErrorMessage = "Ghi chu toi da 500 ky tu")]
        public string? Notes { get; set; }
    }
}


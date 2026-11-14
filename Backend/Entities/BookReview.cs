using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Danh gia va Nhan xet sach tu nguoi dung
    [Table("BookReviews")]
    public class BookReview
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ma sach la bat buoc")]
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }

        [Required(ErrorMessage = "Ma nguoi dung la bat buoc")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required(ErrorMessage = "Diem danh gia la bat buoc")]
        [Range(1, 5, ErrorMessage = "Diem danh gia tu 1 den 5 sao")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Noi dung nhan xet la bat buoc")]
        [StringLength(1000, MinimumLength = 5, ErrorMessage = "Nhan xet tu 5 den 1000 ky tu")]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


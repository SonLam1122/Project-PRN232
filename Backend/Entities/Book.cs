using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Dau sach trong he thong thu vien
    [Table("Books")]
    public class Book
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tieu de sach la bat buoc")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Tieu de sach tu 1 den 200 ky tu")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ma ISBN la bat buoc")]
        [RegularExpression(@"^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$", 
            ErrorMessage = "Dinh dang ma ISBN khong hop le theo chuan quoc te")]
        [StringLength(20, ErrorMessage = "ISBN toi da 20 ky tu")]
        public string ISBN { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Mo ta sach toi da 1000 ky tu")]
        public string? Description { get; set; }

        [StringLength(500, ErrorMessage = "Duong dan hinh anh toi da 500 ky tu")]
        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "Gia sach la bat buoc")]
        [Range(1000.0, 50000000.0, ErrorMessage = "Gia sach phai nam trong khoang tu 1,000 den 50,000,000")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "So luong ton kho la bat buoc")]
        [Range(0, 10000, ErrorMessage = "So luong ton kho tu 0 den 10,000")]
        public int Quantity { get; set; }

        [DataType(DataType.Date)]
        public DateTime PublishedDate { get; set; } = DateTime.UtcNow;

        // Khoa ngoai den Tac gia
        [Required(ErrorMessage = "Ma tac gia la bat buoc")]
        public int AuthorId { get; set; }

        [ForeignKey("AuthorId")]
        public Author? Author { get; set; }

        // Khoa ngoai den The loai
        [Required(ErrorMessage = "Ma the loai la bat buoc")]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        // Danh sach cac luot muon sach nay
        public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Tac gia sach
    [Table("Authors")]
    public class Author
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ten tac gia la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ten tac gia tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Tieu su toi da 500 ky tu")]
        public string? Biography { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        // Quan he 1-N: Mot tac gia co the co nhieu sach
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}


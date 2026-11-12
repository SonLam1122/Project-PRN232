using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Danh muc / The loai sach
    [Table("Categories")]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ten the loai la bat buoc")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Ten the loai tu 2 den 50 ky tu")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "Mo ta the loai toi da 250 ky tu")]
        public string? Description { get; set; }

        // Quan he 1-N: Mot the loai chua nhieu cuon sach
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}


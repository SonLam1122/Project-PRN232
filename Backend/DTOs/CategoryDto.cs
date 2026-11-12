using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO tra ve thong tin the loai sach
    public class CategoryReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BookCount { get; set; }
    }

    // DTO tao moi the loai sach
    public class CategoryCreateDto
    {
        [Required(ErrorMessage = "Ten the loai la bat buoc")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Ten the loai phai tu 2 den 50 ky tu")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "Mo ta toi da 250 ky tu")]
        public string? Description { get; set; }
    }

    // DTO cap nhat the loai sach
    public class CategoryUpdateDto
    {
        [Required(ErrorMessage = "Ten the loai la bat buoc")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Ten the loai phai tu 2 den 50 ky tu")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "Mo ta toi da 250 ky tu")]
        public string? Description { get; set; }
    }
}


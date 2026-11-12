using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO tra ve thong tin tac gia
    public class AuthorReadDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Biography { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int BookCount { get; set; }
    }

    // DTO tao moi tac gia
    public class AuthorCreateDto
    {
        [Required(ErrorMessage = "Ten tac gia la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ten tac gia tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Tieu su toi da 500 ky tu")]
        public string? Biography { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }
    }

    // DTO cap nhat tac gia
    public class AuthorUpdateDto
    {
        [Required(ErrorMessage = "Ten tac gia la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ten tac gia tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Tieu su toi da 500 ky tu")]
        public string? Biography { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }
    }
}

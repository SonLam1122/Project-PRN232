using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_PRN232.Entities
{
    // Thuc the dai dien cho Nguoi dung va phan quyen trong he thong
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Ten dang nhap la bat buoc")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Ten dang nhap tu 3 den 50 ky tu")]
        [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "Ten dang nhap chi chua chu cai, chu so, dau cham va gach duoi")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email la bat buoc")]
        [EmailAddress(ErrorMessage = "Dia chi email khong hop le")]
        [StringLength(100, ErrorMessage = "Email toi da 100 ky tu")]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ho va ten la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ho va ten tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "User"; // "Admin" hoac "User"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Danh sach cac phieu muon cua nguoi dung
        public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
    }
}

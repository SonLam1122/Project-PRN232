using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO dang ky tai khoan nguoi dung moi voi validation bao mat chat che
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "Ten dang nhap la bat buoc")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Ten dang nhap tu 3 den 50 ky tu")]
        [RegularExpression(@"^[a-zA-Z0-9._]+$", ErrorMessage = "Ten dang nhap chi chua chu cai, chu so, dau cham va gach duoi")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email la bat buoc")]
        [EmailAddress(ErrorMessage = "Dia chi email khong dung dinh dang")]
        [StringLength(100, ErrorMessage = "Email toi da 100 ky tu")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mat khau la bat buoc")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Mat khau phai co do dai toi thieu 8 ky tu")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Mat khau phai chua it nhat mot chu hoa, mot chu thuong, mot chu so va mot ky tu dac biet")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ho ten la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ho ten tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;
    }

    // DTO dang nhap he thong
    public class UserLoginDto
    {
        [Required(ErrorMessage = "Ten dang nhap la bat buoc")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mat khau la bat buoc")]
        public string Password { get; set; } = string.Empty;
    }

    // DTO tra ve ket qua xac thuc kem JWT token
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
    }

    // DTO doi mat khau nguoi dung
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mat khau hien tai la bat buoc")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mat khau moi la bat buoc")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Mat khau moi phai toi thieu 8 ky tu")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Mat khau phai chua it nhat mot chu hoa, mot chu thuong, mot chu so va mot ky tu dac biet")]
        public string NewPassword { get; set; } = string.Empty;
    }

    // DTO xem danh sach tai khoan nguoi dung (danh cho Admin)
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // DTO cap nhat vai tro tai khoan
    public class UpdateRoleDto
    {
        [Required(ErrorMessage = "Vai tro la bat buoc")]
        [RegularExpression(@"^(Admin|User)$", ErrorMessage = "Vai tro chi co the la Admin hoac User")]
        public string Role { get; set; } = "User";
    }

    // DTO cap nhat toan dien thong tin nguoi dung (danh cho Admin)
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "Ho ten la bat buoc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Ho ten tu 2 den 100 ky tu")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email la bat buoc")]
        [EmailAddress(ErrorMessage = "Dia chi email khong hop le")]
        [StringLength(100, ErrorMessage = "Email toi da 100 ky tu")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vai tro la bat buoc")]
        [RegularExpression(@"^(Admin|User)$", ErrorMessage = "Vai tro chi co the la Admin hoac User")]
        public string Role { get; set; } = "User";

        // Mat khau moi neu Admin muon dat lai mat khau cho nguoi dung (tuy chon)
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Mat khau moi phai toi thieu 8 ky tu")]
        public string? NewPassword { get; set; }
    }

    // DTO chi tiet thong tin nguoi dung (danh cho Admin xem)
    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalBorrowed { get; set; }
        public int CurrentlyBorrowing { get; set; }
        public int OverdueCount { get; set; }
        public decimal TotalFines { get; set; }
    }
}

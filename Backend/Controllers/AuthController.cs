using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;
using Project_PRN232.Services;

namespace Project_PRN232.Controllers
{
    // Controller quan ly xac thuc va phan quyen nguoi dung voi co che bao mat nang cao
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            LibraryDbContext context,
            IPasswordHasher passwordHasher,
            IJwtTokenService jwtTokenService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
            _logger = logger;
        }

        // POST: api/auth/register - Dang ky tai khoan nguoi dung moi voi mat khau manh
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cleanUsername = dto.Username.Trim().ToLower();
            var cleanEmail = dto.Email.Trim().ToLower();

            // Kiem tra trung lap Username
            var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == cleanUsername);
            if (usernameExists)
            {
                _logger.LogWarning("Dang ky that bai: Ten dang nhap {Username} da ton tai", dto.Username);
                return BadRequest(new { Message = "Tên đăng nhập đã tồn tại trên hệ thống, vui lòng chọn tên khác." });
            }

            // Kiem tra trung lap Email
            var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == cleanEmail);
            if (emailExists)
            {
                _logger.LogWarning("Dang ky that bai: Email {Email} da ton tai", dto.Email);
                return BadRequest(new { Message = "Địa chỉ email này đã được sử dụng, vui lòng chọn email khác." });
            }

            var newUser = new User
            {
                Username = dto.Username.Trim(),
                Email = dto.Email.Trim().ToLower(),
                FullName = dto.FullName.Trim(),
                Role = "User", // Mac dinh la User thuong
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Nguoi dung {Username} da dang ky thanh cong voi Id {UserId}", newUser.Username, newUser.Id);

            var (token, expiration) = _jwtTokenService.GenerateToken(newUser);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = newUser.Id,
                Username = newUser.Username,
                FullName = newUser.FullName,
                Role = newUser.Role,
                Expiration = expiration
            });
        }

        // POST: api/auth/login - Dang nhap va nhan JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());
            if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Dang nhap that bai cho tai khoan {Username}", dto.Username);
                return Unauthorized(new { Message = "Ten dang nhap hoac mat khau khong chinh xac." });
            }

            var (token, expiration) = _jwtTokenService.GenerateToken(user);

            _logger.LogInformation("Nguoi dung {Username} dang nhap thanh cong voi vai tro {Role}", user.Username, user.Role);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role,
                Expiration = expiration
            });
        }

        // GET: api/auth/me - Lay thong tin tai khoan dang dang nhap tu Claims
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var username = User.FindFirstValue(ClaimTypes.Name);
            var role = User.FindFirstValue(ClaimTypes.Role);
            var email = User.FindFirstValue(ClaimTypes.Email);

            return Ok(new
            {
                UserId = userId,
                Username = username,
                Email = email,
                Role = role
            });
        }

        // PUT: api/auth/change-password - Doi mat khau nguoi dung co xac thuc
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { Message = "Khong xac dinh duoc nguoi dung." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { Message = "Tai khoan khong ton tai." });
            }

            if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { Message = "Mat khau hien tai khong dung." });
            }

            user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Nguoi dung {Username} da doi mat khau thanh cong", user.Username);

            return Ok(new { Message = "Doi mat khau thanh cong." });
        }
    }
}

using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Services;

namespace Project_PRN232.Controllers
{
    // Controller quan ly danh sach va phan quyen nguoi dung (Danh rieng cho Admin)
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<UsersController> _logger;

        public UsersController(LibraryDbContext context, IMapper mapper, IPasswordHasher passwordHasher, ILogger<UsersController> logger)
        {
            _context = context;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        // GET: api/users - Lay danh sach tat ca tai khoan trong he thong ho tro OData
        [HttpGet]
        [EnableQuery(PageSize = 50)]
        public ActionResult<IQueryable<UserSummaryDto>> GetAllUsers()
        {
            _logger.LogInformation("Admin dang lay danh sach nguoi dung");
            var query = _context.Users
                .AsNoTracking()
                .ProjectTo<UserSummaryDto>(_mapper.ConfigurationProvider);

            return Ok(query);
        }

        // GET: api/users/{id} - Lay chi tiet thong tin nguoi dung kem thong ke muon tra
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDetailDto>> GetUserById(int id)
        {
            _logger.LogInformation("Admin dang xem thong tin chi tiet nguoi dung {UserId}", id);
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { Message = $"Khong tim thay nguoi dung voi ma #{id}." });
            }

            var borrowStats = await _context.BorrowRecords
                .Where(b => b.UserId == id)
                .GroupBy(b => 1)
                .Select(g => new
                {
                    TotalBorrowed = g.Count(),
                    CurrentlyBorrowing = g.Count(b => b.Status == "Borrowing" || b.Status == "Active"),
                    OverdueCount = g.Count(b => b.Status == "Overdue"),
                    TotalFines = g.Sum(b => b.FineAmount)
                })
                .FirstOrDefaultAsync();

            var detailDto = new UserDetailDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                TotalBorrowed = borrowStats?.TotalBorrowed ?? 0,
                CurrentlyBorrowing = borrowStats?.CurrentlyBorrowing ?? 0,
                OverdueCount = borrowStats?.OverdueCount ?? 0,
                TotalFines = borrowStats?.TotalFines ?? 0
            };

            return Ok(detailDto);
        }

        // PUT: api/users/{id} - Cap nhat thong tin nguoi dung (Ho ten, Email, Vai tro, Dat lai mat khau)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { Message = $"Khong tim thay nguoi dung voi ma #{id}." });
            }

            // Kiem tra trung lap Email voi tai khoan khac
            var emailConflict = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != id);
            if (emailConflict)
            {
                return BadRequest(new { Message = "Dia chi email nay da duoc su dung boi tai khoan khac." });
            }

            // Ngan chan ha quyen admin neu chi con 1 admin duy nhat
            if (user.Role == "Admin" && dto.Role == "User")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                {
                    return BadRequest(new { Message = "Khong the ha quyen tai khoan Admin duy nhat cua he thong." });
                }
            }

            user.FullName = dto.FullName.Trim();
            user.Email = dto.Email.Trim();
            user.Role = dto.Role;

            // Neu admin nhap mat khau moi thi ma hoa va cap nhat
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
                _logger.LogInformation("Admin da dat lai mat khau cho nguoi dung {Username}", user.Username);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Admin da cap nhat thong tin nguoi dung {Username} thanh cong", user.Username);

            return Ok(new
            {
                Message = $"Cap nhat thong tin nguoi dung {user.Username} thanh cong.",
                User = new
                {
                    user.Id,
                    user.Username,
                    user.FullName,
                    user.Email,
                    user.Role
                }
            });
        }

        // PUT: api/users/{id}/role - Thay doi vai tro nguoi dung (Admin hoac User)
        [HttpPut("{id:int}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { Message = $"Khong tim thay tai khoan co ma {id}." });
            }

            // Ngan chan admin tu tuoc quyen cua chinh minh neu chi con duy nhat 1 admin
            if (user.Username.ToLower() == "admin" && dto.Role == "User")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                {
                    return BadRequest(new { Message = "Khong the ha quyen tai khoan Admin duy nhat cua he thong." });
                }
            }

            user.Role = dto.Role;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin da cap nhat vai tro cua nguoi dung {Username} thanh {Role}", user.Username, user.Role);

            return Ok(new { Message = $"Da cap nhat vai tro nguoi dung {user.Username} thanh {user.Role}." });
        }
    }
}


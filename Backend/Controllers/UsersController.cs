using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;

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
        private readonly ILogger<UsersController> _logger;

        public UsersController(LibraryDbContext context, IMapper mapper, ILogger<UsersController> logger)
        {
            _context = context;
            _mapper = mapper;
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


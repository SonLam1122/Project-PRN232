using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;

namespace Project_PRN232.Controllers
{
    // Controller quan ly Danh sach sach yeu thich cua doc gia
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(LibraryDbContext context, IMapper mapper, ILogger<FavoritesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/favorites - Lay danh sach sach yeu thich cua doc gia hien tai
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoriteReadDto>>> GetMyFavorites()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Phiên làm việc không hợp lệ." });
            }

            var favorites = await _context.Favorites
                .Include(f => f.Book)
                    .ThenInclude(b => b!.Category)
                .Include(f => f.Book)
                    .ThenInclude(b => b!.Author)
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            var result = _mapper.Map<List<FavoriteReadDto>>(favorites);
            return Ok(result);
        }

        // GET: api/favorites/check/{bookId} - Kiem tra sach da duoc them vao yeu thich chua
        [HttpGet("check/{bookId}")]
        public async Task<ActionResult<FavoriteStatusDto>> CheckFavorite(int bookId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Phiên làm việc không hợp lệ." });
            }

            var isFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.BookId == bookId);

            return Ok(new FavoriteStatusDto
            {
                BookId = bookId,
                IsFavorite = isFavorite
            });
        }

        // POST: api/favorites/{bookId} - Them cuon sach vao danh sach yeu thich
        [HttpPost("{bookId}")]
        public async Task<IActionResult> AddFavorite(int bookId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Phiên làm việc không hợp lệ." });
            }

            var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
            if (!bookExists)
            {
                return NotFound(new { Message = $"Không tìm thấy cuốn sách có mã #{bookId}." });
            }

            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BookId == bookId);

            if (existingFavorite != null)
            {
                return Ok(new { Message = "Sách đã có sẵn trong danh sách yêu thích.", Id = existingFavorite.Id });
            }

            var favorite = new Favorite
            {
                UserId = userId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Doc gia {UserId} da them sach #{BookId} vao danh sach yeu thich", userId, bookId);

            return Ok(new { Message = "Thêm sách vào danh sách yêu thích thành công.", Id = favorite.Id });
        }

        // DELETE: api/favorites/{bookId} - Xoa cuon sach khoi danh sach yeu thich
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFavorite(int bookId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Phiên làm việc không hợp lệ." });
            }

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BookId == bookId);

            if (favorite == null)
            {
                return NotFound(new { Message = "Cuốn sách chưa có trong danh sách yêu thích." });
            }

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Doc gia {UserId} da xoa sach #{BookId} khoi danh sach yeu thich", userId, bookId);

            return Ok(new { Message = "Đã xóa sách khỏi danh sách yêu thích." });
        }
    }
}


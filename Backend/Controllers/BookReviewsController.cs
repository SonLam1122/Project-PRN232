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
    // Controller quan ly Danh gia va Nhan xet sach tu doc gia
    [ApiController]
    [Route("api/books/{bookId:int}/reviews")]
    public class BookReviewsController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BookReviewsController> _logger;

        public BookReviewsController(LibraryDbContext context, IMapper mapper, ILogger<BookReviewsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/books/{bookId}/reviews - Lay toan bo danh gia cua mot dau sach
        [HttpGet]
        public async Task<ActionResult<BookRatingSummaryDto>> GetReviewsByBook(int bookId)
        {
            var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
            if (!bookExists)
            {
                return NotFound(new { Message = $"Khong tim thay dau sach co ma #{bookId}." });
            }

            var reviews = await _context.BookReviews
                .Include(r => r.User)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var reviewDtos = _mapper.Map<List<BookReviewReadDto>>(reviews);
            var avgRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0;

            // Kiem tra nguoi dung hien tai da tung muon cuon sach nay chua
            bool userHasBorrowed = false;
            var currentUserIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                userHasBorrowed = await _context.BorrowRecords.AnyAsync(br => br.BookId == bookId && br.UserId == currentUserId);
            }

            return Ok(new BookRatingSummaryDto
            {
                BookId = bookId,
                AverageRating = avgRating,
                TotalReviews = reviews.Count,
                UserHasBorrowed = userHasBorrowed,
                Reviews = reviewDtos
            });
        }

        // POST: api/books/{bookId}/reviews - Gui danh gia va nhan xet sach moi
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddOrUpdateReview(int bookId, [FromBody] BookReviewCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Phien lam viec khong hop le." });
            }

            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == bookId);
            if (book == null)
            {
                return NotFound(new { Message = $"Khong tim thay dau sach co ma #{bookId}." });
            }

            // Kiem tra nguoi dung da tung muon cuon sach nay chua
            var hasBorrowed = await _context.BorrowRecords.AnyAsync(br => br.BookId == bookId && br.UserId == userId);
            if (!hasBorrowed)
            {
                return BadRequest(new { Message = "Bạn chỉ có thể đánh giá và nhận xét sau khi đã mượn cuốn sách này." });
            }

            // Kiem tra nguoi dung da danh gia cuon sach nay chua
            var existingReview = await _context.BookReviews
                .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

            if (existingReview != null)
            {
                // Cap nhat danh gia cu
                existingReview.Rating = dto.Rating;
                existingReview.Comment = dto.Comment.Trim();
                existingReview.CreatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation("Nguoi dung {UserId} da cap nhat danh gia cho sach #{BookId}", userId, bookId);
                return Ok(new { Message = "Cap nhat danh gia thanh cong.", ReviewId = existingReview.Id });
            }

            var newReview = new BookReview
            {
                BookId = bookId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _context.BookReviews.AddAsync(newReview);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Nguoi dung {UserId} da danh gia {Rating} sao cho sach #{BookId}", userId, dto.Rating, bookId);

            return CreatedAtAction(nameof(GetReviewsByBook), new { bookId }, new { Message = "Gui danh gia thanh cong.", ReviewId = newReview.Id });
        }

        // DELETE: api/books/{bookId}/reviews/{id} - Xoa danh gia (Danh cho Admin hoac chu nhan danh gia)
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int bookId, int id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdClaim, out int currentUserId))
            {
                return Unauthorized();
            }

            var review = await _context.BookReviews.FirstOrDefaultAsync(r => r.Id == id && r.BookId == bookId);
            if (review == null)
            {
                return NotFound(new { Message = $"Khong tim thay danh gia ma #{id} cua sach #{bookId}." });
            }

            // Chi cho phep chu danh gia hoac Admin xoa
            if (review.UserId != currentUserId && userRole != "Admin")
            {
                return Forbid();
            }

            _context.BookReviews.Remove(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Danh gia #{ReviewId} da duoc xoa boi nguoi dung {UserId}", id, currentUserId);

            return Ok(new { Message = $"Da xoa danh gia #{id} thanh cong." });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;

namespace Project_PRN232.Controllers
{
    // Controller thong ke bao cao so lieu he thong thu vien (Danh rieng cho Admin)
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StatisticsController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<StatisticsController> _logger;

        public StatisticsController(LibraryDbContext context, ILogger<StatisticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/statistics/summary - Lay bao cao thong ke tong quan he thong
        [HttpGet("summary")]
        public async Task<ActionResult<LibrarySummaryDto>> GetSummary()
        {
            _logger.LogInformation("Admin yeu cau bao cao thong ke tong hop he thong");

            var now = DateTime.UtcNow;

            var totalBooks = await _context.Books.CountAsync();
            var totalCopies = await _context.Books.SumAsync(b => b.Quantity);
            var totalAuthors = await _context.Authors.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            var totalRecords = await _context.BorrowRecords.CountAsync();
            var activeBorrowing = await _context.BorrowRecords.CountAsync(br => br.Status == "Borrowing");
            var overdueCount = await _context.BorrowRecords.CountAsync(br => br.Status == "Borrowing" && br.DueDate < now);
            var totalFines = await _context.BorrowRecords.SumAsync(br => br.FineAmount);

            var summary = new LibrarySummaryDto
            {
                TotalBooks = totalBooks,
                TotalCopiesInStock = totalCopies,
                TotalAuthors = totalAuthors,
                TotalCategories = totalCategories,
                TotalUsers = totalUsers,
                TotalBorrowRecords = totalRecords,
                ActiveBorrowingCount = activeBorrowing,
                OverdueCount = overdueCount,
                TotalFinesCollected = totalFines
            };

            return Ok(summary);
        }

        // GET: api/statistics/top-books - Top 5 sach duoc muon nhieu nhat
        [HttpGet("top-books")]
        public async Task<IActionResult> GetTopBorrowedBooks()
        {
            var topBooks = await _context.BorrowRecords
                .Include(br => br.Book)
                .GroupBy(br => new { br.BookId, br.Book!.Title, br.Book.Price, br.Book.ImageUrl })
                .Select(g => new
                {
                    BookId = g.Key.BookId,
                    Title = g.Key.Title,
                    ImageUrl = g.Key.ImageUrl,
                    Price = g.Key.Price,
                    BorrowCount = g.Count()
                })
                .OrderByDescending(x => x.BorrowCount)
                .Take(5)
                .ToListAsync();

            return Ok(topBooks);
        }

        // GET: api/statistics/category-distribution - Ty le dau sach va phieu muon theo the loai
        [HttpGet("category-distribution")]
        public async Task<IActionResult> GetCategoryDistribution()
        {
            var distribution = await _context.Categories
                .Select(c => new
                {
                    CategoryId = c.Id,
                    CategoryName = c.Name,
                    BookCount = c.Books.Count,
                    TotalCopies = c.Books.Sum(b => (int?)b.Quantity) ?? 0,
                    BorrowCount = c.Books.SelectMany(b => b.BorrowRecords).Count()
                })
                .OrderByDescending(x => x.BorrowCount)
                .ToListAsync();

            return Ok(distribution);
        }
    }
}


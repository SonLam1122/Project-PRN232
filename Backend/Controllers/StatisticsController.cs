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
    }
}


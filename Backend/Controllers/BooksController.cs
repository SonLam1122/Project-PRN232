using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;

namespace Project_PRN232.Controllers
{
    // Controller quan ly dau sach, tich hop OData, AutoMapper va Content Negotiation
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BooksController> _logger;

        public BooksController(LibraryDbContext context, IMapper mapper, ILogger<BooksController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // 1. GET: api/books - Lay danh sach tat ca sach, ho tro OData query va Content Negotiation
        [HttpGet]
        [EnableQuery(PageSize = 50)]
        [Produces("application/json", "application/xml", "text/csv")]
        public ActionResult<IQueryable<BookReadDto>> GetAllBooks()
        {
            _logger.LogInformation("Dang thuc thi truy van danh sach sach voi OData");
            var query = _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsNoTracking()
                .ProjectTo<BookReadDto>(_mapper.ConfigurationProvider);

            return Ok(query);
        }

        // 2. GET: api/books/{id} - Lay chi tiet mot dau sach theo ma dinh danh
        [HttpGet("{id:int}")]
        [Produces("application/json", "application/xml", "text/csv")]
        public async Task<ActionResult<BookReadDto>> GetBookById(int id)
        {
            _logger.LogInformation("Tim kiem sach voi Id: {BookId}", id);

            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                _logger.LogWarning("Khong tim thay sach voi Id: {BookId}", id);
                return NotFound(new { Message = $"Khong tim thay sach co ma {id}." });
            }

            var result = _mapper.Map<BookReadDto>(book);
            return Ok(result);
        }

        // 3. POST: api/books - Them moi mot dau sach vao he thong (Chi danh cho Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public async Task<ActionResult<BookReadDto>> CreateBook([FromBody] BookCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiem tra tac gia co ton tai khong
            var authorExists = await _context.Authors.AnyAsync(a => a.Id == createDto.AuthorId);
            if (!authorExists)
            {
                _logger.LogWarning("Tao sach that bai: Khong ton tai AuthorId {AuthorId}", createDto.AuthorId);
                return BadRequest(new { Message = $"Khong ton tai tac gia voi ma {createDto.AuthorId}." });
            }

            // Kiem tra the loai co ton tai khong
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == createDto.CategoryId);
            if (!categoryExists)
            {
                _logger.LogWarning("Tao sach that bai: Khong ton tai CategoryId {CategoryId}", createDto.CategoryId);
                return BadRequest(new { Message = $"Khong ton tai the loai voi ma {createDto.CategoryId}." });
            }

            // Kiem tra ISBN da ton tai chua
            var isbnExists = await _context.Books.AnyAsync(b => b.ISBN == createDto.ISBN);
            if (isbnExists)
            {
                _logger.LogWarning("Tao sach that bai: ISBN {ISBN} da bi trung", createDto.ISBN);
                return BadRequest(new { Message = $"Ma ISBN {createDto.ISBN} da ton tai trong he thong." });
            }

            var book = _mapper.Map<Book>(createDto);
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            // Load thong tin Author va Category de tra ve BookReadDto day du
            await _context.Entry(book).Reference(b => b.Author).LoadAsync();
            await _context.Entry(book).Reference(b => b.Category).LoadAsync();
            var readDto = _mapper.Map<BookReadDto>(book);

            _logger.LogInformation("Them moi sach thanh cong voi Id: {BookId}", book.Id);
            return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, readDto);
        }

        // 4. PUT: api/books/{id} - Cap nhat thong tin dau sach (Chi danh cho Admin)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] BookUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == id);
            if (book == null)
            {
                _logger.LogWarning("Cap nhat that bai: Khong tim thay sach Id {BookId}", id);
                return NotFound(new { Message = $"Khong tim thay sach co ma {id}." });
            }

            // Kiem tra tac gia ton tai
            var authorExists = await _context.Authors.AnyAsync(a => a.Id == updateDto.AuthorId);
            if (!authorExists)
            {
                _logger.LogWarning("Cap nhat that bai: Khong ton tai AuthorId {AuthorId}", updateDto.AuthorId);
                return BadRequest(new { Message = $"Khong ton tai tac gia voi ma {updateDto.AuthorId}." });
            }

            // Kiem tra the loai ton tai
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == updateDto.CategoryId);
            if (!categoryExists)
            {
                _logger.LogWarning("Cap nhat that bai: Khong ton tai CategoryId {CategoryId}", updateDto.CategoryId);
                return BadRequest(new { Message = $"Khong ton tai the loai voi ma {updateDto.CategoryId}." });
            }

            // Kiem tra neu doi ISBN co bi trung voi sach khac khong
            var isbnConflict = await _context.Books.AnyAsync(b => b.ISBN == updateDto.ISBN && b.Id != id);
            if (isbnConflict)
            {
                _logger.LogWarning("Cap nhat that bai: ISBN {ISBN} trung voi sach khac", updateDto.ISBN);
                return BadRequest(new { Message = $"Ma ISBN {updateDto.ISBN} da bi trung lap voi sach khac." });
            }

            _mapper.Map(updateDto, book);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cap nhat sach Id {BookId} thanh cong", id);
            return NoContent();
        }

        // 5. DELETE: api/books/{id} - Xoa mot dau sach khoi he thong (Chi danh cho Admin)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.BorrowRecords)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                _logger.LogWarning("Xoa that bai: Khong tim thay sach Id {BookId}", id);
                return NotFound(new { Message = $"Khong tim thay sach co ma {id}." });
            }

            // Kiem tra sach co dang trong phieu muon chua hoan tat hay khong
            var isBeingBorrowed = book.BorrowRecords.Any(br => br.Status == "Borrowing");
            if (isBeingBorrowed)
            {
                return BadRequest(new { Message = "Khong the xoa sach vi dang co doc gia muon chua tra." });
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Da xoa sach Id {BookId} thanh cong", id);
            return NoContent();
        }
    }
}

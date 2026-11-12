using System.Security.Claims;
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
    // Controller quan ly nghiep vu Muon va Tra sach
    [ApiController]
    [Route("api/[controller]")]
    public class BorrowRecordsController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BorrowRecordsController> _logger;

        public BorrowRecordsController(LibraryDbContext context, IMapper mapper, ILogger<BorrowRecordsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/borrowrecords - Lay tat ca phieu muon voi OData query (Chi danh cho Admin)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [EnableQuery(PageSize = 50)]
        public ActionResult<IQueryable<BorrowRecordReadDto>> GetAllRecords()
        {
            _logger.LogInformation("Admin dang lay danh sach toan bo phieu muon");
            var query = _context.BorrowRecords
                .Include(br => br.User)
                .Include(br => br.Book)
                .AsNoTracking()
                .ProjectTo<BorrowRecordReadDto>(_mapper.ConfigurationProvider);

            return Ok(query);
        }

        // GET: api/borrowrecords/my-history - Lay lich su muon sach cua chinh nguoi dung hien tai
        [HttpGet("my-history")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BorrowRecordReadDto>>> GetMyHistory()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { Message = "Khong xac dinh duoc thong tin tai khoan." });
            }

            var records = await _context.BorrowRecords
                .Include(br => br.User)
                .Include(br => br.Book)
                .Where(br => br.UserId == userId)
                .OrderByDescending(br => br.BorrowDate)
                .AsNoTracking()
                .ProjectTo<BorrowRecordReadDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/borrowrecords/{id} - Lay chi tiet mot phieu muon
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<BorrowRecordReadDto>> GetRecordById(int id)
        {
            var record = await _context.BorrowRecords
                .Include(br => br.User)
                .Include(br => br.Book)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (record == null)
            {
                return NotFound(new { Message = $"Khong tim thay phieu muon ma {id}." });
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin" && record.UserId.ToString() != userIdStr)
            {
                return Forbid();
            }

            return Ok(_mapper.Map<BorrowRecordReadDto>(record));
        }

        // POST: api/borrowrecords/borrow - Dang ky muon mot dau sach
        [HttpPost("borrow")]
        [Authorize]
        public async Task<ActionResult<BorrowRecordReadDto>> BorrowBook([FromBody] BorrowCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { Message = "Khong xac dinh duoc ma nguoi dung." });
            }

            // Kiem tra han muon phai sau thoi diem hien tai
            if (dto.DueDate <= DateTime.UtcNow.Date)
            {
                return BadRequest(new { Message = "Han tra sach phai la mot ngay trong tuong lai." });
            }

            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.BookId);
            if (book == null)
            {
                return NotFound(new { Message = $"Khong tim thay dau sach co ma {dto.BookId}." });
            }

            // Kiem tra so luong sach ton kho
            if (book.Quantity <= 0)
            {
                return BadRequest(new { Message = $"Cuon sach '{book.Title}' da het so luong de muon." });
            }

            // Kiem tra nguoi dung co dang muon cuon sach nay va chua tra hay khong
            var alreadyBorrowing = await _context.BorrowRecords
                .AnyAsync(br => br.UserId == userId && br.BookId == dto.BookId && br.Status == "Borrowing");
            if (alreadyBorrowing)
            {
                return BadRequest(new { Message = "Ban dang muon cuon sach nay va chua tra, khong the muon them." });
            }

            // Giam so luong ton kho cua sach di 1
            book.Quantity -= 1;

            var newRecord = new BorrowRecord
            {
                UserId = userId,
                BookId = dto.BookId,
                BorrowDate = DateTime.UtcNow,
                DueDate = dto.DueDate,
                Status = "Borrowing",
                FineAmount = 0,
                Notes = dto.Notes
            };

            await _context.BorrowRecords.AddAsync(newRecord);
            await _context.SaveChangesAsync();

            // Load thong tin de tra ve DTO day du
            await _context.Entry(newRecord).Reference(r => r.User).LoadAsync();
            await _context.Entry(newRecord).Reference(r => r.Book).LoadAsync();

            _logger.LogInformation("Nguoi dung {UserId} muon thanh cong sach {BookId}, ma phieu: {RecordId}", userId, dto.BookId, newRecord.Id);

            return CreatedAtAction(nameof(GetRecordById), new { id = newRecord.Id }, _mapper.Map<BorrowRecordReadDto>(newRecord));
        }

        // PUT: api/borrowrecords/{id}/return - Tra sach va tinh tien phat tre han (neu co)
        [HttpPut("{id:int}/return")]
        [Authorize]
        public async Task<IActionResult> ReturnBook(int id, [FromBody] BorrowReturnDto? dto)
        {
            var record = await _context.BorrowRecords
                .Include(br => br.Book)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (record == null)
            {
                return NotFound(new { Message = $"Khong tim thay phieu muon co ma {id}." });
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin" && record.UserId.ToString() != userIdStr)
            {
                return Forbid();
            }

            if (record.Status == "Returned")
            {
                return BadRequest(new { Message = "Phieu muon nay da duoc tra sach truoc do." });
            }

            var returnTime = DateTime.UtcNow;
            record.ReturnDate = returnTime;
            record.Status = "Returned";

            if (dto != null && !string.IsNullOrWhiteSpace(dto.Notes))
            {
                record.Notes = dto.Notes;
            }

            // Tinh tien phat neu tra tre han: 5,000 VND moi ngay tre
            if (returnTime.Date > record.DueDate.Date)
            {
                var overdueDays = (returnTime.Date - record.DueDate.Date).Days;
                record.FineAmount = overdueDays * 5000;
            }

            // Hoan tra lai so luong sach ton kho
            if (record.Book != null)
            {
                record.Book.Quantity += 1;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Tra sach thanh cong cho phieu muon {RecordId}, tien phat: {Fine}", record.Id, record.FineAmount);

            return Ok(new
            {
                Message = "Tra sach thanh cong.",
                RecordId = record.Id,
                ReturnDate = record.ReturnDate,
                FineAmount = record.FineAmount
            });
        }
    }
}


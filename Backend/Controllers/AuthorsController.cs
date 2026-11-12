using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;

namespace Project_PRN232.Controllers
{
    // Controller quan ly thong tin Tac gia sach
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorsController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthorsController> _logger;

        public AuthorsController(LibraryDbContext context, IMapper mapper, ILogger<AuthorsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/authors - Lay danh sach tat ca tac gia
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuthorReadDto>>> GetAuthors()
        {
            var authors = await _context.Authors
                .Include(a => a.Books)
                .AsNoTracking()
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<AuthorReadDto>>(authors));
        }

        // GET: api/authors/{id} - Lay chi tiet tac gia theo ma
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AuthorReadDto>> GetAuthorById(int id)
        {
            var author = await _context.Authors
                .Include(a => a.Books)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (author == null)
            {
                return NotFound(new { Message = $"Khong tim thay tac gia co ma {id}." });
            }

            return Ok(_mapper.Map<AuthorReadDto>(author));
        }

        // POST: api/authors - Them moi tac gia (Chi danh cho Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AuthorReadDto>> CreateAuthor([FromBody] AuthorCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var author = _mapper.Map<Author>(dto);
            author.FullName = dto.FullName.Trim();
            await _context.Authors.AddAsync(author);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin da them moi tac gia {FullName} voi Id {Id}", author.FullName, author.Id);

            var readDto = _mapper.Map<AuthorReadDto>(author);
            return CreatedAtAction(nameof(GetAuthorById), new { id = author.Id }, readDto);
        }

        // PUT: api/authors/{id} - Cap nhat thong tin tac gia (Chi danh cho Admin)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAuthor(int id, [FromBody] AuthorUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var author = await _context.Authors.FirstOrDefaultAsync(a => a.Id == id);
            if (author == null)
            {
                return NotFound(new { Message = $"Khong tim thay tac gia co ma {id}." });
            }

            _mapper.Map(dto, author);
            author.FullName = dto.FullName.Trim();
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin cap nhat tac gia Id {Id} thanh cong", id);
            return NoContent();
        }

        // DELETE: api/authors/{id} - Xoa tac gia (Chi danh cho Admin)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors
                .Include(a => a.Books)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (author == null)
            {
                return NotFound(new { Message = $"Khong tim thay tac gia co ma {id}." });
            }

            // Kiem tra rang buoc toan ven: khong xoa tac gia neu van con sach
            if (author.Books.Any())
            {
                return BadRequest(new { Message = "Khong the xoa tac gia vi van con sach trong thu vien." });
            }

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin da xoa tac gia Id {Id}", id);
            return NoContent();
        }
    }
}

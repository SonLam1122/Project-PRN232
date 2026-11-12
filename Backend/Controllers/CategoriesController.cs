using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_PRN232.Data;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;

namespace Project_PRN232.Controllers
{
    // Controller quan ly The loai sach
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(LibraryDbContext context, IMapper mapper, ILogger<CategoriesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/categories - Lay danh sach tat ca the loai
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryReadDto>>> GetCategories()
        {
            _logger.LogInformation("Dang lay danh sach the loai sach");
            var categories = await _context.Categories
                .Include(c => c.Books)
                .AsNoTracking()
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<CategoryReadDto>>(categories));
        }

        // GET: api/categories/{id} - Lay chi tiet the loai theo ID
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CategoryReadDto>> GetCategoryById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Books)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { Message = $"Khong tim thay the loai co ma {id}." });
            }

            return Ok(_mapper.Map<CategoryReadDto>(category));
        }

        // POST: api/categories - Them the loai moi (Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryReadDto>> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var nameExists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower());
            if (nameExists)
            {
                return BadRequest(new { Message = $"The loai '{dto.Name}' da ton tai." });
            }

            var category = _mapper.Map<Category>(dto);
            category.Name = dto.Name.Trim();
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<CategoryReadDto>(category);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, readDto);
        }

        // PUT: api/categories/{id} - Cap nhat the loai (Admin)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return NotFound(new { Message = $"Khong tim thay the loai co ma {id}." });
            }

            var nameConflict = await _context.Categories.AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower() && c.Id != id);
            if (nameConflict)
            {
                return BadRequest(new { Message = $"Ten the loai '{dto.Name}' bi trung lap voi the loai khac." });
            }

            _mapper.Map(dto, category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/categories/{id} - Xoa the loai (Admin)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { Message = $"Khong tim thay the loai co ma {id}." });
            }

            // Kiem tra rang buoc toan ven: neu co sach thuoc the loai nay thi khong cho xoa
            if (category.Books.Any())
            {
                return BadRequest(new { Message = "Khong the xoa the loai vi van con sach thuoc the loai nay." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


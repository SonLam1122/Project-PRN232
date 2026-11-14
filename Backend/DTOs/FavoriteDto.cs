namespace Project_PRN232.DTOs
{
    // DTO tra ve thong tin dau sach trong danh sach yeu thich cua doc gia
    public class FavoriteReadDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookIsbn { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO tra ve trang thai da yeu thich hay chua
    public class FavoriteStatusDto
    {
        public int BookId { get; set; }
        public bool IsFavorite { get; set; }
    }
}


namespace Project_PRN232.DTOs
{
    // DTO tra ve thong ke tong quan he thong thu vien
    public class LibrarySummaryDto
    {
        public int TotalBooks { get; set; }
        public int TotalCopiesInStock { get; set; }
        public int TotalAuthors { get; set; }
        public int TotalCategories { get; set; }
        public int TotalUsers { get; set; }
        public int TotalBorrowRecords { get; set; }
        public int ActiveBorrowingCount { get; set; }
        public int OverdueCount { get; set; }
        public decimal TotalFinesCollected { get; set; }
    }
}


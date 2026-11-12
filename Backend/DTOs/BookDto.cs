using System.ComponentModel.DataAnnotations;

namespace Project_PRN232.DTOs
{
    // DTO tra ve thong tin dau sach
    public class BookReadDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public DateTime PublishedDate { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    // DTO nhan du lieu tao moi dau sach voi validate chat che
    public class BookCreateDto
    {
        [Required(ErrorMessage = "Tieu de sach la bat buoc")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Tieu de tu 1 den 200 ky tu")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ma ISBN la bat buoc")]
        [RegularExpression(@"^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$", 
            ErrorMessage = "Dinh dang ma ISBN khong hop le theo tieu chuan")]
        [StringLength(20, ErrorMessage = "ISBN toi da 20 ky tu")]
        public string ISBN { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Mo ta toi da 1000 ky tu")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Gia sach la bat buoc")]
        [Range(1000.0, 50000000.0, ErrorMessage = "Gia sach phai tu 1,000 den 50,000,000")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "So luong la bat buoc")]
        [Range(0, 10000, ErrorMessage = "So luong ton kho tu 0 den 10,000")]
        public int Quantity { get; set; }

        [DataType(DataType.Date)]
        public DateTime PublishedDate { get; set; } = DateTime.UtcNow;

        [Required(ErrorMessage = "Ma tac gia la bat buoc")]
        [Range(1, int.MaxValue, ErrorMessage = "Ma tac gia phai la so nguyen duong hop le")]
        public int AuthorId { get; set; }

        [Required(ErrorMessage = "Ma the loai la bat buoc")]
        [Range(1, int.MaxValue, ErrorMessage = "Ma the loai phai la so nguyen duong hop le")]
        public int CategoryId { get; set; }
    }

    // DTO nhan du lieu cap nhat dau sach
    public class BookUpdateDto
    {
        [Required(ErrorMessage = "Tieu de sach la bat buoc")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Tieu de tu 1 den 200 ky tu")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ma ISBN la bat buoc")]
        [RegularExpression(@"^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$", 
            ErrorMessage = "Dinh dang ma ISBN khong hop le theo tieu chuan")]
        [StringLength(20, ErrorMessage = "ISBN toi da 20 ky tu")]
        public string ISBN { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Mo ta toi da 1000 ky tu")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Gia sach la bat buoc")]
        [Range(1000.0, 50000000.0, ErrorMessage = "Gia sach phai tu 1,000 den 50,000,000")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "So luong la bat buoc")]
        [Range(0, 10000, ErrorMessage = "So luong ton kho tu 0 den 10,000")]
        public int Quantity { get; set; }

        [DataType(DataType.Date)]
        public DateTime PublishedDate { get; set; }

        [Required(ErrorMessage = "Ma tac gia la bat buoc")]
        [Range(1, int.MaxValue, ErrorMessage = "Ma tac gia phai la so nguyen duong hop le")]
        public int AuthorId { get; set; }

        [Required(ErrorMessage = "Ma the loai la bat buoc")]
        [Range(1, int.MaxValue, ErrorMessage = "Ma the loai phai la so nguyen duong hop le")]
        public int CategoryId { get; set; }
    }
}

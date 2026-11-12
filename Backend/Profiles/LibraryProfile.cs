using AutoMapper;
using Project_PRN232.DTOs;
using Project_PRN232.Entities;

namespace Project_PRN232.Profiles
{
    // Profile cau hinh AutoMapper giua cac Entity va DTO
    public class LibraryProfile : Profile
    {
        public LibraryProfile()
        {
            // Anh xa Author
            CreateMap<Author, AuthorReadDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books.Count));
            CreateMap<AuthorCreateDto, Author>();
            CreateMap<AuthorUpdateDto, Author>();

            // Anh xa Category
            CreateMap<Category, CategoryReadDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books.Count));
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<CategoryUpdateDto, Category>();

            // Anh xa Book
            CreateMap<Book, BookReadDto>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author != null ? src.Author.FullName : string.Empty))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));
            CreateMap<BookCreateDto, Book>();
            CreateMap<BookUpdateDto, Book>();

            // Anh xa BorrowRecord
            CreateMap<BorrowRecord, BorrowRecordReadDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty))
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty))
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book != null ? src.Book.Title : string.Empty))
                .ForMember(dest => dest.ISBN, opt => opt.MapFrom(src => src.Book != null ? src.Book.ISBN : string.Empty));

            // Anh xa User
            CreateMap<User, UserSummaryDto>();
        }
    }
}

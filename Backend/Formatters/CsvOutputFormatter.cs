using System.Collections;
using System.Text;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;
using Project_PRN232.DTOs;

namespace Project_PRN232.Formatters
{
    // Custom Media Formatter de xu ly Content Negotiation voi dinh dang text/csv
    public class CsvOutputFormatter : TextOutputFormatter
    {
        public CsvOutputFormatter()
        {
            SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("text/csv"));
            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
        }

        protected override bool CanWriteType(Type? type)
        {
            if (type == null)
            {
                return false;
            }

            return typeof(BookReadDto).IsAssignableFrom(type) ||
                   typeof(IEnumerable<BookReadDto>).IsAssignableFrom(type) ||
                   typeof(IEnumerable).IsAssignableFrom(type);
        }

        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            var response = context.HttpContext.Response;
            var buffer = new StringBuilder();

            if (context.Object is IEnumerable<BookReadDto> books)
            {
                FormatBooksCsv(buffer, books);
            }
            else if (context.Object is BookReadDto singleBook)
            {
                FormatBooksCsv(buffer, new[] { singleBook });
            }
            else if (context.Object is IEnumerable list)
            {
                var bookList = list.OfType<BookReadDto>().ToList();
                if (bookList.Any())
                {
                    FormatBooksCsv(buffer, bookList);
                }
            }

            await response.WriteAsync(buffer.ToString(), selectedEncoding);
        }

        private static void FormatBooksCsv(StringBuilder buffer, IEnumerable<BookReadDto> books)
        {
            // Tao dong tieu de cot CSV
            buffer.AppendLine("Id,Title,ISBN,CategoryName,Price,Quantity,AuthorName,PublishedDate");

            // Ghi tung dong du lieu theo chuan RFC 4180
            foreach (var b in books)
            {
                var title = EscapeCsv(b.Title);
                var isbn = EscapeCsv(b.ISBN);
                var category = EscapeCsv(b.CategoryName);
                var authorName = EscapeCsv(b.AuthorName);
                var date = b.PublishedDate.ToString("yyyy-MM-dd");

                buffer.AppendLine($"{b.Id},{title},{isbn},{category},{b.Price},{b.Quantity},{authorName},{date}");
            }
        }

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }

            return value;
        }
    }
}

using System.Text;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;
using Project_PRN232.DTOs;

namespace Project_PRN232.Formatters
{
    // Chuyen collection OData sang List truoc khi serialize XML.
    public class BookXmlOutputFormatter : TextOutputFormatter
    {
        public BookXmlOutputFormatter()
        {
            SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("application/xml"));
            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
        }

        protected override bool CanWriteType(Type? type)
        {
            return type != null && typeof(IEnumerable<BookReadDto>).IsAssignableFrom(type);
        }

        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            var books = ((IEnumerable<BookReadDto>)context.Object!).ToList();
            using var buffer = new MemoryStream();
            // Serialize trong bo nho de khong ghi dong bo len HTTP response.
            using (var writer = XmlWriter.Create(buffer, new XmlWriterSettings { Encoding = selectedEncoding }))
            {
                new XmlSerializer(typeof(List<BookReadDto>)).Serialize(writer, books);
            }

            buffer.Position = 0;
            await buffer.CopyToAsync(context.HttpContext.Response.Body, context.HttpContext.RequestAborted);
        }
    }
}

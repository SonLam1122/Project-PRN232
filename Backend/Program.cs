using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Project_PRN232.Data;
using Project_PRN232.Formatters;
using Project_PRN232.Middlewares;
using Project_PRN232.Profiles;
using Project_PRN232.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cau hinh Entity Framework Core voi SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(connectionString));

// Luu khoa DataProtection trong thu muc du an
var keysDirectory = new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys"));
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(keysDirectory)
    .SetApplicationName("PRN232_LibrarySystem");

// 2. Dang ky cac dich vu nghiep vu va bao mat
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// 3. Dang ky AutoMapper
builder.Services.AddAutoMapper(typeof(LibraryProfile));

// 4. Cau hinh Controllers, Content Negotiation, Custom Formatter va OData
builder.Services.AddControllers(options =>
{
    // Bat tinh nang Content Negotiation theo header Accept
    options.RespectBrowserAcceptHeader = true;
    // Dang ky Custom CSV Formatter
    options.OutputFormatters.Add(new CsvOutputFormatter());
    // XML serializer mac dinh khong ho tro EnumerableQuery tu OData.
    options.OutputFormatters.Add(new BookXmlOutputFormatter());
})
.AddXmlSerializerFormatters() // Ho tro dinh dang XML
.AddOData(opt => opt.Select().Filter().OrderBy().Expand().Count().SetMaxTop(100)); // Bat tinh nang OData

// 5. Cau hinh xac thuc JWT Authentication
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"] ?? "PRN232_DefaultSecretKey_ForSecurity_32Bytes_Min";
var issuer = jwtSection["Issuer"] ?? "PRN232_LibraryManagementApi";
var audience = jwtSection["Audience"] ?? "PRN232_LibraryManagementClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 6. Cau hinh CORS cho client goi AJAX
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 7. Cau hinh Swagger/OpenAPI tich hop xac thuc JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PRN232 Library Management Web API",
        Version = "v1",
        Description = "He thong RESTful Web API quan ly thu vien sach theo chuan PRN232"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhap JWT Token theo dinh dang: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 8. Xu ly ngoai le toan cuc
app.UseMiddleware<GlobalExceptionMiddleware>();

// 9. Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PRN232 Library API v1");
    });
}

app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

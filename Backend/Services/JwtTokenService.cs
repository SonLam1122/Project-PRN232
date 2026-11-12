using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Project_PRN232.Entities;

namespace Project_PRN232.Services
{
    // Dịch vụ sinh token JWT chua thong tin dinh danh va vai tro nguoi dung
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string Token, DateTime Expiration) GenerateToken(User user)
        {
            var jwtSection = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSection["SecretKey"] ?? "PRN232_DefaultSecretKey_ForSecurity_32Bytes_Min";
            var issuer = jwtSection["Issuer"] ?? "PRN232_LibraryManagementApi";
            var audience = jwtSection["Audience"] ?? "PRN232_LibraryManagementClient";
            var expiryMinutes = int.TryParse(jwtSection["ExpiryMinutes"], out var minutes) ? minutes : 180;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiration,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return (tokenHandler.WriteToken(token), expiration);
        }
    }
}


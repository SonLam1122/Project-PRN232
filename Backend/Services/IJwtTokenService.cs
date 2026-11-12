using Project_PRN232.Entities;

namespace Project_PRN232.Services
{
    // Interface tao JWT token cho nguoi dung da xac thuc
    public interface IJwtTokenService
    {
        (string Token, DateTime Expiration) GenerateToken(User user);
    }
}


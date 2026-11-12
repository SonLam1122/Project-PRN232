namespace Project_PRN232.Services
{
    // Interface ma hoa va xac thuc mat khau
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }
}


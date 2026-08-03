using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Auth;
using Final_Ecommerce.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Final_Ecommerce.Services
{
    public class AuthServices : IAuthServices
    {
        public readonly UserManager<User> userManager;
        private readonly IConfiguration configuration;
        private readonly ApplicationDbContext context;
        public AuthServices(UserManager<User> userManager, IConfiguration configuration, ApplicationDbContext context)
        {
            this.userManager = userManager;
            this.configuration = configuration;
            this.context = context;
        }
        public async Task<AuthResponse> Register(RegisterDTO register)
        {
            var ExistUser = await userManager.FindByEmailAsync(register.Email);
            if (ExistUser != null)
                throw new Exception("User already exists");
            var User = new User
            {
                UserName = register.FullName,
                Email = register.Email
            };
            var Result = await userManager.CreateAsync(User, register.Password);
            if (!Result.Succeeded)
            {
                throw new Exception("Error occurred while creating user");
            }
            // every new signup is a plain Customer by default —
            // promote to Seller/Admin manually (e.g. via a seed or an admin tool)
            await userManager.AddToRoleAsync(User, AppRoles.Customer);
            return await GenerateToken(User);
        }
        public async Task<AuthResponse> Login(LoginDTO login)
        {
            var ExistUser = await userManager.FindByEmailAsync(login.Email);
            if (ExistUser == null)
                throw new Exception("User does not exist");
            var Result = await userManager.CheckPasswordAsync(ExistUser, login.Password);
            if (!Result)
                throw new Exception("Invalid password");
            return await GenerateToken(ExistUser);
        }
        private async Task<AuthResponse> GenerateToken(User user)
        {
            var JwtSettengs = configuration.GetSection("JwtSettings");
            var Key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSettengs["SecretKey"]));
            var Creds = new SigningCredentials(Key, SecurityAlgorithms.HmacSha256);
            var Expires = DateTime.Now.AddDays(Convert.ToDouble(JwtSettengs["ExpiresInDays"]));
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName),
            };

            // only add the roles this user ACTUALLY has in the database
            var actualRoles = await userManager.GetRolesAsync(user);
            foreach (var role in actualRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: JwtSettengs["Issuer"],
                audience: JwtSettengs["Audience"],
                claims: claims,
                expires: Expires,
                signingCredentials: Creds
            );
            return new AuthResponse
            {
                Token = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token),
                Email = user.Email,
                FullName = user.UserName,
                ExpiresAt = Expires
            };
        }
        public async Task<string> RequestSeller(string userId)
        {
            var alreadyPending = await context.SellerRequests
                .AnyAsync(r => r.UserId == userId && r.Status == SellerRequestStatus.Pending);

            if (alreadyPending)
                throw new InvalidOperationException("You already have a pending request.");

            var isSeller = await userManager.IsInRoleAsync(await userManager.FindByIdAsync(userId), AppRoles.Seller);
            if (isSeller)
                throw new InvalidOperationException("You are already a seller.");

            context.SellerRequests.Add(new SellerRequest { UserId = userId });
            await context.SaveChangesAsync();
            return "Request submitted.";
        }

        public async Task<List<SellerRequestResponse>> GetPendingRequests()
        {
            return await context.SellerRequests
                .Include(r => r.User)
                .Where(r => r.Status == SellerRequestStatus.Pending)
                .Select(r => new SellerRequestResponse
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User.UserName,
                    Status = r.Status,
                    RequestedAt = r.RequestedAt
                }).ToListAsync();
        }

        public async Task<string> ApproveSellerRequest(int requestId)
        {
            var request = await context.SellerRequests.FindAsync(requestId);
            if (request == null) throw new KeyNotFoundException("Request not found.");

            var user = await userManager.FindByIdAsync(request.UserId);
            await userManager.AddToRoleAsync(user, AppRoles.Seller);

            request.Status = SellerRequestStatus.Approved;
            request.ReviewedAt = DateTime.Now;
            await context.SaveChangesAsync();
            return "Approved.";
        }

        public async Task<string> RejectSellerRequest(int requestId)
        {
            var request = await context.SellerRequests.FindAsync(requestId);
            if (request == null) throw new KeyNotFoundException("Request not found.");

            request.Status = SellerRequestStatus.Rejected;
            request.ReviewedAt = DateTime.Now;
            await context.SaveChangesAsync();
            return "Rejected.";
        }
    }
}
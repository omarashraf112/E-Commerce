using Final_Ecommerce.DTOs.Auth;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthServices authServices;
        public AuthController(IAuthServices authServices)
        {
            this.authServices = authServices;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO register)
        {
            var result = await authServices.Register(register);
            return Ok(result);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var result = await authServices.Login(login);
            return Ok(result);
        }
        [HttpPost("request-seller")]
        [Authorize]
        public async Task<IActionResult> RequestSeller()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await authServices.RequestSeller(userId);
            return Ok(result);
        }

        [HttpGet("seller-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSellerRequests()
        {
            var requests = await authServices.GetPendingRequests();
            return Ok(requests);
        }

        [HttpPost("seller-requests/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveSellerRequest(int id)
        {
            var result = await authServices.ApproveSellerRequest(id);
            return Ok(result);
        }

        [HttpPost("seller-requests/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectSellerRequest(int id)
        {
            var result = await authServices.RejectSellerRequest(id);
            return Ok(result);
        }
    }
}

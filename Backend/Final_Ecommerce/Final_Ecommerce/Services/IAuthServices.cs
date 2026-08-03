using Final_Ecommerce.DTOs.Auth;

namespace Final_Ecommerce.Services
{
    public interface IAuthServices
    {
        Task<AuthResponse> Register(RegisterDTO register);
        Task<AuthResponse> Login(LoginDTO login);
        Task<string> RequestSeller(string userId);
        Task<List<SellerRequestResponse>> GetPendingRequests();
        Task<string> ApproveSellerRequest(int requestId);
        Task<string> RejectSellerRequest(int requestId);
    }
}

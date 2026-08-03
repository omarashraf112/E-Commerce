using Final_Ecommerce.DTOs.Cart;

namespace Final_Ecommerce.Services
{
    public interface ICartServices
    {
        Task<CartItemResponse> AddToCartAsync(string userId, AddCart addCart);
        Task<List<CartItemResponse>> GetCArtAsync(string userId);
        Task<CartItemResponse> DeleteItem(string userId, int cartItemId);
        Task<string> DeleteCart(string UserId);
        Task<CartItemResponse> UpdateQuantity(int cartItemId, int newQuantity, string userId);
    }
}

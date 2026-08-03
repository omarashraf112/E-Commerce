using Final_Ecommerce.DTOs.Orders;
using Final_Ecommerce.Models;

namespace Final_Ecommerce.Services
{
    public interface IorderService
    {
        Task<OrderResponse> Checkout(string userId, string Address);
        Task<List<OrderSummaryResponse>> GetUserOrder(String userId);
        Task<List<OrderResponse>> GetOrderDetails(string userId, int orderId);
        Task DeleteOrder(string userId, int orderId);
        Task UpdateOrderStatus(int orderId, OrderStatus status);
        Task<List<OrderResponse>> GetAllOrders();
    }
}

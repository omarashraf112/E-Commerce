using Final_Ecommerce.Models;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IorderService orderService;
        public OrderController(IorderService orderService)
        {
            this.orderService = orderService;
        }
        [HttpPost("checkout")]
        [Authorize]
        public async Task<IActionResult> Checkout([FromQuery] string Address)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await orderService.Checkout(userId, Address);
            return Ok(order);
        }
        [HttpGet("summary")]
        [Authorize]
        public async Task<IActionResult> GetUserOrder()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orderSummary = await orderService.GetUserOrder(userId);
            return Ok(orderSummary);
        }
        [HttpGet("details")]
        [Authorize]
        public async Task<IActionResult> GetOrderDetails([FromQuery] int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orderDetails = await orderService.GetOrderDetails(userId, orderId);
            return Ok(orderDetails);
        }
        [HttpPatch("delete")]
        [Authorize]
        public async Task<IActionResult> CancelOrder([FromQuery] int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await orderService.DeleteOrder(userId, orderId);
            return Ok(new { message = "Order canceled successfully" });
        }
        [HttpPatch("status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus([FromQuery] int orderId, [FromQuery] OrderStatus status)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await orderService.UpdateOrderStatus(orderId, status);
            return Ok(new { message = "Order status updated successfully" });
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await orderService.GetAllOrders();
            return Ok(orders);
        }
    }
}

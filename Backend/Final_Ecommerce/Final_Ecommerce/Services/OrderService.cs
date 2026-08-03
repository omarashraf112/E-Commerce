using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Orders;
using Final_Ecommerce.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Final_Ecommerce.Services
{
    public class OrderService : IorderService
    {
        private readonly ApplicationDbContext context;
        public OrderService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<OrderResponse> Checkout(string userId, string Address)
        {
            var CartItems = await context.CartItems.
                Include(c => c.Product).
                Where(c => c.UserId == userId).ToListAsync();
            if (CartItems.Count == 0)
            {
                throw new Exception("Cart is empty");
            }
            if (CartItems == null)
            {
                throw new Exception("Cart is empty");
            }
            foreach (var item in CartItems)
            {
                if (item.Amount > item.Product.Stock)
                {
                    throw new Exception("Insufficient stock for product: " + item.Product.Name);
                }
                item.Product.Stock -= item.Amount;
            }
            var order = new Order
            {
                Address = Address,
                UserId = userId,
                CreatedAt = DateTime.Now,
                Total = CartItems.Sum(c => c.Amount * c.Product.Price),
                Status = OrderStatus.Pending,
                OrderItems = CartItems.Select(c => new OrderItem
                {
                    ProductId = c.ProductId,
                    Quantity = c.Amount,
                    Price = c.Product.Price
                }).ToList()
            };
            if (order == null)
            {
                throw new Exception("Failed to create order");
            }
            await context.AddRangeAsync(order);
            await context.SaveChangesAsync();
            context.CartItems.RemoveRange(CartItems);
            await context.SaveChangesAsync();
            return new OrderResponse
            {
                Id = order.Id,
                Status = order.Status.ToString(),
                Total = order.Total,
                Address = order.Address,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponse
                {
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

        }
        public async Task<List<OrderSummaryResponse>> GetUserOrder(String userId)
        {
            var orders = await context.Orders.
                Where(o => o.UserId == userId).
                OrderByDescending(o => o.CreatedAt).
                ToListAsync();
            if (orders == null)
            {
                throw new Exception("No orders found for user");
            }
            return orders.Select(o => new OrderSummaryResponse
            {
                Id = o.Id,
                Status = o.Status.ToString(),
                Total = o.Total,
                CreatedAt = o.CreatedAt
            }).ToList();
        }
        public async Task<List<OrderResponse>> GetOrderDetails(string userId, int orderId)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId && o.Id == orderId)
                .FirstOrDefaultAsync();
            if (order == null)
            {
                throw new Exception("order not found");
            }
            return new List<OrderResponse>
            {
                new OrderResponse
                {
                    Id = order.Id,
                    Status = order.Status.ToString(),
                    Total = order.Total,
                    Address = order.Address,
                    CreatedAt = order.CreatedAt,
                    Items = order.OrderItems.Select(oi => new OrderItemResponse
                    {
                        ProductName = oi.Product.Name,
                        ProductId = oi.ProductId,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                }
            };
        }
        public async Task DeleteOrder(string userId, int orderId)
        {
            var order = await context.Orders
                .Where(o => o.UserId == userId && o.Id == orderId)
                .FirstOrDefaultAsync();
            if (order.Status != OrderStatus.Pending)
            {
                throw new Exception("can not delete order");
            }
            order.Status = OrderStatus.Cancelled;
            await context.SaveChangesAsync();
        }
        public async Task UpdateOrderStatus(int orderId, OrderStatus status)
        {
            var order = await context.Orders
                .Where(o => o.Id == orderId)
                .FirstOrDefaultAsync();
            if (order == null)
            {
                throw new Exception("order not found");
            }
            order.Status = status;
            await context.SaveChangesAsync();
        }
        public async Task<List<OrderResponse>> GetAllOrders()
        {
            var orders = await context.Orders.
                Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            if (orders == null)
            {
                throw new Exception("No orders found");
            }
            return orders.Select(o => new OrderResponse
            {
                
                Id = o.Id,
                UserId = o.UserId,
                UserName = o.User.UserName,
                Status = o.Status.ToString(),
                Total = o.Total,
                Address = o.Address,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemResponse
                {
                    
                    ProductName = oi.Product.Name,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }
    }
}

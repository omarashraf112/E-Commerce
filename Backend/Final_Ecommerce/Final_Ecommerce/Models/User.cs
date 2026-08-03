using Microsoft.AspNetCore.Identity;

namespace Final_Ecommerce.Models
{
    public class User : IdentityUser
    {
        public List<Order>? Orders { get; set; } = new List<Order>();
        public List<CartItem>? CartItems { get; set; } = new List<CartItem>();
        public List<Review>? Reviews { get; set; } = new List<Review>();
        public List<Payment>? Payments { get; set; } = new List<Payment>();
    }
}

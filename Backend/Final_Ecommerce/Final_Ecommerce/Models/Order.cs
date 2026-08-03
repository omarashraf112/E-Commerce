using System.ComponentModel.DataAnnotations.Schema;

namespace Final_Ecommerce.Models
{
    public class Order
    {
        public int Id { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Address { get; set; }
        public decimal Total { get; set; } 
        [ForeignKey(nameof(User))]
        public string UserId { get; set; }

        public User User { get; set; }
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public Payment Payment { get; set; }
    }
}

using System.ComponentModel.DataAnnotations.Schema;

namespace Final_Ecommerce.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(Category))]
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public List<CartItem> CartItems { get; set; } = new List<CartItem>();
        public List<Review>? Reviews { get; set; } = new List<Review>();
    }
}

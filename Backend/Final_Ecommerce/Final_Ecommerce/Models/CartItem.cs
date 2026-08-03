using System.ComponentModel.DataAnnotations.Schema;

namespace Final_Ecommerce.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int Amount { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(Product))]
        public int ProductId { get; set; }
        public Product Product { get; set; }
        [ForeignKey(nameof(User))]  
        public string UserId { get; set; }
        public User User { get; set; }
    }
}

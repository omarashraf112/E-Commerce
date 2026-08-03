using System.ComponentModel.DataAnnotations.Schema;

namespace Final_Ecommerce.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment  { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(User))]
        public string UserId { get; set; }
        public User User { get; set; }
        [ForeignKey(nameof(Product))]   
        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}

using System.ComponentModel.DataAnnotations.Schema;

namespace Final_Ecommerce.Models
{
    public class SellerRequest
    {
        public int Id { get; set; }

        [ForeignKey(nameof(User))]
        public string UserId { get; set; }
        public User User { get; set; }

        public SellerRequestStatus Status { get; set; } = SellerRequestStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.Now;
        public DateTime? ReviewedAt { get; set; }

    }
}

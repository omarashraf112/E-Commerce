using Final_Ecommerce.Models;

namespace Final_Ecommerce.DTOs.Auth
{
    public class SellerRequestResponse
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public SellerRequestStatus Status { get; set; }
        public DateTime RequestedAt { get; set; }
    }
}

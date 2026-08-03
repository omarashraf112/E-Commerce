namespace Final_Ecommerce.DTOs.Orders
{
    public class OrderSummaryResponse
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

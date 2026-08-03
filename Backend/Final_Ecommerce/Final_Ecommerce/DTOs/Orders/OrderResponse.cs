namespace Final_Ecommerce.DTOs.Orders
{
    public class OrderResponse
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int Id { get; set; }
        public string Status { get; set; }
        public decimal Total { get; set; }
        public string Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemResponse> Items { get; set; } = new();
    }
}

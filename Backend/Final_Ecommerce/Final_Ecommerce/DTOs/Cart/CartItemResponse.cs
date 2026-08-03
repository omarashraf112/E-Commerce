namespace Final_Ecommerce.DTOs.Cart
{
    public class CartItemResponse
    {
        public int Id { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Subtotal => Price * Quantity;
    }
}

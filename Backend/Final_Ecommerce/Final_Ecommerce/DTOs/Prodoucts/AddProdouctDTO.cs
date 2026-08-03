namespace Final_Ecommerce.DTOs.Prodoucts
{
    public class AddProdouctDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public IFormFile ImageUrl { get; set; }
        public int CategoryId { get; set; }
    }
}

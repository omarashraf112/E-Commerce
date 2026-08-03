namespace Final_Ecommerce.DTOs.Review
{
    public class CreateReview
    {
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}

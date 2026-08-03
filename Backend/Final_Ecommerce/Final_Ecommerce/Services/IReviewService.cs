using Final_Ecommerce.DTOs.Review;

namespace Final_Ecommerce.Services
{
    public interface IReviewService
    {
        Task<ReviewResponse> CreateReview(string userId, CreateReview createReview);
        Task<ReviewResponse> UpdateReview(string userId, int id, UpdateReview updateReview);

        Task DeleteReview(string userId, int id);
        Task<List<ReviewResponse>> GetReviewsByProductId(int productId);

    }
}

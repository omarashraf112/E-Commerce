using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Review;
using Final_Ecommerce.Models;
using Microsoft.EntityFrameworkCore;

namespace Final_Ecommerce.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext context;

        public ReviewService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<ReviewResponse> CreateReview(string userId, CreateReview createReview)
        {
            // تأكد إنه اشترى المنتج ده بالتحديد واستلمه (مش أي أوردر Delivered عشوائي)
            var hasPurchased = await context.Orders
                .Where(o => o.UserId == userId && o.Status == OrderStatus.Delivered)
                .AnyAsync(o => o.OrderItems.Any(oi => oi.ProductId == createReview.ProductId));

            if (!hasPurchased)
                throw new InvalidOperationException("You can only review products you've purchased and received.");

            // تأكد إنه معملش review قبل كده لنفس المنتج
            var alreadyReviewed = await context.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == createReview.ProductId);

            if (alreadyReviewed)
                throw new InvalidOperationException("You have already reviewed this product.");

            var review = new Review
            {
                UserId = userId,
                ProductId = createReview.ProductId,
                Rating = createReview.Rating,
                Comment = createReview.Comment,
                CreatedAt = DateTime.Now
            };

            context.Reviews.Add(review);
            await context.SaveChangesAsync();

            // review.User مش هتكون محملة أصلاً (Review جديد)، فبنجيب اليوزر بنفسنا
            var user = await context.Users.FindAsync(userId);

            return new ReviewResponse
            {
                Id = review.Id,
                UserName = user!.UserName,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<ReviewResponse> UpdateReview(string userId, int id, UpdateReview updateReview)
        {
            var review = await context.Reviews.FindAsync(id);
            if (review == null)
                throw new KeyNotFoundException("Review not found.");

            if (review.UserId != userId)
                throw new InvalidOperationException("You can only update your own reviews.");

            review.Rating = updateReview.Rating;
            review.Comment = updateReview.Comment;
            await context.SaveChangesAsync();

            // برضه لازم نجيب اليوزر يدوي - review.User مش هتتحمل تلقائي بعد FindAsync
            var user = await context.Users.FindAsync(userId);

            return new ReviewResponse
            {
                Id = review.Id,
                UserName = user!.UserName,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task DeleteReview(string userId, int id)
        {
            var review = await context.Reviews.FindAsync(id);
            if (review == null)
                throw new KeyNotFoundException("Review not found.");

            // كانت ناقصة تمامًا - أي حد كان يقدر يمسح review أي حد تاني
            if (review.UserId != userId)
                throw new InvalidOperationException("You can only delete your own reviews.");

            context.Reviews.Remove(review);
            await context.SaveChangesAsync();
        }

        public async Task<List<ReviewResponse>> GetReviewsByProductId(int productId)
        {
            // هنا .Select() بتتنفذ كـ SQL JOIN فعلي على الـ DB نفسها
            // فـ r.User.UserName هنا شغالة صح، عكس الحالات التانية اللي فوق
            var reviews = await context.Reviews
                .Where(r => r.ProductId == productId)
                .Select(r => new ReviewResponse
                {
                    Id = r.Id,
                    UserName = r.User.UserName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return reviews;
        }
    }
}
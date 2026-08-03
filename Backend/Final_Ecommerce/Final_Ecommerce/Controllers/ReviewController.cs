using Final_Ecommerce.DTOs.Review;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReview createReview)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var review = await _reviewService.CreateReview(userId,createReview);
            return Ok(review);
        }
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetReviewsByProductId(int productId)
        {
            var reviews = await _reviewService.GetReviewsByProductId(productId);
            return Ok(reviews);
        }
        [HttpPatch("{reviewId}")]
        public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] UpdateReview updateReview)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var review = await _reviewService.UpdateReview(userId, reviewId, updateReview);
            return Ok(review);
        }
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await _reviewService.DeleteReview(userId, reviewId);
            return Ok();
        }
    }
}

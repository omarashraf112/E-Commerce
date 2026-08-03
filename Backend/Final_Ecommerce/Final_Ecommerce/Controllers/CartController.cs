using Final_Ecommerce.DTOs.Cart;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartServices _cartServices;
        public CartController(ICartServices cartServices)
        {
            this._cartServices = cartServices;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] AddCart addCart)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cartItem = await _cartServices.AddToCartAsync(userId,addCart);
            return Ok(cartItem);
        }
        [HttpGet("User")]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var user  = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cartItems = await _cartServices.GetCArtAsync(user);
            return Ok(cartItems);
        }
        [HttpDelete("item")]
        [Authorize]
        public async Task<IActionResult> DeleteItem([FromBody] int cartItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var deletedItem = await _cartServices.DeleteItem(userId, cartItemId);
            return Ok(deletedItem);
        }
        [HttpDelete("cart")]
        [Authorize]
        public async Task<IActionResult> DeleteCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _cartServices.DeleteCart(userId);
            return Ok(result);
        }
        [HttpPatch("item/quantity")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromQuery] int cartItemId,[FromQuery] int newQuantity)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var updatedItem = await _cartServices.UpdateQuantity(cartItemId, newQuantity, userId);
            return Ok(updatedItem);
        }
    }
}

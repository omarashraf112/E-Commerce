using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Cart;
using Final_Ecommerce.Models;
using Microsoft.EntityFrameworkCore;

namespace Final_Ecommerce.Services
{
    public class CartServices : ICartServices
    {
        private readonly ApplicationDbContext context;
        public CartServices(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<CartItemResponse> AddToCartAsync(string userId, AddCart addCart)
        {
            var product = await context.Products.FindAsync(addCart.ProductId);
            if (product == null)
            {
                throw new Exception("Product not found");
            }

            var existingCartItem = await context.CartItems
                .FirstOrDefaultAsync(c => c.ProductId == addCart.ProductId && c.UserId == userId);

            if (existingCartItem != null)
            {
                // Update the existing cart item
                existingCartItem.Amount += addCart.Quantity;
                await context.SaveChangesAsync();

                return new CartItemResponse
                {
                    Id = existingCartItem.Id,
                    ProductName = product.Name,
                    Price = product.Price,
                    Quantity = existingCartItem.Amount,
                    ImageUrl = product.ImageUrl
                };
            }
            else
            {
                var cartEntity = new CartItem
                {
                    ProductId = product.Id,
                    Amount = addCart.Quantity,
                    AddedAt = DateTime.UtcNow,
                    UserId = userId
                };

                await context.CartItems.AddAsync(cartEntity);
                await context.SaveChangesAsync();

                var cartItem = new CartItemResponse
                {
                    Id = cartEntity.Id,
                    ProductName = product.Name,
                    Price = product.Price,
                    Quantity = cartEntity.Amount,
                    ImageUrl = product.ImageUrl
                };

                return cartItem;
            }
        }
        public async Task<List<CartItemResponse>> GetCArtAsync(string userId)
        {
            var cart = await context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();
            if(cart == null || cart.Count == 0)
            {
                return new List<CartItemResponse>();
            }
         var response =  cart.Select(c => new CartItemResponse
          {
              Id = c.Id,
              ProductName = c.Product.Name,
              Price = c.Product.Price,
              Quantity = c.Amount,
              ImageUrl = c.Product.ImageUrl,
          }).ToList  ();
            return  response;
        }
        public async Task<CartItemResponse> DeleteItem (string userId, int cartItemId)
        {
            var cartItem = await context.CartItems
                .Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);
            if(cartItem == null)
            {
                throw new Exception("Cart item not found");
            }
            context.CartItems.Remove(cartItem);
            await context.SaveChangesAsync();
            return new CartItemResponse
            {
                Id = cartItem.Id,
                ProductName = cartItem.Product.Name,
                Price = cartItem.Product.Price,
                Quantity = cartItem.Amount,
                ImageUrl = cartItem.Product.ImageUrl
            };
        }   
        public async Task<string> DeleteCart (string UserId)
        {
            var cartitem = context.CartItems.Where(c => c.UserId == UserId);
            if (cartitem == null || !cartitem.Any())
            {
                throw new Exception("Cart not found");
            }
             context.CartItems.RemoveRange(cartitem);
            await context.SaveChangesAsync();
            return "Cart deleted successfully";
        }
        public async Task<CartItemResponse> UpdateQuantity(int cartItemId, int newQuantity ,string userId)
        {
            var cartitem = await context.CartItems.
                Include(c => c.Product).
                FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);
            if (cartitem == null)
            {
                throw new Exception("Cart item not found");
            }
            if (newQuantity <= 0)
            {
                throw new Exception("Quantity must be greater than zero");
            }
            cartitem.Amount = newQuantity;
            await context.SaveChangesAsync();
            return new CartItemResponse
            {
                Id = cartitem.Id,
                ProductName = cartitem.Product.Name,
                Price = cartitem.Product.Price,
                Quantity = cartitem.Amount,
                ImageUrl = cartitem.Product.ImageUrl
            };
        }
    }
}

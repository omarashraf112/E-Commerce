using Final_Ecommerce.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Final_Ecommerce.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager)
        {
            // check أدق - يعتمد على المستخدمين مش الـ Categories
            if (await context.Users.AnyAsync()) return;

            // 1. Categories
            var vegetables = new Category { Name = "Vegetables & Fruits", Description = "Fresh produce" };
            var dairy = new Category { Name = "Dairy & Eggs", Description = "Milk, cheese, eggs" };
            var bakery = new Category { Name = "Bakery", Description = "Bread and pastries" };

            context.Categories.AddRange(vegetables, dairy, bakery);
            await context.SaveChangesAsync();

            // 2. Products
            var avocado = new Product { Name = "Hass Avocado", Description = "Premium grade", Price = 45.00m, Stock = 100, CategoryId = vegetables.Id, ImageUrl = "/images/avocado.jpg" };
            var tomato = new Product { Name = "Local Tomatoes", Description = "2kg bag", Price = 12.00m, Stock = 200, CategoryId = vegetables.Id, ImageUrl = "/images/tomato.jpg" };
            var milk = new Product { Name = "Juhayna Full Cream Milk", Description = "1L", Price = 38.50m, Stock = 150, CategoryId = dairy.Id, ImageUrl = "/images/milk.jpg" };
            var bread = new Product { Name = "Fino Bread", Description = "Pack of 5", Price = 8.00m, Stock = 80, CategoryId = bakery.Id, ImageUrl = "/images/bread.jpg" };
            context.Products.AddRange(avocado, tomato, milk, bread);
            await context.SaveChangesAsync();

            // 3. Users
            var user1 = new User { UserName = "ahmed@email.com", Email = "ahmed@email.com" };
            await userManager.CreateAsync(user1, "Test@123");
            await userManager.AddToRoleAsync(user1, AppRoles.Customer);

            var adminUser = new User { UserName = "admin@email.com", Email = "admin@email.com" };
            await userManager.CreateAsync(adminUser, "Admin@123");
            await userManager.AddToRoleAsync(adminUser, AppRoles.Admin);

            // 4. CartItems
            context.CartItems.Add(new CartItem { UserId = user1.Id, ProductId = avocado.Id, Amount = 2 });
            await context.SaveChangesAsync();

            // 5. Orders + OrderItems
            var order1 = new Order
            {
                UserId = user1.Id,
                Status = OrderStatus.Delivered,
                Address = "12 Tahrir St, Cairo",
                CreatedAt = DateTime.Now.AddDays(-5)
            };
            context.Orders.Add(order1);
            await context.SaveChangesAsync();

            context.OrderItems.Add(new OrderItem
            {
                OrderId = order1.Id,
                ProductId = milk.Id,
                Quantity = 2,
                Price = milk.Price
            });
            await context.SaveChangesAsync();

            // 6. Payments
            context.Payments.Add(new Payment
            {
                OrderId = order1.Id,
                UserId = user1.Id,
                Amount = milk.Price * 2,
                Method = "COD",
                Status = PaymentStatus.Completed,
                CreatedAt = DateTime.Now.AddDays(-5)
            });
            await context.SaveChangesAsync();

            // 7. Reviews
            context.Reviews.Add(new Review
            {
                UserId = user1.Id,
                ProductId = milk.Id,
                Rating = 5,
                Comment = "Great quality, fast delivery!"
            });
            await context.SaveChangesAsync();
        }
    }
}
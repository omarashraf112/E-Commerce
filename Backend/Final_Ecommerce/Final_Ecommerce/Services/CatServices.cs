using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Category;
using Final_Ecommerce.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Final_Ecommerce.Services
{
    public class CatServices : ICatServices
    {
        public readonly ApplicationDbContext context;
        public CatServices(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<CatResponse> AddCategory(string userId, CatAdd catAdd) { 
            var NewCat = new Category
            {
                
                Name = catAdd.Name,
                Description = catAdd.Description
            };
            context.Categories.Add(NewCat);

            await context.SaveChangesAsync();
            return new CatResponse
            {
                Id = NewCat.Id,
                Name = NewCat.Name,
                Description = NewCat.Description
            };
        }
        public async Task<List<CatGetall>> GetAllCategories()
        {
            return await context.Categories.Select(c => new CatGetall
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToListAsync();
        }
        public async Task<CatResponse> GetCategoryById(int id)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null)
            {
                return null;
            }
            return new CatResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            };
        }
        public async Task<bool> DeleteCategory(string userId, int Id)
        {
            var cat = await context.Categories.FindAsync(Id);

            if (cat == null) return false;
            context.Categories.Remove(cat);
            await context.SaveChangesAsync();
            return true;
        }
}
}

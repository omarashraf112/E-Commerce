using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.Prodoucts;
using Final_Ecommerce.Models;
using Microsoft.EntityFrameworkCore;

namespace Final_Ecommerce.Services
{
    public class ProductServices : IProductServices
    {
        private readonly ApplicationDbContext context;
        public ProductServices(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<string> UploadImage(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                return null;
            }
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }
            return "/images/" + uniqueFileName; // Return the relative path to the uploaded image
        }
        public async Task<Prodouctresponse> AddProduct( AddProdouctDTO addProdouctDTO)
        {
            if (addProdouctDTO == null) return null;

            var pro = new Product
            {
                Name = addProdouctDTO.Name,
                Description = addProdouctDTO.Description,
                Stock = addProdouctDTO.Stock,
                Price = addProdouctDTO.Price,
                ImageUrl = await UploadImage(addProdouctDTO.ImageUrl),
                CategoryId = addProdouctDTO.CategoryId
            };

            context.Products.Add(pro);
            await context.SaveChangesAsync();
            return new Prodouctresponse
            {
                Id = pro.Id,
                Name = pro.Name,
                Description = pro.Description,
                Stock = pro.Stock,
                Price = pro.Price,
                ImageUrl = pro.ImageUrl,
                CategoryName = context.Categories.Find(pro.CategoryId)?.Name
            };

        }
        public async Task<Prodouctresponse> GetProductById(int id)
        {
            var pro = await context.Products.FindAsync(id);
            if (pro == null) return null;
            return new Prodouctresponse
            {
                Id = pro.Id,
                Name = pro.Name,
                Description = pro.Description,
                Stock = pro.Stock,
                Price = pro.Price,
                ImageUrl = pro.ImageUrl,
                CategoryName = context.Categories.Find(pro.CategoryId)?.Name
            };
        }
        public async Task<List<Prodouctresponse>> GetProductByCategory(int categoryId)
        {
            var products = await context.Products
                 .Include(p => p.Category).
                 Where(p => p.CategoryId == categoryId)
                 .Select(p => new Prodouctresponse
                 {
                     Id = p.Id,
                     Name = p.Name,
                     Description = p.Description,
                     Stock = p.Stock,
                     Price = p.Price,
                     ImageUrl = p.ImageUrl,
                     CategoryName = p.Category.Name
                 }).ToListAsync();
            return products;
        }
        public async Task<Prodouctresponse> Edit(int id, EditProductDTo editProdouctDTO)
        {
            var pro = await context.Products.FindAsync(id);
            if (pro == null) return null;
            pro.Price = editProdouctDTO.Price;
            pro.Stock = editProdouctDTO.Stock;
            context.Products.Update(pro);
            await context.SaveChangesAsync();
            return new Prodouctresponse
            {
                Id = pro.Id,
                Name = pro.Name,
                Description = pro.Description,
                Stock = pro.Stock,
                Price = pro.Price,
                ImageUrl = pro.ImageUrl,
                CategoryName = context.Categories.Find(pro.CategoryId)?.Name
            };
        }
        public async Task Delete(int id)
        {
            var pro = await context.Products.FindAsync(id);
            if (pro == null) return;
            context.Products.Remove(pro);
            await context.SaveChangesAsync();
        }
        public async Task<List<Prodouctresponse>> GetProducts(ProdFilter filter)
        {
            var query = context.Products.Include(p => p.Category).AsQueryable();
            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(p => p.Name.Contains(filter.Search) || p.Description.Contains(filter.Search));
            }
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }
            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }
            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                switch (filter.SortBy.ToLower())
                {
                    case "name":
                        query = filter.SortOrder?.ToLower() == "desc" ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);
                        break;
                    case "price":
                        query = filter.SortOrder?.ToLower() == "desc" ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price);
                        break;
                    default:
                        break;
                }
            }
            var products = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(p => new Prodouctresponse
                {
                    Id = p .Id,
                    Name = p.Name,
                    Description = p.Description,
                    Stock = p.Stock,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    CategoryName = p.Category.Name
                })
                .ToListAsync();
            return products;
        }
    }
}

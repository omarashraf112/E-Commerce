using Final_Ecommerce.DTOs.Category;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICatServices catServices;
        public CategoryController(ICatServices catServices)
        {
            this.catServices = catServices;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await catServices.GetAllCategories();
            return Ok(categories);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var catgory = await catServices.GetCategoryById(id);
            if (catgory == null)
            {
                return NotFound();
            }
            return Ok(catgory);
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int Id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cat = await catServices.DeleteCategory(userId, Id);
            if (!cat)
            {
                return NotFound();
            }
            return NoContent();
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> CreateCategory([FromBody] CatAdd category)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var createdCategory = await catServices.AddCategory(userId, category);
            if (createdCategory == null)
            {
                return BadRequest();
            }
            return CreatedAtAction(nameof(GetCategoryById), new { id = createdCategory.Id }, createdCategory);
        }
    }
}

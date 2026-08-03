using Final_Ecommerce.Services;
using Final_Ecommerce.DTOs.Prodoucts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductServices productServices;
        public ProductController(IProductServices productServices)
        {
            this.productServices = productServices;
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProduct([FromForm] AddProdouctDTO addProductDTO)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await productServices.AddProduct(addProductDTO);
            return Ok(result);
        }
        [HttpGet("{id}")]
        
        public async Task<IActionResult> GetProductById(int id)
        {
            var result = await productServices.GetProductById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetProductByCategory(int categoryId)
        {
            var result = await productServices.GetProductByCategory(categoryId);
            if (result == null) return NotFound();
            if (categoryId == 0) return NotFound();
            if (result.Count == 0) return NotFound();
            return Ok(result);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Edit(int id, [FromBody] EditProductDTo editProductDTO)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await productServices.Edit(id, editProductDTO);
            if (result == null) return NotFound();
            return Ok(result);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await productServices.Delete(id);
            if (id == 0) return NotFound();
            return Ok();
        }
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] ProdFilter filter)
        {
            var products = await productServices.GetProducts(filter);
            return Ok(products);
        }
    }
}

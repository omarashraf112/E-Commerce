using Final_Ecommerce.DTOs.Category;

namespace Final_Ecommerce.Services
{
    public interface ICatServices
    {
        Task<CatResponse> AddCategory(string userId, CatAdd catAdd);
        Task<List<CatGetall>> GetAllCategories();
        Task<CatResponse> GetCategoryById(int id);
        Task<bool> DeleteCategory(string userId, int Id);
    }
}

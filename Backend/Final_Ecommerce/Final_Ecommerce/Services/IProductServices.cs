using Final_Ecommerce.DTOs.Prodoucts;

namespace Final_Ecommerce.Services
{
    public interface IProductServices
    {
        Task<Prodouctresponse> AddProduct(AddProdouctDTO addProdouctDTO);
        Task<Prodouctresponse> GetProductById(int id);
        Task<List<Prodouctresponse>> GetProductByCategory(int categoryId);
        Task<Prodouctresponse> Edit(int id, EditProductDTo editProdouctDTO);
        Task Delete(int id);
        Task<List<Prodouctresponse>> GetProducts(ProdFilter filter);
    }
}

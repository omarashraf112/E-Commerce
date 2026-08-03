using Final_Ecommerce.DTOs.payment;

namespace Final_Ecommerce.Services
{
    public interface IPaymentService
    {
        Task<paymentresponse> CreatePayment(string userId, createpayment payment);
        Task<paymentresponse> confirmed(string userId, int paymentId, confirmpayment payment);
        Task<paymentresponse> failed(string userId, int paymentId);
        Task<paymentresponse> GetPaymentById(string userId, int paymentId);
    }
}

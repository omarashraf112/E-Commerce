using Final_Ecommerce.Data;
using Final_Ecommerce.DTOs.payment;
using Final_Ecommerce.Models;

namespace Final_Ecommerce.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext context;
        public PaymentService(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<paymentresponse> CreatePayment(string userId, createpayment payment)
        {
            var order = await context.Orders.FindAsync(payment.OrderId);
            if (order == null)
            {
                throw new InvalidOperationException("Order not found");
            }
            var newpay = new Payment
            {
                Amount = order.Total,
                Method = payment.Method,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow,
                UserId = userId,
                OrderId = payment.OrderId
            };
            await context.Payments.AddAsync(newpay);
            await context.SaveChangesAsync();
            return new paymentresponse
            {
                Id = newpay.Id,
                Amount = newpay.Amount,
                Method = newpay.Method,
                Status = newpay.Status,
                CreatedAt = newpay.CreatedAt,
               
            };
        }
        public async Task<paymentresponse> confirmed(string userId, int paymentId, confirmpayment paymen)
        {
            var payment = await context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new InvalidOperationException("Payment not found");
            }
            if (payment.UserId != userId)
            {
                throw new InvalidOperationException("Unauthorized");
            }
            payment.Status = PaymentStatus.Completed;
            payment.TransactionId = paymen.TransactionId;
            payment.LastUpdatedAt = DateTime.UtcNow;
            var order = await context.Orders.FindAsync(payment.OrderId);
            if(order != null)
            {
                order.Status = OrderStatus.processing;
            }
            await context.SaveChangesAsync();
            return new paymentresponse
            {
                Id = payment.Id,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                TransactionId = payment.TransactionId
            };
        }
        public async Task<paymentresponse> failed(string userId, int paymentId)
        {
            var payment = await context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new InvalidOperationException("Payment not found");
            }
            if (payment.UserId != userId)
            {
                throw new InvalidOperationException("Unauthorized");
            }
            payment.Status = PaymentStatus.Failed;
            payment.LastUpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return new paymentresponse
            {
                Id = payment.Id,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt
            };
        }
        public async Task<paymentresponse> GetPaymentById(string userId, int paymentId)
        {
            var payment = await context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new InvalidOperationException("Payment not found");
            }
            if (payment.UserId != userId)
            {
                throw new InvalidOperationException("Unauthorized");
            }
            return new paymentresponse
            {
                Id = payment.Id,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                TransactionId = payment.TransactionId
            };
        }
        }
}

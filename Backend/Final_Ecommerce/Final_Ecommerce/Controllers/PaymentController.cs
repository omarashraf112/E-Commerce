using Final_Ecommerce.DTOs.payment;
using Final_Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Final_Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] createpayment payment)
        {
            var userid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _paymentService.CreatePayment(userid, payment);
            return Ok(response);
        }
        [HttpPost("{paymentId}/confirmed")]
        [Authorize]
        public async Task<IActionResult> Confirmed([FromRoute] int paymentId, [FromBody]  confirmpayment dd)
        {
            var userid = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var response = await _paymentService.confirmed(userid, paymentId, dd);
            return Ok(response);
        }
        [HttpPost("{paymentId}/failed")]
        [Authorize]
        public async Task<IActionResult> Failed([FromRoute] int paymentId)
        {
            var userid = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var response = await _paymentService.failed(userid,paymentId);
            return Ok(response);
        }
        [HttpGet("{paymentId}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentById([FromRoute] int paymentId)
        {
            var userid = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var response = await _paymentService.GetPaymentById(userid,paymentId);
            return Ok(response);
        }
    }
}

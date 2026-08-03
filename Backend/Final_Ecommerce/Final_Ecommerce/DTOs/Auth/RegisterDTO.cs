using System.ComponentModel.DataAnnotations;

namespace Final_Ecommerce.DTOs.Auth
{
    public class RegisterDTO
    {
        [Required]
        public string FullName { get; set; }
        [Required,EmailAddress]
        public string Email { get; set; }
        [Required,MinLength(6)]
        public string Password { get; set; }
    }
}

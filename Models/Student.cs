using System.ComponentModel.DataAnnotations;

namespace SimpleCrudApp.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Student code is required")]
        [StringLength(20)]
        public string StudentCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; } = DateTime.Now.AddYears(-20);

        [StringLength(50)]
        public string ClassName { get; set; } = string.Empty;

        [Range(0, 10, ErrorMessage = "GPA must be between 0 and 10")]
        public double Gpa { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;
    }
}

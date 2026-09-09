using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleCrudApp.Data;
using SimpleCrudApp.Models;

namespace SimpleCrudApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Student
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudents([FromQuery] string? keyword = null, [FromQuery] string? className = null)
        {
            var query = _context.Students.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.Trim().ToLower();
                query = query.Where(s => s.FullName.ToLower().Contains(keyword) || 
                                         s.StudentCode.ToLower().Contains(keyword) || 
                                         s.Email.ToLower().Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(className))
            {
                query = query.Where(s => s.ClassName == className);
            }

            return await query.OrderByDescending(s => s.Id).ToListAsync();
        }

        // GET: api/Student/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);

            if (student == null)
            {
                return NotFound(new { message = $"Student not found with ID = {id}" });
            }

            return student;
        }

        // POST: api/Student
        [HttpPost]
        public async Task<ActionResult<Student>> CreateStudent(Student student)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check duplicate StudentCode
            bool studentCodeExists = await _context.Students.AnyAsync(s => s.StudentCode.ToLower() == student.StudentCode.ToLower());
            if (studentCodeExists)
            {
                return BadRequest(new { message = $"Student code '{student.StudentCode}' already exists in the system." });
            }

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
        }

        // PUT: api/Student/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, Student student)
        {
            if (id != student.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check duplicate StudentCode with other students
            bool studentCodeExists = await _context.Students.AnyAsync(s => s.StudentCode.ToLower() == student.StudentCode.ToLower() && s.Id != id);
            if (studentCodeExists)
            {
                return BadRequest(new { message = $"Student code '{student.StudentCode}' is already used by another student." });
            }

            _context.Entry(student).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentExists(id))
                {
                    return NotFound(new { message = $"Student not found with ID = {id}" });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Student updated successfully!", data = student });
        }

        // DELETE: api/Student/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound(new { message = $"Student not found with ID = {id}" });
            }

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Student '{student.FullName}' (Code: {student.StudentCode}) deleted successfully." });
        }

        private bool StudentExists(int id)
        {
            return _context.Students.Any(e => e.Id == id);
        }
    }
}

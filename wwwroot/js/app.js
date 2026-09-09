// Cấu hình URL Backend API (Hỗ trợ khi Deploy Frontend lên Vercel)
function getApiBaseUrl() {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const savedUrl = localStorage.getItem('API_BASE_URL');
  if (savedUrl) return savedUrl.replace(/\/$/, '');
  return isLocalHost ? '' : 'http://localhost:5000';
}

function getApiUrl() {
  const base = getApiBaseUrl();
  return base ? `${base}/api/student` : '/api/student';
}

let currentStudents = [];
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  updateApiConfigUI();
  loadStudents();
});

function updateApiConfigUI() {
  const baseUrl = getApiBaseUrl();
  const displayUrl = baseUrl || `${window.location.origin}`;
  
  const currentUrlSpan = document.getElementById('currentApiUrl');
  if (currentUrlSpan) {
    currentUrlSpan.textContent = `${displayUrl}/api/student`;
  }

  const swaggerLink = document.getElementById('swaggerLink');
  if (swaggerLink) {
    swaggerLink.href = baseUrl ? `${baseUrl}/swagger` : '/swagger';
  }
}

function promptChangeApiUrl() {
  const current = getApiBaseUrl() || 'http://localhost:5000';
  const newUrl = prompt('Nhập địa chỉ URL của Server Backend (ví dụ: http://localhost:5000 hoặc https://your-api.onrender.com):', current);
  if (newUrl !== null) {
    const trimmed = newUrl.trim().replace(/\/$/, '');
    if (trimmed) {
      localStorage.setItem('API_BASE_URL', trimmed);
    } else {
      localStorage.removeItem('API_BASE_URL');
    }
    updateApiConfigUI();
    loadStudents();
  }
}

// Fetch all students from API
async function loadStudents(keyword = '') {
  try {
    let url = getApiUrl();
    if (keyword) {
      url += `?keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} (${response.statusText || 'Không thể kết nối Backend API'})`);
    }

    currentStudents = await response.json();
    renderStudentTable(currentStudents);
    updateStats(currentStudents);
  } catch (error) {
    console.error('Error loading students:', error);
    showToast(`Không thể kết nối Backend API (${error.message}). Nhấn "Đổi URL Backend" nếu C# API đang chạy ở cổng khác.`, 'error');
  }
}

// Render student list table
function renderStudentTable(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Không tìm thấy sinh viên nào trong hệ thống.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map(sv => {
    const formattedDate = sv.dateOfBirth ? new Date(sv.dateOfBirth).toISOString().split('T')[0] : '';
    const badgeInfo = getBadgeRank(sv.gpa);

    return `
      <tr>
        <td><strong>${escapeHtml(sv.studentCode)}</strong></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(sv.fullName)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(sv.email || 'N/A')}</div>
        </td>
        <td>${escapeHtml(sv.className)}</td>
        <td><strong style="color: #60a5fa;">${sv.gpa.toFixed(1)}</strong></td>
        <td><span class="badge ${badgeInfo.class}">${badgeInfo.label}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick='editStudent(${JSON.stringify(sv).replace(/'/g, "&apos;")})'>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${sv.id}, '${escapeHtml(sv.fullName)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update dashboard statistics
function updateStats(students) {
  document.getElementById('statTotalStudents').textContent = students.length;
  
  if (students.length === 0) {
    document.getElementById('statAvgGrade').textContent = '0.0';
    document.getElementById('statGoodStudents').textContent = '0';
    return;
  }

  const avgGrade = (students.reduce((acc, curr) => acc + curr.gpa, 0) / students.length).toFixed(1);
  const goodStudentsCount = students.filter(s => s.gpa >= 7.0).length;

  document.getElementById('statAvgGrade').textContent = avgGrade;
  document.getElementById('statGoodStudents').textContent = goodStudentsCount;
}

// Get Badge Rank based on Grade
function getBadgeRank(diem) {
  if (diem >= 8.5) return { class: 'badge-excel', label: 'Xuất sắc' };
  if (diem >= 7.0) return { class: 'badge-good', label: 'Khá / Giỏi' };
  if (diem >= 5.0) return { class: 'badge-average', label: 'Trung bình' };
  return { class: 'badge-poor', label: 'Yếu / Kém' };
}

// Form Submission (Add or Update)
async function handleFormSubmit(event) {
  event.preventDefault();

  const id = parseInt(document.getElementById('studentId').value) || 0;
  const studentData = {
    id: id,
    studentCode: document.getElementById('studentCode').value.trim(),
    fullName: document.getElementById('fullName').value.trim(),
    dateOfBirth: document.getElementById('dateOfBirth').value ? new Date(document.getElementById('dateOfBirth').value).toISOString() : new Date().toISOString(),
    className: document.getElementById('className').value.trim(),
    gpa: parseFloat(document.getElementById('gpa').value) || 0,
    email: document.getElementById('email').value.trim()
  };

  const isEdit = id > 0;
  const method = isEdit ? 'PUT' : 'POST';
  const baseUrl = getApiUrl();
  const url = isEdit ? `${baseUrl}/${id}` : baseUrl;

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi xử lý dữ liệu');
    }

    showToast(isEdit ? 'Cập nhật sinh viên thành công!' : 'Thêm mới sinh viên thành công!', 'success');
    resetForm();
    loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Edit Student
function editStudent(student) {
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentCode').value = student.studentCode;
  document.getElementById('fullName').value = student.fullName;
  
  if (student.dateOfBirth) {
    const date = new Date(student.dateOfBirth);
    document.getElementById('dateOfBirth').value = date.toISOString().split('T')[0];
  }
  
  document.getElementById('className').value = student.className;
  document.getElementById('gpa').value = student.gpa;
  document.getElementById('email').value = student.email || '';

  document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-user-pen"></i> Chỉnh Sửa Sinh Viên (ID: ${student.id})`;
  document.getElementById('btnSubmit').innerHTML = `<i class="fa-solid fa-check"></i> Cập Nhật Sinh Viên`;
  document.getElementById('btnCancelEdit').style.display = 'inline-flex';
}

// Reset Form
function resetForm() {
  document.getElementById('studentId').value = 0;
  document.getElementById('studentForm').reset();

  document.getElementById('formTitle').innerHTML = `<i class="fa-solid fa-user-plus"></i> Thêm Sinh Viên Mới`;
  document.getElementById('btnSubmit').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Lưu Sinh Viên`;
  document.getElementById('btnCancelEdit').style.display = 'none';
}

// Delete Student
async function deleteStudent(id, name) {
  if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên "${name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${getApiUrl()}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa sinh viên');
    }

    showToast(data.message || 'Đã xóa sinh viên!', 'success');
    loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Live Search with Debounce
function handleSearch() {
  clearTimeout(searchTimeout);
  const keyword = document.getElementById('searchInput').value.trim();
  searchTimeout = setTimeout(() => {
    loadStudents(keyword);
  }, 300);
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Utility: HTML Escape
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

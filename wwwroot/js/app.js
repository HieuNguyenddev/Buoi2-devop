// Backend API URL configuration
// Priority: localStorage override → CI/CD injected env → same-origin fallback
const _DEFAULT_API_BASE = '__API_BASE_URL__'; // replaced by CI/CD at build time

function getApiBaseUrl() {
  const saved = localStorage.getItem('API_BASE_URL');
  if (saved) return saved.replace(/\/$/, '');
  // Use the value injected by CI/CD (not a placeholder means it was replaced)
  if (_DEFAULT_API_BASE && !_DEFAULT_API_BASE.startsWith('__')) {
    return _DEFAULT_API_BASE.replace(/\/$/, '');
  }
  return ''; // same origin – works when .NET app serves the frontend directly
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
  const displayUrl = baseUrl || window.location.origin;

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
  const current = getApiBaseUrl() || window.location.origin;
  const newUrl = prompt(
    'Nhập URL gốc của Backend API (để trống nếu cùng domain):\nVí dụ: http://localhost:5292 hoặc https://my-api.onrender.com',
    current
  );
  if (newUrl === null) return;
  const trimmed = newUrl.trim().replace(/\/$/, '');
  if (trimmed) {
    localStorage.setItem('API_BASE_URL', trimmed);
  } else {
    localStorage.removeItem('API_BASE_URL');
  }
  updateApiConfigUI();
  loadStudents();
}

// ─── READ ──────────────────────────────────────────────────────────────────────

async function loadStudents(keyword = '') {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">Đang tải dữ liệu...</td></tr>`;

  try {
    let url = getApiUrl();
    if (keyword) url += `?keyword=${encodeURIComponent(keyword)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

    currentStudents = await response.json();
    renderStudentTable(currentStudents);
    updateStats(currentStudents);
  } catch (error) {
    console.error('loadStudents error:', error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--danger);">
      <i class="fa-solid fa-triangle-exclamation"></i>
      Không thể tải dữ liệu từ server.<br>
      <small style="color:var(--text-muted)">Hãy nhấn <strong>"Đổi URL Backend"</strong> để trỏ đúng địa chỉ C# API.</small>
    </td></tr>`;
    updateStats([]);
    showToast(`Lỗi kết nối API: ${error.message}`, 'error');
  }
}

// ─── RENDER ────────────────────────────────────────────────────────────────────

function renderStudentTable(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!students || students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">Không tìm thấy sinh viên nào trong hệ thống.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(sv => {
    const badgeInfo = getBadgeRank(sv.gpa);
    return `
      <tr>
        <td><strong>${escapeHtml(sv.studentCode)}</strong></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(sv.fullName)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(sv.email || '')}</div>
        </td>
        <td>${escapeHtml(sv.className)}</td>
        <td><strong style="color:#60a5fa;">${sv.gpa.toFixed(1)}</strong></td>
        <td><span class="badge ${badgeInfo.class}">${badgeInfo.label}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick='editStudent(${JSON.stringify(sv).replace(/'/g, "&apos;")})'>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent(${sv.id}, '${escapeHtml(sv.fullName)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ─── STATS ─────────────────────────────────────────────────────────────────────

function updateStats(students) {
  document.getElementById('statTotalStudents').textContent = students.length;
  if (students.length === 0) {
    document.getElementById('statAvgGrade').textContent = '0.0';
    document.getElementById('statGoodStudents').textContent = '0';
    return;
  }
  const avg = (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(1);
  document.getElementById('statAvgGrade').textContent = avg;
  document.getElementById('statGoodStudents').textContent = students.filter(s => s.gpa >= 7.0).length;
}

function getBadgeRank(gpa) {
  if (gpa >= 8.5) return { class: 'badge-excel',   label: 'Xuất sắc'    };
  if (gpa >= 7.0) return { class: 'badge-good',    label: 'Khá / Giỏi'  };
  if (gpa >= 5.0) return { class: 'badge-average', label: 'Trung bình'  };
  return            { class: 'badge-poor',    label: 'Yếu / Kém'   };
}

// ─── CREATE / UPDATE ───────────────────────────────────────────────────────────

async function handleFormSubmit(event) {
  event.preventDefault();

  const id      = parseInt(document.getElementById('studentId').value) || 0;
  const payload = {
    id,
    studentCode: document.getElementById('studentCode').value.trim(),
    fullName:    document.getElementById('fullName').value.trim(),
    dateOfBirth: document.getElementById('dateOfBirth').value
      ? new Date(document.getElementById('dateOfBirth').value).toISOString()
      : new Date().toISOString(),
    className:   document.getElementById('className').value.trim(),
    gpa:         parseFloat(document.getElementById('gpa').value) || 0,
    email:       document.getElementById('email').value.trim()
  };

  const isEdit = id > 0;
  const method = isEdit ? 'PUT' : 'POST';
  const url    = isEdit ? `${getApiUrl()}/${id}` : getApiUrl();

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

    showToast(isEdit ? 'Cập nhật sinh viên thành công!' : 'Thêm mới sinh viên thành công!', 'success');
    resetForm();
    loadStudents();
  } catch (error) {
    showToast(`Lỗi: ${error.message}`, 'error');
  }
}

// ─── EDIT ──────────────────────────────────────────────────────────────────────

function editStudent(student) {
  document.getElementById('studentId').value    = student.id;
  document.getElementById('studentCode').value  = student.studentCode;
  document.getElementById('fullName').value     = student.fullName;
  document.getElementById('className').value    = student.className;
  document.getElementById('gpa').value          = student.gpa;
  document.getElementById('email').value        = student.email || '';

  if (student.dateOfBirth) {
    document.getElementById('dateOfBirth').value =
      new Date(student.dateOfBirth).toISOString().split('T')[0];
  }

  document.getElementById('formTitle').innerHTML =
    `<i class="fa-solid fa-user-pen"></i> Chỉnh Sửa Sinh Viên (ID: ${student.id})`;
  document.getElementById('btnSubmit').innerHTML =
    `<i class="fa-solid fa-check"></i> Cập Nhật Sinh Viên`;
  document.getElementById('btnCancelEdit').style.display = 'inline-flex';

  document.getElementById('studentForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  document.getElementById('studentId').value = 0;
  document.getElementById('studentForm').reset();
  document.getElementById('formTitle').innerHTML =
    `<i class="fa-solid fa-user-plus"></i> Thêm Sinh Viên Mới`;
  document.getElementById('btnSubmit').innerHTML =
    `<i class="fa-solid fa-floppy-disk"></i> Lưu Sinh Viên`;
  document.getElementById('btnCancelEdit').style.display = 'none';
}

// ─── DELETE ────────────────────────────────────────────────────────────────────

async function deleteStudent(id, name) {
  if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên "${name}"?`)) return;

  try {
    const response = await fetch(`${getApiUrl()}/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

    showToast(data.message || `Đã xóa sinh viên "${name}"!`, 'success');
    loadStudents();
  } catch (error) {
    showToast(`Lỗi xóa: ${error.message}`, 'error');
  }
}

// ─── SEARCH ────────────────────────────────────────────────────────────────────

function handleSearch() {
  clearTimeout(searchTimeout);
  const keyword = document.getElementById('searchInput').value.trim();
  searchTimeout = setTimeout(() => loadStudents(keyword), 300);
}

// ─── TOAST ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ─── UTILS ─────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

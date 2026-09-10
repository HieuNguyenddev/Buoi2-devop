// ─── CONFIGURATION & STORAGE ──────────────────────────────────────────────────
const _DEFAULT_API_BASE = '__API_BASE_URL__'; // Replaced by CI/CD at build time

const INITIAL_SEED_STUDENTS = [
  {
    id: 1,
    studentCode: "SV001",
    fullName: "Nguyễn Văn An",
    dateOfBirth: "2003-05-15T00:00:00",
    className: "CNTT-K15A",
    gpa: 8.5,
    email: "an.nguyen@example.com"
  },
  {
    id: 2,
    studentCode: "SV002",
    fullName: "Trần Thị Bình",
    dateOfBirth: "2003-08-20T00:00:00",
    className: "CNTT-K15B",
    gpa: 9.0,
    email: "binh.tran@example.com"
  },
  {
    id: 3,
    studentCode: "SV003",
    fullName: "Lê Hoàng Cường",
    dateOfBirth: "2002-12-10T00:00:00",
    className: "HTTT-K14",
    gpa: 7.2,
    email: "cuong.le@example.com"
  },
  {
    id: 4,
    studentCode: "SV004",
    fullName: "Phạm Thu Dung",
    dateOfBirth: "2004-03-25T00:00:00",
    className: "CNTT-K16A",
    gpa: 6.8,
    email: "dung.pham@example.com"
  },
  {
    id: 5,
    studentCode: "SV005",
    fullName: "Vũ Minh Đức",
    dateOfBirth: "2003-01-05T00:00:00",
    className: "KTPM-K15",
    gpa: 8.8,
    email: "duc.vu@example.com"
  }
];

function getApiBaseUrl() {
  const saved = localStorage.getItem('API_BASE_URL');
  if (saved) return saved.replace(/\/$/, '');
  if (_DEFAULT_API_BASE && !_DEFAULT_API_BASE.startsWith('__')) {
    return _DEFAULT_API_BASE.replace(/\/$/, '');
  }
  return '';
}

function getApiUrl() {
  const base = getApiBaseUrl();
  return base ? `${base}/api/student` : '/api/student';
}

let isFallbackMode = false;
let currentStudents = [];
let searchTimeout = null;

// Initialize LocalStorage Data if not present
function getLocalDb() {
  const data = localStorage.getItem('DEMO_STUDENTS_DB');
  if (!data) {
    localStorage.setItem('DEMO_STUDENTS_DB', JSON.stringify(INITIAL_SEED_STUDENTS));
    return [...INITIAL_SEED_STUDENTS];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [...INITIAL_SEED_STUDENTS];
  }
}

function saveLocalDb(students) {
  localStorage.setItem('DEMO_STUDENTS_DB', JSON.stringify(students));
}

document.addEventListener('DOMContentLoaded', () => {
  const swaggerLink = document.getElementById('swaggerLink');
  if (swaggerLink) {
    const base = getApiBaseUrl();
    swaggerLink.href = base ? `${base}/swagger` : '/swagger';
  }
  loadStudents();
});

// ─── READ ──────────────────────────────────────────────────────────────────────

async function loadStudents(keyword = '') {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>`;

  let students = [];
  const url = getApiUrl();
  let fetchSuccessful = false;

  // Try fetching from real C# Backend API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for quick fallback

    let targetUrl = url;
    if (keyword) targetUrl += `?keyword=${encodeURIComponent(keyword)}`;

    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      students = await response.json();
      fetchSuccessful = true;
      isFallbackMode = false;
    }
  } catch (error) {
    // Backend is unreachable or running on static Vercel host
    fetchSuccessful = false;
  }

  // If live API unavailable, use seamless LocalStorage DB
  if (!fetchSuccessful) {
    isFallbackMode = true;
    let localData = getLocalDb();
    if (keyword) {
      const kw = keyword.toLowerCase();
      students = localData.filter(s =>
        (s.studentCode && s.studentCode.toLowerCase().includes(kw)) ||
        (s.fullName && s.fullName.toLowerCase().includes(kw)) ||
        (s.email && s.email.toLowerCase().includes(kw)) ||
        (s.className && s.className.toLowerCase().includes(kw))
      );
    } else {
      students = localData;
    }
  }

  currentStudents = students;
  renderStudentTable(currentStudents);
  updateStats(currentStudents);
}

// ─── RENDER ────────────────────────────────────────────────────────────────────

function renderStudentTable(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!students || students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fa-regular fa-folder-open" style="font-size:2rem;margin-bottom:0.5rem;display:block;opacity:0.5;"></i>Không tìm thấy sinh viên nào trong hệ thống.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(sv => {
    const badgeInfo = getBadgeRank(sv.gpa);
    return `
      <tr>
        <td><span class="student-code-badge">${escapeHtml(sv.studentCode)}</span></td>
        <td>
          <div class="student-name">${escapeHtml(sv.fullName)}</div>
          <div class="student-email">${escapeHtml(sv.email || 'Chưa cập nhật email')}</div>
        </td>
        <td><span style="color: #cbd5e1; font-weight: 500;">${escapeHtml(sv.className)}</span></td>
        <td><span class="student-gpa">${Number(sv.gpa).toFixed(1)}</span></td>
        <td><span class="badge ${badgeInfo.class}">${badgeInfo.label}</span></td>
        <td style="text-align: right;">
          <div class="actions-cell">
            <button class="btn btn-action-edit" title="Chỉnh sửa" onclick='editStudent(${JSON.stringify(sv).replace(/'/g, "&apos;")})'>
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-action-delete" title="Xóa" onclick="deleteStudent(${sv.id}, '${escapeHtml(sv.fullName)}')">
              <i class="fa-solid fa-trash"></i>
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
  const avg = (students.reduce((a, s) => a + Number(s.gpa), 0) / students.length).toFixed(1);
  document.getElementById('statAvgGrade').textContent = avg;
  document.getElementById('statGoodStudents').textContent = students.filter(s => Number(s.gpa) >= 7.0).length;
}

function getBadgeRank(gpa) {
  const g = Number(gpa);
  if (g >= 8.5) return { class: 'badge-excel', label: 'Xuất sắc' };
  if (g >= 7.0) return { class: 'badge-good', label: 'Khá / Giỏi' };
  if (g >= 5.0) return { class: 'badge-average', label: 'Trung bình' };
  return { class: 'badge-poor', label: 'Yếu / Kém' };
}

// ─── CREATE / UPDATE ───────────────────────────────────────────────────────────

async function handleFormSubmit(event) {
  event.preventDefault();

  const id = parseInt(document.getElementById('studentId').value) || 0;
  const studentCode = document.getElementById('studentCode').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  const className = document.getElementById('className').value.trim();
  const gpa = parseFloat(document.getElementById('gpa').value) || 0;
  const email = document.getElementById('email').value.trim();
  const dobInput = document.getElementById('dateOfBirth').value;
  const dateOfBirth = dobInput ? new Date(dobInput).toISOString() : new Date().toISOString();

  const isEdit = id > 0;
  const payload = { id, studentCode, fullName, dateOfBirth, className, gpa, email };

  // If live API is connected
  if (!isFallbackMode) {
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${getApiUrl()}/${id}` : getApiUrl();

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
      return;
    } catch (error) {
      console.warn('API call failed, falling back to local database storage', error);
    }
  }

  // Local Storage Fallback Mode CRUD
  let localData = getLocalDb();

  // Duplicate student code check
  const duplicate = localData.some(s => s.studentCode.toLowerCase() === studentCode.toLowerCase() && s.id !== id);
  if (duplicate) {
    showToast(`Mã sinh viên "${studentCode}" đã tồn tại!`, 'error');
    return;
  }

  if (isEdit) {
    const index = localData.findIndex(s => s.id === id);
    if (index !== -1) {
      localData[index] = { ...payload, id };
    }
    showToast('Cập nhật sinh viên thành công!', 'success');
  } else {
    const newId = localData.length > 0 ? Math.max(...localData.map(s => s.id)) + 1 : 1;
    payload.id = newId;
    localData.unshift(payload);
    showToast('Thêm mới sinh viên thành công!', 'success');
  }

  saveLocalDb(localData);
  resetForm();
  loadStudents();
}

// ─── EDIT ──────────────────────────────────────────────────────────────────────

function editStudent(student) {
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentCode').value = student.studentCode;
  document.getElementById('fullName').value = student.fullName;
  document.getElementById('className').value = student.className;
  document.getElementById('gpa').value = student.gpa;
  document.getElementById('email').value = student.email || '';

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

  if (!isFallbackMode) {
    try {
      const response = await fetch(`${getApiUrl()}/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || `Đã xóa sinh viên "${name}"!`, 'success');
        loadStudents();
        return;
      }
    } catch (error) {
      console.warn('Delete API call failed, falling back to local DB', error);
    }
  }

  let localData = getLocalDb();
  localData = localData.filter(s => s.id !== id);
  saveLocalDb(localData);
  showToast(`Đã xóa sinh viên "${name}"!`, 'success');
  loadStudents();
}

// ─── SEARCH ────────────────────────────────────────────────────────────────────

function handleSearch() {
  clearTimeout(searchTimeout);
  const keyword = document.getElementById('searchInput').value.trim();
  searchTimeout = setTimeout(() => loadStudents(keyword), 250);
}

// ─── TOAST ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'info' ? 'fa-circle-info' : 'fa-circle-exclamation');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
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


/* ===== STATE ===== */
let allProperties = [];
let editingId     = null;

/* ===== AUTH HELPERS ===== */
const getToken = () => localStorage.getItem('token');
const getUser  = () => JSON.parse(localStorage.getItem('user') || '{}');

function checkAuth() {
  if (!getToken()) { window.location.href = '/login.html'; return false; }
  return true;
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

/* ===== API HELPER ===== */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login.html';
    throw new Error('Oturum süresi doldu');
  }
  return res;
}

/* ===== API FUNCTIONS ===== */
async function loadProperties() {
  try {
    const res = await apiFetch('/api/properties');
    allProperties = await res.json();
    renderProperties(allProperties);
  } catch (err) {
    if (err.message !== 'Oturum süresi doldu') console.error(err);
  }
}

async function createProperty(data) {
  return apiFetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateProperty(id, data) {
  return apiFetch(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteProperty(id) {
  if (!confirm('Bu mülkü silmek istediğinize emin misiniz?')) return;
  try {
    const res = await apiFetch(`/api/properties/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadProperties();
    } else {
      const data = await res.json();
      alert(data.error || 'Silme işlemi başarısız.');
    }
  } catch (err) {
    if (err.message !== 'Oturum süresi doldu') console.error(err);
  }
}

/* ===== RENDER ===== */
function renderProperties(list) {
  const container = document.getElementById('propertyList');
  const countEl   = document.getElementById('propertyCount');

  countEl.textContent = `${list.length} mülk`;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <h4>Mülk bulunamadı</h4>
        <p>Arama kriterlerinizi değiştirin veya yeni mülk ekleyin.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="property-card">
      <div class="prop-card-image ${p.type === 'Satılık' ? 'img-satilik' : 'img-kiralik'}">
        <span class="prop-card-img-icon">${p.type === 'Satılık' ? '🏠' : '🏢'}</span>
      </div>
      <div class="prop-card-body">
        <span class="prop-type-badge ${p.type === 'Satılık' ? 'type-satilik' : 'type-kiralik'}">
          ${escapeHtml(p.type)}
        </span>
        <h3 class="prop-title">${escapeHtml(p.title)}</h3>
        <p class="prop-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          ${escapeHtml(p.location)}
        </p>
        <p class="prop-price">₺ ${Number(p.price).toLocaleString('tr-TR')}</p>
        <div class="prop-actions">
          <button class="btn btn-warning btn-sm" onclick="startEdit(${p.id})">Düzenle</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteProperty(${p.id})">Sil</button>
        </div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ===== SEARCH ===== */
function searchProperties(query) {
  const q        = query.toLowerCase();
  const filtered = allProperties.filter(p =>
    p.title.toLowerCase().includes(q)    ||
    p.location.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q)
  );
  renderProperties(filtered);
}

/* ===== EDIT MODE ===== */
function startEdit(id) {
  const prop = allProperties.find(p => p.id === id);
  if (!prop) return;

  editingId = id;

  document.getElementById('title').value    = prop.title;
  document.getElementById('price').value    = prop.price;
  document.getElementById('type').value     = prop.type;
  document.getElementById('location').value = prop.location;

  document.getElementById('formTitle').textContent  = 'Mülk Düzenle';
  document.getElementById('submitBtn').textContent  = 'Güncelle';
  document.getElementById('cancelBtn').style.display = 'inline-flex';

  clearFormAlert();
  document.getElementById('propertyForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('propertyForm').reset();
  document.getElementById('formTitle').textContent   = 'Yeni Mülk Ekle';
  document.getElementById('submitBtn').textContent   = 'Mülk Ekle';
  document.getElementById('cancelBtn').style.display = 'none';
  clearFormAlert();
}

/* ===== FORM ALERTS ===== */
function showFormAlert(msg) {
  const el = document.getElementById('formAlert');
  el.textContent = msg;
  el.className   = 'alert alert-error';
}

function clearFormAlert() {
  document.getElementById('formAlert').className = 'alert alert-error alert-hidden';
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;

  const user = getUser();
  const name = user.username || 'Kullanıcı';

  document.getElementById('usernameDisplay').textContent = name;
  document.getElementById('userInitial').textContent     = name.charAt(0).toUpperCase();

  loadProperties();

  /* Form submit */
  document.getElementById('propertyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormAlert();

    const data = {
      title:    document.getElementById('title').value.trim(),
      price:    Number(document.getElementById('price').value),
      type:     document.getElementById('type').value,
      location: document.getElementById('location').value.trim()
    };

    if (!data.title)              return showFormAlert('Başlık zorunludur.');
    if (!data.price || data.price <= 0) return showFormAlert('Geçerli bir fiyat girin (0\'dan büyük).');
    if (!data.type)               return showFormAlert('Mülk türü seçilmelidir.');
    if (!data.location)           return showFormAlert('Konum zorunludur.');

    const btn = document.getElementById('submitBtn');
    btn.disabled    = true;
    btn.textContent = 'Kaydediliyor…';

    try {
      const res = editingId
        ? await updateProperty(editingId, data)
        : await createProperty(data);

      if (res.ok) {
        cancelEdit();
        await loadProperties();
      } else {
        const err = await res.json();
        showFormAlert(err.error || 'İşlem başarısız.');
      }
    } catch (err) {
      if (err.message !== 'Oturum süresi doldu') showFormAlert('Sunucu hatası.');
    } finally {
      btn.disabled    = false;
      btn.textContent = editingId ? 'Güncelle' : 'Mülk Ekle';
    }
  });

  /* Search */
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchProperties(e.target.value);
  });
});

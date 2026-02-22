import { login, logout, getSession } from './auth.js';
import { fetchCatalog, upsertRoom, upsertArtwork } from './content.js';
import { uploadArtworkDerivatives } from './upload.js';
import { refreshAndLoadAnalytics } from './analytics.js';

const ui = {
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  loginBtn: document.getElementById('login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  authStatus: document.getElementById('auth-status'),

  roomSlug: document.getElementById('room-slug'),
  roomTitle: document.getElementById('room-title'),
  roomColor: document.getElementById('room-color'),
  roomOrder: document.getElementById('room-order'),
  saveRoomBtn: document.getElementById('save-room-btn'),

  artworkId: document.getElementById('artwork-id'),
  artworkLegacy: document.getElementById('artwork-legacy'),
  artworkRoomSlug: document.getElementById('artwork-room-slug'),
  artworkTitle: document.getElementById('artwork-title'),
  artworkAuthor: document.getElementById('artwork-author'),
  artworkYear: document.getElementById('artwork-year'),
  artworkTechnique: document.getElementById('artwork-technique'),
  artworkDescription: document.getElementById('artwork-description'),
  artworkThemeId: document.getElementById('artwork-theme-id'),
  artworkSectionId: document.getElementById('artwork-section-id'),
  artworkOrder: document.getElementById('artwork-order'),
  artworkPublished: document.getElementById('artwork-published'),
  saveArtworkBtn: document.getElementById('save-artwork-btn'),

  uploadArtworkId: document.getElementById('upload-artwork-id'),
  uploadFile: document.getElementById('upload-file'),
  uploadBtn: document.getElementById('upload-btn'),

  refreshCatalogBtn: document.getElementById('refresh-catalog-btn'),
  catalogOutput: document.getElementById('catalog-output'),

  refreshAnalyticsBtn: document.getElementById('refresh-analytics-btn'),
  analyticsOutput: document.getElementById('analytics-output')
};

function print(outputNode, value) {
  outputNode.textContent = typeof value === 'string'
    ? value
    : JSON.stringify(value, null, 2);
}

function setAuthStatus(text) {
  ui.authStatus.textContent = text;
}

async function refreshAuthStatus() {
  try {
    const session = await getSession();
    if (session?.user?.email) {
      setAuthStatus(`Autenticado: ${session.user.email}`);
    } else {
      setAuthStatus('No autenticado');
    }
  } catch (error) {
    setAuthStatus(`Error auth: ${error.message}`);
  }
}

async function onLogin() {
  try {
    await login(ui.email.value.trim(), ui.password.value);
    await refreshAuthStatus();
  } catch (error) {
    setAuthStatus(`Login error: ${error.message}`);
  }
}

async function onLogout() {
  try {
    await logout();
    await refreshAuthStatus();
  } catch (error) {
    setAuthStatus(`Logout error: ${error.message}`);
  }
}

async function onSaveRoom() {
  try {
    const payload = {
      slug: ui.roomSlug.value.trim(),
      title: ui.roomTitle.value.trim(),
      color: ui.roomColor.value.trim(),
      sort_order: Number(ui.roomOrder.value || 0),
      is_published: true
    };

    const result = await upsertRoom(payload);
    print(ui.catalogOutput, result);
  } catch (error) {
    print(ui.catalogOutput, { error: error.message });
  }
}

async function onSaveArtwork() {
  try {
    const payload = {
      id: ui.artworkId.value.trim() || undefined,
      legacy_numeric_id: ui.artworkLegacy.value ? Number(ui.artworkLegacy.value) : null,
      room_slug: ui.artworkRoomSlug.value.trim(),
      title: ui.artworkTitle.value.trim(),
      author: ui.artworkAuthor.value.trim() || 'Artista',
      year: ui.artworkYear.value.trim() || null,
      technique: ui.artworkTechnique.value.trim() || null,
      description: ui.artworkDescription.value.trim() || null,
      theme_id: ui.artworkThemeId.value.trim() || null,
      section_id: ui.artworkSectionId.value.trim() || null,
      sort_order: Number(ui.artworkOrder.value || 0),
      is_published: ui.artworkPublished.value === 'true'
    };

    const result = await upsertArtwork(payload);
    print(ui.catalogOutput, result);
  } catch (error) {
    print(ui.catalogOutput, { error: error.message });
  }
}

async function onUpload() {
  try {
    const artworkId = ui.uploadArtworkId.value.trim();
    const file = ui.uploadFile.files?.[0];
    const result = await uploadArtworkDerivatives(artworkId, file);
    print(ui.catalogOutput, result);
  } catch (error) {
    print(ui.catalogOutput, { error: error.message });
  }
}

async function onRefreshCatalog() {
  try {
    const result = await fetchCatalog();
    print(ui.catalogOutput, result);
  } catch (error) {
    print(ui.catalogOutput, { error: error.message });
  }
}

async function onRefreshAnalytics() {
  try {
    const result = await refreshAndLoadAnalytics();
    print(ui.analyticsOutput, result);
  } catch (error) {
    print(ui.analyticsOutput, { error: error.message });
  }
}

ui.loginBtn.addEventListener('click', onLogin);
ui.logoutBtn.addEventListener('click', onLogout);
ui.saveRoomBtn.addEventListener('click', onSaveRoom);
ui.saveArtworkBtn.addEventListener('click', onSaveArtwork);
ui.uploadBtn.addEventListener('click', onUpload);
ui.refreshCatalogBtn.addEventListener('click', onRefreshCatalog);
ui.refreshAnalyticsBtn.addEventListener('click', onRefreshAnalytics);

refreshAuthStatus();
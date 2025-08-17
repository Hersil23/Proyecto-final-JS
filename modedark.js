// ========================================
// MODEDARK.JS - Modo oscuro persistente
// ========================================

class DarkModeManager {
  constructor() {
    this.STORAGE_KEY = 'darkMode';
    this.darkToggleBtn = null;
    this.html = document.documentElement;
    this.init();
  }

  init() {
    // Cargar tema guardado INMEDIATAMENTE para evitar parpadeo
    this.loadSavedTheme();
    
    // Esperar a que el DOM cargue para configurar el botón
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupButton());
    } else {
      this.setupButton();
    }
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme === 'dark') {
      this.html.classList.add('dark');
      console.log('🌙 Modo oscuro cargado');
    } else {
      this.html.classList.remove('dark');
      console.log('☀️ Modo claro cargado');
    }
  }

  setupButton() {
    this.darkToggleBtn = document.getElementById('darkToggle');
    
    if (!this.darkToggleBtn) {
      console.warn('⚠️ Botón de modo oscuro no encontrado');
      return;
    }

    // Configurar icono inicial
    this.updateButtonIcon();
    
    // Agregar event listener
    this.darkToggleBtn.addEventListener('click', () => this.toggleDarkMode());
    
    console.log('✅ Modo oscuro inicializado');
  }

  toggleDarkMode() {
    const isDark = this.html.classList.toggle('dark');
    
    // Guardar preferencia
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
    
    // Actualizar icono
    this.updateButtonIcon();
    
    console.log(`🔄 Modo cambiado a: ${isDark ? 'oscuro' : 'claro'}`);
  }

  updateButtonIcon() {
    if (!this.darkToggleBtn) return;
    
    const isDark = this.html.classList.contains('dark');
    
    // Actualizar contenido del botón
    if (isDark) {
      this.darkToggleBtn.innerHTML = '<span class="text-yellow-400">☀️</span>';
      this.darkToggleBtn.title = 'Cambiar a modo claro';
    } else {
      this.darkToggleBtn.innerHTML = '<span class="text-blue-600">🌙</span>';
      this.darkToggleBtn.title = 'Cambiar a modo oscuro';
    }
  }

  // Función pública para forzar un tema
  forceTheme(theme) {
    if (theme === 'dark') {
      this.html.classList.add('dark');
    } else {
      this.html.classList.remove('dark');
    }
    
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateButtonIcon();
  }

  // Función pública para obtener el tema actual
  getCurrentTheme() {
    return this.html.classList.contains('dark') ? 'dark' : 'light';
  }
}

// Crear instancia global e inicializar INMEDIATAMENTE
const darkMode = new DarkModeManager();
// ========================================
// AUTH.JS - Sistema de autenticación
// ========================================

class AuthSystem {
  constructor() {
    this.USERS_KEY = 'usuariosRegistrados';
    this.CURRENT_USER_KEY = 'usuarioActivo';
    console.log('✅ Sistema de autenticación inicializado');
  }

  // =====================================
  // REGISTRO
  // =====================================
  registerUser(userData) {
    const { nombre, apellido, correo, contrasena } = userData;
    
    // Validaciones
    if (!nombre || !apellido || !correo || !contrasena) {
      return { success: false, message: 'Todos los campos son requeridos' };
    }
    
    if (!correo.includes('@') || !correo.includes('.')) {
      return { success: false, message: 'El correo no es válido' };
    }
    
    if (contrasena.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const usuarios = this.getAllUsers();
    
    if (usuarios.find(u => u.correo === correo.toLowerCase())) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    const nuevoUsuario = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.toLowerCase().trim(),
      contrasena,
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(usuarios));
      console.log('✅ Usuario registrado:', nuevoUsuario.correo);
      return { success: true, message: 'Usuario registrado correctamente' };
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      return { success: false, message: 'Error al guardar el usuario' };
    }
  }

  // =====================================
  // LOGIN
  // =====================================
  loginUser(correo, contrasena, recordar = false) {
    if (!correo || !contrasena) {
      return { success: false, message: 'Correo y contraseña son requeridos' };
    }

    const usuarios = this.getAllUsers();
    const usuario = usuarios.find(u => u.correo === correo.toLowerCase());
    
    if (!usuario) {
      return { success: false, message: 'Usuario no encontrado. Por favor regístrate.' };
    }

    if (usuario.contrasena !== contrasena) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    const sessionData = {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo
      },
      timestamp: new Date().toISOString(),
      remember: recordar
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(sessionData));
    console.log('✅ Sesión iniciada:', usuario.correo);
    
    return { success: true, message: 'Inicio de sesión exitoso', user: sessionData.user };
  }

  // =====================================
  // SESIÓN
  // =====================================
  getCurrentUser() {
    try {
      const sessionData = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!sessionData) return null;
      const { user } = JSON.parse(sessionData);
      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  logoutUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    console.log('✅ Sesión cerrada');
  }

  requireAuth(redirectUrl = 'iniciar.html') {
    const user = this.getCurrentUser();
    
    if (!user) {
      alert('🔒 Debes iniciar sesión para acceder a esta página.');
      window.location.replace(redirectUrl);
      return null;
    }
    
    return user;
  }

  getAllUsers() {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  // =====================================
  // FAVORITOS
  // =====================================
  getFavorites() {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    try {
      const favorites = localStorage.getItem(`favorites_${user.correo}`);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      return [];
    }
  }

  saveFavorites(favorites) {
    const user = this.getCurrentUser();
    if (!user) return;
    
    try {
      localStorage.setItem(`favorites_${user.correo}`, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  }

  isFavorite(characterId) {
    return this.getFavorites().includes(parseInt(characterId));
  }

  toggleFavorite(characterId) {
    if (!this.isLoggedIn()) {
      return false;
    }

    const id = parseInt(characterId);
    let favorites = this.getFavorites();
    const index = favorites.indexOf(id);

    if (index > -1) {
      favorites.splice(index, 1);
      this.saveFavorites(favorites);
      console.log(`❌ Personaje ${id} removido de favoritos`);
      return false;
    } else {
      favorites.push(id);
      this.saveFavorites(favorites);
      console.log(`⭐ Personaje ${id} agregado a favoritos`);
      return true;
    }
  }

  getUserStats() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const favorites = this.getFavorites();
    
    return {
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      totalFavoritos: favorites.length,
      favoritos: favorites
    };
  }

  clearAllData() {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Todos los datos limpiados');
  }
}

// Crear instancia global
const auth = new AuthSystem();
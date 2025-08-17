// ========================================
// API.JS - Manejo de API de Rick and Morty
// ========================================

class RickMortyAPI {
  constructor() {
    this.baseUrl = 'https://rickandmortyapi.com/api/character';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    console.log('🚀 API de Rick and Morty inicializada');
  }

  /**
   * Obtener personajes con paginación
   * @param {number} page - Número de página
   * @returns {Promise} - Datos de la API
   */
  async getCharacters(page = 1) {
    const cacheKey = `characters_page_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      console.log(`📦 Datos de página ${page} obtenidos del cache`);
      return cached;
    }

    try {
      console.log(`📡 Obteniendo página ${page} de la API...`);
      const url = `${this.baseUrl}?page=${page}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Página ${page} no encontrada`);
        }
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      this.saveToCache(cacheKey, data);
      
      console.log(`✅ Página ${page} cargada: ${data.results.length} personajes`);
      return data;
      
    } catch (error) {
      console.error(`❌ Error al obtener página ${page}:`, error);
      throw error;
    }
  }

  /**
   * Obtener personaje por ID
   * @param {number} id - ID del personaje
   * @returns {Promise} - Datos del personaje
   */
  async getCharacterById(id) {
    const cacheKey = `character_${id}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      console.log(`📦 Personaje ${id} obtenido del cache`);
      return cached;
    }

    try {
      console.log(`📡 Obteniendo personaje ${id}...`);
      const url = `${this.baseUrl}/${id}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Personaje ${id} no encontrado`);
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      this.saveToCache(cacheKey, data);
      
      console.log(`✅ Personaje ${id} cargado: ${data.name}`);
      return data;
      
    } catch (error) {
      console.error(`❌ Error al obtener personaje ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener múltiples personajes por IDs
   * @param {Array} ids - Array de IDs
   * @returns {Promise} - Array de personajes
   */
  async getCharactersByIds(ids) {
    if (!ids || ids.length === 0) {
      console.log('⚠️ No hay IDs de personajes para cargar');
      return [];
    }

    try {
      console.log(`📡 Obteniendo ${ids.length} personajes favoritos: [${ids.join(', ')}]`);
      
      if (ids.length === 1) {
        // Un solo personaje
        const character = await this.getCharacterById(ids[0]);
        return [character];
      } else {
        // Múltiples personajes - usar endpoint que acepta múltiples IDs
        const idsString = ids.join(',');
        const url = `${this.baseUrl}/${idsString}`;
        
        console.log(`📡 URL de solicitud: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // La API puede devolver un array o un objeto único
        const characters = Array.isArray(data) ? data : [data];
        
        // Guardar cada personaje en cache
        characters.forEach(char => {
          this.saveToCache(`character_${char.id}`, char);
        });
        
        console.log(`✅ ${characters.length} personajes favoritos cargados exitosamente`);
        return characters;
      }
      
    } catch (error) {
      console.error('❌ Error al obtener personajes por IDs:', error);
      
      // Si falla la solicitud múltiple, intentar cargar uno por uno
      if (ids.length > 1) {
        console.log('🔄 Intentando cargar personajes individualmente...');
        const characters = [];
        
        for (const id of ids) {
          try {
            const character = await this.getCharacterById(id);
            characters.push(character);
          } catch (individualError) {
            console.warn(`⚠️ No se pudo cargar el personaje ${id}:`, individualError);
          }
        }
        
        if (characters.length > 0) {
          console.log(`✅ ${characters.length} de ${ids.length} personajes cargados individualmente`);
          return characters;
        }
      }
      
      throw error;
    }
  }

  /**
   * Buscar personajes por nombre
   * @param {string} name - Nombre a buscar
   * @returns {Promise} - Resultados de búsqueda
   */
  async searchCharacters(name) {
    if (!name || name.trim().length === 0) {
      throw new Error('Nombre de búsqueda requerido');
    }

    try {
      console.log(`🔍 Buscando personajes: "${name}"`);
      const url = `${this.baseUrl}?name=${encodeURIComponent(name.trim())}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return { results: [], info: { count: 0, pages: 0 } };
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Búsqueda completada: ${data.results.length} resultados`);
      return data;
      
    } catch (error) {
      console.error(`❌ Error en búsqueda:`, error);
      throw error;
    }
  }

  /**
   * Guardar en cache
   * @param {string} key - Clave del cache
   * @param {*} data - Datos a guardar
   */
  saveToCache(key, data) {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, cacheItem);
  }

  /**
   * Obtener del cache
   * @param {string} key - Clave del cache
   * @returns {*} - Datos del cache o null si no existe/expiró
   */
  getFromCache(key) {
    const cacheItem = this.cache.get(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // Verificar si expiró
    if (Date.now() - cacheItem.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cacheItem.data;
  }

  /**
   * Limpiar cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache de API limpiado');
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheExpiry) {
        expiredItems++;
      } else {
        validItems++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validItems,
      expired: expiredItems
    };
  }

  /**
   * Limpiar elementos expirados del cache
   */
  cleanExpiredCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheExpiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 ${keysToDelete.length} elementos expirados eliminados del cache`);
    }
  }
}

// Crear instancia global
const rickMortyAPI = new RickMortyAPI();

// Limpiar cache expirado cada 10 minutos
setInterval(() => {
  rickMortyAPI.cleanExpiredCache();
}, 10 * 60 * 1000);
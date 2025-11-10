// Offline storage manager for Sequential Thinking Platform
export class OfflineStorageManager {
  private dbName = 'SequentialThinkingDB'
  private version = 1

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for different types of data
        if (!db.objectStoreNames.contains('reasoningMaps')) {
          const reasoningStore = db.createObjectStore('reasoningMaps', { keyPath: 'id' })
          reasoningStore.createIndex('domain', 'domain', { unique: false })
          reasoningStore.createIndex('lastAccessed', 'lastAccessed', { unique: false })
        }

        if (!db.objectStoreNames.contains('learningProgress')) {
          const progressStore = db.createObjectStore('learningProgress', { keyPath: 'id' })
          progressStore.createIndex('userId', 'userId', { unique: false })
          progressStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('offlineProgress')) {
          const offlineStore = db.createObjectStore('offlineProgress', { keyPath: 'id' })
          offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        }

        if (!db.objectStoreNames.contains('cachedContent')) {
          const contentStore = db.createObjectStore('cachedContent', { keyPath: 'url' })
          contentStore.createIndex('contentType', 'contentType', { unique: false })
          contentStore.createIndex('cachedAt', 'cachedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          const preferencesStore = db.createObjectStore('userPreferences', { keyPath: 'key' })
        }
      }
    })
  }

  // Reasoning Maps Management
  async saveReasoningMap(map: any): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readwrite')
      const store = transaction.objectStore('reasoningMaps')
      
      const mapWithMeta = {
        ...map,
        lastAccessed: Date.now(),
        downloadedAt: Date.now()
      }

      const request = store.put(mapWithMeta)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getReasoningMap(id: string): Promise<any | null> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readonly')
      const store = transaction.objectStore('reasoningMaps')
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          // Update last accessed time
          this.updateLastAccessed(id)
          resolve(request.result)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getAllReasoningMaps(): Promise<any[]> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readonly')
      const store = transaction.objectStore('reasoningMaps')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getReasoningMapsByDomain(domain: string): Promise<any[]> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readonly')
      const store = transaction.objectStore('reasoningMaps')
      const index = store.index('domain')
      const request = index.getAll(domain)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteReasoningMap(id: string): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readwrite')
      const store = transaction.objectStore('reasoningMaps')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async updateLastAccessed(id: string): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps'], 'readwrite')
      const store = transaction.objectStore('reasoningMaps')
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          const updated = { ...request.result, lastAccessed: Date.now() }
          const updateRequest = store.put(updated)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Learning Progress Management
  async saveLearningProgress(progress: any): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['learningProgress'], 'readwrite')
      const store = transaction.objectStore('learningProgress')
      
      const progressWithMeta = {
        ...progress,
        timestamp: Date.now(),
        syncStatus: navigator.onLine ? 'synced' : 'pending'
      }

      const request = store.put(progressWithMeta)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getLearningProgress(userId: string): Promise<any[]> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['learningProgress'], 'readonly')
      const store = transaction.objectStore('learningProgress')
      const index = store.index('userId')
      const request = index.getAll(userId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Offline Progress Management
  async saveOfflineProgress(progress: any): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineProgress'], 'readwrite')
      const store = transaction.objectStore('offlineProgress')
      
      const offlineProgress = {
        ...progress,
        id: `${progress.userId}-${progress.timestamp}-${Math.random()}`,
        syncStatus: 'pending',
        createdAt: Date.now()
      }

      const request = store.put(offlineProgress)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineProgress(): Promise<any[]> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineProgress'], 'readonly')
      const store = transaction.objectStore('offlineProgress')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markOfflineProgressSynced(id: string): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineProgress'], 'readwrite')
      const store = transaction.objectStore('offlineProgress')
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          const updated = { ...request.result, syncStatus: 'synced' }
          const updateRequest = store.put(updated)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncedOfflineProgress(): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineProgress'], 'readwrite')
      const store = transaction.objectStore('offlineProgress')
      const index = store.index('syncStatus')
      const request = index.openCursor(IDBKeyRange.only('synced'))

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Cached Content Management
  async cacheContent(url: string, content: any, contentType: string): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cachedContent'], 'readwrite')
      const store = transaction.objectStore('cachedContent')
      
      const cachedItem = {
        url,
        content,
        contentType,
        cachedAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      }

      const request = store.put(cachedItem)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedContent(url: string): Promise<any | null> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cachedContent'], 'readonly')
      const store = transaction.objectStore('cachedContent')
      const request = store.get(url)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiresAt > Date.now()) {
          resolve(result.content)
        } else {
          // Remove expired content
          if (result) {
            this.removeCachedContent(url)
          }
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async removeCachedContent(url: string): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cachedContent'], 'readwrite')
      const store = transaction.objectStore('cachedContent')
      const request = store.delete(url)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearExpiredCache(): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cachedContent'], 'readwrite')
      const store = transaction.objectStore('cachedContent')
      const request = store.openCursor()

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          if (cursor.value.expiresAt <= Date.now()) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // User Preferences
  async saveUserPreference(key: string, value: any): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userPreferences'], 'readwrite')
      const store = transaction.objectStore('userPreferences')
      
      const preference = {
        key,
        value,
        updatedAt: Date.now()
      }

      const request = store.put(preference)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getUserPreference(key: string): Promise<any | null> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userPreferences'], 'readonly')
      const store = transaction.objectStore('userPreferences')
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Storage Management
  async getStorageInfo(): Promise<any> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reasoningMaps', 'learningProgress', 'offlineProgress', 'cachedContent'], 'readonly')
      
      const stores = ['reasoningMaps', 'learningProgress', 'offlineProgress', 'cachedContent']
      const counts: any = {}
      let completed = 0

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName)
        const request = store.count()

        request.onsuccess = () => {
          counts[storeName] = request.result
          completed++
          if (completed === stores.length) {
            resolve(counts)
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async clearAllData(): Promise<void> {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const stores = ['reasoningMaps', 'learningProgress', 'offlineProgress', 'cachedContent']
      let completed = 0

      stores.forEach(storeName => {
        const transaction = db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => {
          completed++
          if (completed === stores.length) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager()
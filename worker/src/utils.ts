// Utility functions for Worker

export function generateId(): string {
  // Simple UUID-like ID generation
  const chars = '0123456789abcdef'
  let id = ''
  for (let i = 0; i < 32; i++) {
    if (i === 12) {
      id += '4' // Version 4
    } else if (i === 16) {
      id += chars[(Math.random() * 4) | 8] // Variant
    } else {
      id += chars[(Math.random() * 16) | 0]
    }
    if (i === 7 || i === 11 || i === 15 || i === 19) {
      id += '-'
    }
  }
  return id
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

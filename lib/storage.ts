import { SeatingSession } from '@/types'

const STORAGE_KEY = 'seating-sessions'
const CURRENT_SESSION_KEY = 'current-session'

export function saveSession(session: SeatingSession): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save session:', error)
    throw new Error('세션 저장에 실패했습니다.')
  }
}

export function loadSession(): SeatingSession | null {
  try {
    const data = localStorage.getItem(CURRENT_SESSION_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load session:', error)
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

export function saveSessionToHistory(session: SeatingSession): void {
  try {
    const history = loadSessionHistory()
    history.unshift(session)
    if (history.length > 10) {
      history.pop()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save to history:', error)
  }
}

export function loadSessionHistory(): SeatingSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load history:', error)
    return []
  }
}

export function exportToJSON(session: SeatingSession): void {
  const dataStr = JSON.stringify(session, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `seating-${session.name || new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON(file: File): Promise<SeatingSession> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target?.result as string)
        resolve(session)
      } catch (error) {
        reject(new Error('JSON 파일 형식이 올바르지 않습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsText(file)
  })
}

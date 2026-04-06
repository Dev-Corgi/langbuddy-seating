import _ from 'lodash'
import { Participant, Assignment, RoundData } from '@/types'

interface PreviousRoundData {
  round: number
  assignments: Assignment[]
}

function getRecommendedTableCountForLanguage(count: number): number {
  if (count <= 0) return 0
  if (count <= 4) return 1
  if (count === 5 || count === 6) return 1
  if (count === 7) return 2
  return Math.floor(count / 4)
}

function buildCapacitiesForLanguage(count: number, tableCount?: number): number[] {
  if (count <= 0) return []

  let t = tableCount
  if (!t || t <= 0) {
    t = getRecommendedTableCountForLanguage(count)
  }
  if (t <= 0) t = 1

  if (count <= 4 && t === 1) {
    return [count]
  }

  if ((count === 5 || count === 6) && t === 1) {
    return [count]
  }

  if (count === 7 && t === 2) {
    return [4, 3]
  }

  if (t > count) {
    t = count
  }

  const base = Math.floor(count / t)
  const capacities = new Array(t).fill(base)
  let remaining = count - base * t
  let idx = 0

  while (remaining > 0) {
    capacities[idx % t] += 1
    remaining -= 1
    idx += 1
  }

  return capacities
}

export function arrangeRound(
  roundNumber: number,
  participants: Participant[],
  langTableCounts: Record<string, number>,
  previousRounds: RoundData[] = []
): RoundData {
  const languageGroups = _.groupBy(participants, 'language')
  const languages = Object.keys(languageGroups).sort()
  
  const newRoundAssignments: Assignment[] = []
  const tableLanguages: Record<string, string> = {}
  let totalTableIdx = 0
  
  // 이전 라운드들에서 만난 쌍 추적
  const seenPairs: Map<string, number> = new Map()
  previousRounds.forEach(round => {
    const tableGroups = _.groupBy(round.assignments, 'table_label')
    Object.values(tableGroups).forEach(group => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const pair = [group[i].participant_id, group[j].participant_id].sort().join('-')
          seenPairs.set(pair, (seenPairs.get(pair) || 0) + 1)
        }
      }
    })
  })
  
  languages.forEach(lang => {
    const members = languageGroups[lang]
    if (!members || members.length === 0) {
      return
    }

    const capacities = buildCapacitiesForLanguage(members.length, langTableCounts[lang])
    const langTableCount = capacities.length
    const langTableLabels = Array.from({ length: langTableCount }, (_, i) =>
      String.fromCharCode(65 + totalTableIdx + i)
    )

    langTableLabels.forEach(label => {
      tableLanguages[label] = lang
    })

    totalTableIdx += langTableCount

    let bestAssignments: Assignment[] = []
    let minPenalty = Infinity

    for (let attempt = 0; attempt < 200; attempt++) {
      const currentAssignments: Assignment[] = []
      const shuffledMembers = _.shuffle([...members])
      let memberIdx = 0

      capacities.forEach((cap, idx) => {
        const label = langTableLabels[idx]
        for (let k = 0; k < cap && memberIdx < shuffledMembers.length; k++) {
          const p = shuffledMembers[memberIdx]
          currentAssignments.push({
            participant_id: p.id,
            table_label: label,
          })
          memberIdx += 1
        }
      })

      let penalty = 0
      const tableGroups = _.groupBy(currentAssignments, 'table_label')
      Object.values(tableGroups).forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const pair = [group[i].participant_id, group[j].participant_id].sort().join('-')
            const previousMeetings = seenPairs.get(pair) || 0
            if (previousMeetings > 0) {
              if (previousMeetings === 1) {
                penalty += 10
              } else if (previousMeetings === 2) {
                penalty += 1000
              } else {
                penalty += 10000 * previousMeetings
              }
            }
          }
        }
      })

      if (penalty < minPenalty) {
        minPenalty = penalty
        bestAssignments = currentAssignments
      }
      if (penalty === 0) break
    }

    newRoundAssignments.push(...bestAssignments)
  })

  return { round: roundNumber, assignments: newRoundAssignments, tableLanguages }
}

// 기존 함수 유지 (호환성)
export function runAutoArrange(
  participants: Participant[],
  langTableCounts: Record<string, number>
): RoundData[] {
  const round1 = arrangeRound(1, participants, langTableCounts, [])
  const round2 = arrangeRound(2, participants, langTableCounts, [round1])
  const round3 = arrangeRound(3, participants, langTableCounts, [round1, round2])
  
  return [round1, round2, round3]
}

export function calculateAutoTableCounts(participants: Participant[]): Record<string, number> {
  const languageGroups = _.groupBy(participants, 'language')
  const counts: Record<string, number> = {}
  
  Object.entries(languageGroups).forEach(([lang, members]) => {
    counts[lang] = getRecommendedTableCountForLanguage(members.length)
  })
  
  return counts
}

export function getTableWarnings(participants: Participant[]): string[] {
  const hasKorean = participants.some(p => p.nationality === '한국인')
  const hasForeigner = participants.some(p => p.nationality === '외국인')
  const hasMale = participants.some(p => p.gender === '남')
  const hasFemale = participants.some(p => p.gender === '여')

  const warnings = []
  if (!hasKorean) warnings.push('한국인 없음')
  if (!hasForeigner) warnings.push('외국인 없음')
  if (!hasMale) warnings.push('남성 없음')
  if (!hasFemale) warnings.push('여성 없음')

  return warnings
}

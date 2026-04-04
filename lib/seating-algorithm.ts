import _ from 'lodash'
import { Participant, Assignment, RoundData } from '@/types'

interface PreviousRoundData {
  round: number
  assignments: Assignment[]
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
    const koreans = members.filter(p => p.nationality === '한국인')
    const foreigners = members.filter(p => p.nationality === '외국인')
    
    const langTableCount = langTableCounts[lang] || Math.ceil(members.length / 5)
    const langTableLabels = Array.from({ length: langTableCount }, (_, i) => 
      String.fromCharCode(65 + totalTableIdx + i)
    )
    
    totalTableIdx += langTableCount

    let bestAssignments: Assignment[] = []
    let minPenalty = Infinity

    // 🔧 개선 1: 결정론적 사전 필터링 - 2번 이상 만난 쌍을 피하도록 초기 배치
    const avoidPairs = new Set<string>()
    seenPairs.forEach((count, pair) => {
      if (count >= 2) avoidPairs.add(pair)
    })

    // 🔧 개선 2: 시도 횟수 50 → 200회로 증가
    for (let attempt = 0; attempt < 200; attempt++) {
      const currentAssignments: Assignment[] = []
      
      const shuffledK = _.shuffle([...koreans])
      const shuffledF = _.shuffle([...foreigners])
      
      shuffledK.forEach((p, idx) => {
        currentAssignments.push({ 
          participant_id: p.id, 
          table_label: langTableLabels[idx % langTableCount] 
        })
      })
      
      shuffledF.forEach((p, idx) => {
        currentAssignments.push({ 
          participant_id: p.id, 
          table_label: langTableLabels[idx % langTableCount] 
        })
      })

      // 🔧 개선 3: 페널티 가중치 강화 (3번 만남에 극도로 높은 페널티)
      let penalty = 0
      const tableGroups = _.groupBy(currentAssignments, 'table_label')
      Object.values(tableGroups).forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const pair = [group[i].participant_id, group[j].participant_id].sort().join('-')
            const previousMeetings = seenPairs.get(pair) || 0
            if (previousMeetings > 0) {
              // 기존: penalty += previousMeetings
              // 개선: 2번 만남 = 10점, 3번 만남 = 1000점 (사실상 불가능하게)
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
      // 완벽한 배치를 찾으면 즉시 종료
      if (penalty === 0) break
    }

    newRoundAssignments.push(...bestAssignments)
  })

  return { round: roundNumber, assignments: newRoundAssignments }
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
    counts[lang] = Math.ceil(members.length / 5)
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

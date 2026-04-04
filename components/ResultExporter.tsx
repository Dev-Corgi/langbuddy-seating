'use client'

import { Copy, Download, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Participant, RoundData } from '@/types'
import { toast } from 'sonner'
import _ from 'lodash'

interface ResultExporterProps {
  rounds: RoundData[]
  participants: Participant[]
  currentRound: number
}

export function ResultExporter({ rounds, participants, currentRound }: ResultExporterProps) {
  const handleCopyResults = () => {
    const currentAssignments = rounds.find(r => r.round === currentRound)?.assignments || []
    if (currentAssignments.length === 0) {
      toast.error('배치 결과가 없습니다.')
      return
    }

    const tableGroups = _.groupBy(currentAssignments, 'table_label')
    let text = `[자리배치 ${currentRound}라운드 결과]\n\n`
    
    Object.keys(tableGroups).sort().forEach(label => {
      const members = tableGroups[label]
        .map(a => {
          const p = participants.find(p => p.id === a.participant_id)
          return p ? `${p.name}(${p.language})` : ''
        })
        .filter(Boolean)
        .join(', ')
      text += `${label} 테이블: ${members}\n`
    })

    navigator.clipboard.writeText(text)
    toast.success('배치 결과가 복사되었습니다.')
  }

  const handleExportCSV = () => {
    const currentAssignments = rounds.find(r => r.round === currentRound)?.assignments || []
    if (currentAssignments.length === 0) {
      toast.error('배치 결과가 없습니다.')
      return
    }

    let csv = '테이블,이름,성별,국적,언어\n'
    
    const tableGroups = _.groupBy(currentAssignments, 'table_label')
    Object.keys(tableGroups).sort().forEach(label => {
      tableGroups[label].forEach(a => {
        const p = participants.find(p => p.id === a.participant_id)
        if (p) {
          csv += `${label},${p.name},${p.gender},${p.nationality},${p.language}\n`
        }
      })
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `seating-round${currentRound}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV 파일이 다운로드되었습니다.')
  }

  const handleExportAllRounds = () => {
    if (rounds.every(r => r.assignments.length === 0)) {
      toast.error('배치 결과가 없습니다.')
      return
    }

    let text = '[전체 라운드 배치 결과]\n\n'
    
    rounds.forEach(round => {
      if (round.assignments.length === 0) return
      
      text += `=== ${round.round}라운드 ===\n`
      const tableGroups = _.groupBy(round.assignments, 'table_label')
      
      Object.keys(tableGroups).sort().forEach(label => {
        const members = tableGroups[label]
          .map(a => {
            const p = participants.find(p => p.id === a.participant_id)
            return p ? `${p.name}(${p.language})` : ''
          })
          .filter(Boolean)
          .join(', ')
        text += `${label} 테이블: ${members}\n`
      })
      text += '\n'
    })

    navigator.clipboard.writeText(text)
    toast.success('전체 라운드 결과가 복사되었습니다.')
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl font-bold gap-2"
        onClick={handleCopyResults}
      >
        <Copy className="w-4 h-4" />
        현재 라운드 복사
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl font-bold gap-2"
        onClick={handleExportCSV}
      >
        <Download className="w-4 h-4" />
        CSV 다운로드
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl font-bold gap-2"
        onClick={handleExportAllRounds}
      >
        <FileJson className="w-4 h-4" />
        전체 복사
      </Button>
    </div>
  )
}

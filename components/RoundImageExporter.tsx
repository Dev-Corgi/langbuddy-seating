'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'
import { Participant, RoundData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RoundImageExporterProps {
  round: number
  roundData: RoundData
  participants: Participant[]
}

export function RoundImageExporter({ round, roundData, participants }: RoundImageExporterProps) {
  const exportRef = useRef<HTMLDivElement>(null)

  const handleExportImage = async () => {
    if (!exportRef.current) return

    try {
      // DOM 페인트 완료 대기
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      const link = document.createElement('a')
      link.download = `${round}라운드_배치결과.png`
      link.href = dataUrl
      link.click()

      toast.success(`${round}라운드 배치 결과를 이미지로 저장했습니다.`)
    } catch (error) {
      console.error('Failed to export image:', error)
      toast.error('이미지 내보내기에 실패했습니다.')
    }
  }

  const tableLabels = Array.from(new Set(roundData.assignments.map(a => a.table_label))).sort()

  return (
    <>
      <Button
        onClick={handleExportImage}
        variant="outline"
        className="rounded-xl font-bold gap-2"
        disabled={roundData.assignments.length === 0}
      >
        <Download className="w-4 h-4" />
        이미지로 내보내기
      </Button>

      {/* 숨겨진 내보내기용 영역 */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div ref={exportRef} className="bg-white p-8" style={{ width: '1200px' }}>
          <div className="mb-6">
            <h1 className="text-3xl font-black mb-2">{round} Round 배치 결과</h1>
            <p className="text-muted-foreground font-medium">총 {participants.length}명의 참가자</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {tableLabels.map(label => {
              const tableParticipants = roundData.assignments
                .filter(a => a.table_label === label)
                .map(a => participants.find(p => p.id === a.participant_id))
                .filter(Boolean) as Participant[]

              const tableLanguage = tableParticipants.length > 0 ? tableParticipants[0].language : ''
              
              return (
                <Card key={label} className="border shadow-md rounded-3xl overflow-hidden">
                  <CardHeader className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-black">{label} Table</CardTitle>
                        {tableLanguage && (
                          <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                            {tableLanguage}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-500">{tableParticipants.length}명</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {tableParticipants.map(p => (
                        <div
                          key={p.id}
                          className="flex flex-col p-2 rounded-lg border bg-white shadow-sm"
                        >
                          <p className="font-bold text-sm truncate mb-1">{p.name}</p>
                          <div className="flex gap-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              p.nationality === '외국인' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {p.nationality}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                              p.gender === '여' ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.gender}
                            </span>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-primary/10 text-primary">
                              {p.language}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

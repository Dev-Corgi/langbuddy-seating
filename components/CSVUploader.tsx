'use client'

import { useCallback, useState } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { parseCSVString, validateParticipants, generateSampleCSV } from '@/lib/csv-parser'
import { Participant } from '@/types'
import { toast } from 'sonner'

interface CSVUploaderProps {
  onDataLoaded: (participants: Participant[]) => void
}

export function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [pastedText, setPastedText] = useState('')

  const handleProcessData = useCallback((participants: Participant[]) => {
    const errors = validateParticipants(participants)
    
    if (errors.length > 0) {
      toast.error(`데이터 검증 실패: ${errors.length}개의 오류가 있습니다.`, {
        description: errors.slice(0, 3).join('\n')
      })
      return false
    }

    onDataLoaded(participants)
    toast.success(`${participants.length}명의 참가자를 불러왔습니다.`)
    return true
  }, [onDataLoaded])

  const handlePasteSubmit = useCallback(() => {
    if (!pastedText.trim()) {
      toast.error('데이터를 입력해주세요.')
      return
    }

    setIsProcessing(true)
    try {
      const participants = parseCSVString(pastedText)
      if (handleProcessData(participants)) {
        setPastedText('')
      }
    } catch (error) {
      toast.error('데이터 처리 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }, [pastedText, handleProcessData])

  const loadSample = useCallback(() => {
    const csv = generateSampleCSV()
    setPastedText(csv)
    toast.success('샘플 데이터가 입력되었습니다.')
  }, [])

  return (
    <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          참가자 데이터 입력
        </CardTitle>
        <CardDescription className="font-medium">
          참가자 정보를 붙여넣어 불러옵니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            className="w-full h-64 p-4 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono resize-none"
            placeholder="재현,남자,한국인,영어&#10;김정우,남자,한국인,영어&#10;김희원,여자,한국인,영어&#10;AJ,남자,Foreigner,영어&#10;Annique,여자,Foreigner,영어&#10;..."
            value={pastedText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPastedText(e.target.value)}
            disabled={isProcessing}
          />
          <Button 
            className="w-full rounded-xl font-black"
            onClick={handlePasteSubmit}
            disabled={isProcessing || !pastedText.trim()}
          >
            {isProcessing ? '처리 중...' : '데이터 불러오기'}
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-bold mb-1">데이터 형식 안내</p>
            <p className="text-blue-700">
              형식: 이름,성별,국적,언어<br />
              성별: 남자/여자 | 국적: 한국인/Foreigner
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl font-bold gap-2"
          onClick={loadSample}
        >
          <FileText className="w-4 h-4" />
          샘플 데이터 불러오기
        </Button>
      </CardContent>
    </Card>
  )
}

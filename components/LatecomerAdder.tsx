'use client'

import { useState, useCallback } from 'react'
import { UserPlus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Participant } from '@/types'
import { toast } from 'sonner'
import { parseCSVString, validateParticipants } from '@/lib/csv-parser'

interface LatecomerAdderProps {
  onAddParticipant: (participant: Participant) => void
}

export function LatecomerAdder({ onAddParticipant }: LatecomerAdderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'남' | '여'>('남')
  const [nationality, setNationality] = useState<'한국인' | '외국인'>('한국인')
  const [language, setLanguage] = useState<'영어' | '일본어'>('영어')
  const [tab, setTab] = useState<'manual' | 'csv'>('manual')
  const [csvText, setCsvText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: name.trim(),
      gender,
      nationality,
      language,
    }

    onAddParticipant(newParticipant)
    
    // Reset form
    setName('')
    setLanguage('영어')
    setGender('남')
    setNationality('한국인')
    setIsOpen(false)
  }, [name, gender, nationality, language, onAddParticipant])

  const handleSubmitCSV = useCallback(() => {
    if (!csvText.trim()) {
      toast.error('CSV 행을 입력해주세요.')
      return
    }

    setIsProcessing(true)
    try {
      const participants = parseCSVString(csvText)
      const errors = validateParticipants(participants)
      if (errors.length > 0) {
        toast.error(`데이터 검증 실패: ${errors.length}개의 오류가 있습니다.`, {
          description: errors.slice(0, 3).join('\n'),
        })
        return
      }

      participants.forEach(p => onAddParticipant(p))
      toast.success(`${participants.length}명의 참가자를 추가했습니다.`)
      setCsvText('')
      setIsOpen(false)
    } catch (error) {
      toast.error('CSV 데이터 처리 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }, [csvText, onAddParticipant])

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-2xl font-black gap-2 text-base"
        variant="default"
      >
        <UserPlus className="w-4 h-4" />
        참가자 추가
      </Button>
    )
  }

  return (
    <Card className="border-none shadow-lg rounded-[24px] overflow-hidden bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            참가자 추가
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'manual' | 'csv')}>
          <TabsList className="w-full mb-3">
            <TabsTrigger value="manual" className="flex-1">
              직접 입력
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex-1">
              CSV 행 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">이름</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="참가자 이름"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">성별</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={gender === '남' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-xs font-bold"
                    onClick={() => setGender('남')}
                  >
                    남
                  </Button>
                  <Button
                    type="button"
                    variant={gender === '여' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-xs font-bold"
                    onClick={() => setGender('여')}
                  >
                    여
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">국적</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={nationality === '한국인' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-xs font-bold"
                    onClick={() => setNationality('한국인')}
                  >
                    한국인
                  </Button>
                  <Button
                    type="button"
                    variant={nationality === '외국인' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-xs font-bold"
                    onClick={() => setNationality('외국인')}
                  >
                    외국인
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">언어</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={language === '영어' ? 'default' : 'outline'}
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={() => setLanguage('영어')}
                >
                  영어
                </Button>
                <Button
                  type="button"
                  variant={language === '일본어' ? 'default' : 'outline'}
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={() => setLanguage('일본어')}
                >
                  일본어
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full rounded-xl font-black"
            >
              추가하기
            </Button>
          </TabsContent>

          <TabsContent value="csv" className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">CSV 행 입력</label>
              <Textarea
                value={csvText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCsvText(e.target.value)}
                placeholder="재현,남자,한국인,영어&#10;김정우,남자,한국인,영어"
                className="h-40 rounded-2xl font-mono text-xs"
              />
            </div>
            <Button
              onClick={handleSubmitCSV}
              className="w-full rounded-xl font-black"
              disabled={isProcessing || !csvText.trim()}
            >
              {isProcessing ? '처리 중...' : '추가하기'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

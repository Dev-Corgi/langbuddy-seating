'use client'

import { useState, useCallback } from 'react'
import { Settings, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Participant } from '@/types'
import { toast } from 'sonner'

interface ParticipantEditorProps {
  participant: Participant
  isOpen: boolean
  onClose: () => void
  onSave: (updated: Participant) => void
}

export function ParticipantEditor({ participant, isOpen, onClose, onSave }: ParticipantEditorProps) {
  const [name, setName] = useState(participant.name)
  const [gender, setGender] = useState<'남' | '여'>(participant.gender as '남' | '여')
  const [nationality, setNationality] = useState<'한국인' | '외국인'>(participant.nationality as '한국인' | '외국인')
  const [language, setLanguage] = useState<string>(participant.language)

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    const updated: Participant = {
      ...participant,
      name: name.trim(),
      gender,
      nationality,
      language,
    }

    onSave(updated)
    onClose()
  }, [name, gender, nationality, language, participant, onSave, onClose])

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <Card className="border-none shadow-2xl rounded-[24px] overflow-hidden bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                참가자 정보 수정
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={onClose}
              >
                취소
              </Button>
              <Button
                className="flex-1 rounded-xl font-black"
                onClick={handleSubmit}
              >
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

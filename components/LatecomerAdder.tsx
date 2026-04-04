'use client'

import { useState, useCallback } from 'react'
import { UserPlus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Participant } from '@/types'
import { toast } from 'sonner'

interface LatecomerAdderProps {
  onAddParticipant: (participant: Participant) => void
}

export function LatecomerAdder({ onAddParticipant }: LatecomerAdderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'남' | '여'>('남')
  const [nationality, setNationality] = useState<'한국인' | '외국인'>('한국인')
  const [language, setLanguage] = useState<'영어' | '일본어'>('영어')

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    const newParticipant: Participant = {
      id: `latecomer-${Date.now()}`,
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-xl font-bold gap-2"
        variant="outline"
      >
        <UserPlus className="w-4 h-4" />
        늦참자 추가
      </Button>
    )
  }

  return (
    <Card className="border-none shadow-lg rounded-[24px] overflow-hidden bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            늦참자 추가
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
      </CardContent>
    </Card>
  )
}

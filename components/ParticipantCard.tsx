'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Participant } from '@/types'
import { Button } from '@/components/ui/button'

interface ParticipantCardProps {
  participant: Participant
  isOverlay?: boolean
  onEdit?: (participant: Participant) => void
}

export function ParticipantCard({ participant, isOverlay = false, onEdit }: ParticipantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: participant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const isForeigner = participant.nationality === '외국인'
  const isFemale = participant.gender === '여'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center justify-between p-3 mb-2 rounded-xl border bg-card shadow-sm group cursor-grab active:cursor-grabbing overflow-hidden relative",
        isOverlay ? "shadow-xl border-primary" : "border-border",
        isForeigner ? "bg-blue-50/40" : "bg-emerald-50/40"
      )}
    >
      {/* 국적 구분 좌측 컬러바 */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        isForeigner ? "bg-blue-500" : "bg-emerald-500"
      )} />
      
      <div className="flex items-center gap-3 overflow-hidden flex-1 pl-2">
        <div className="p-1 text-muted-foreground">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate">{participant.name}</p>
          <div className="flex gap-1 mt-0.5 items-center">
            {/* 국적 뱃지 */}
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded tracking-tighter",
              isForeigner ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
            )}>
              {participant.nationality}
            </span>

            {/* 성별 뱃지 */}
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
              isFemale ? "bg-pink-100 text-pink-600" : "bg-sky-100 text-sky-700"
            )}>
              {participant.gender}
            </span>
            
            {/* 언어 뱃지 */}
            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {participant.language === '영어' ? (
                <svg className="w-3 h-3" viewBox="0 0 20 14" fill="none">
                  <rect width="20" height="14" fill="#B22234"/>
                  <rect y="1.08" width="20" height="1.08" fill="white"/>
                  <rect y="3.23" width="20" height="1.08" fill="white"/>
                  <rect y="5.38" width="20" height="1.08" fill="white"/>
                  <rect y="7.54" width="20" height="1.08" fill="white"/>
                  <rect y="9.69" width="20" height="1.08" fill="white"/>
                  <rect y="11.85" width="20" height="1.08" fill="white"/>
                  <rect width="8" height="7.54" fill="#3C3B6E"/>
                </svg>
              ) : participant.language === '일본어' ? (
                <svg className="w-3 h-3" viewBox="0 0 20 14" fill="none">
                  <rect width="20" height="14" fill="white"/>
                  <circle cx="10" cy="7" r="3.5" fill="#BC002D"/>
                </svg>
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              )}
              {participant.language}
            </span>
          </div>
        </div>
      </div>
      {onEdit && !isOverlay && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(participant)
          }}
        >
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}

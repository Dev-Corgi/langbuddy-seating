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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center justify-between p-3 mb-2 rounded-xl border bg-card shadow-sm group cursor-grab active:cursor-grabbing",
        isOverlay ? "shadow-xl border-primary" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className="p-1 text-muted-foreground">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate">{participant.name}</p>
          <div className="flex gap-1 mt-0.5">
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter",
              participant.nationality === '외국인' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
            )}>
              {participant.nationality}
            </span>
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
              participant.gender === '여' ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-600"
            )}>
              {participant.gender}
            </span>
            <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded">
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

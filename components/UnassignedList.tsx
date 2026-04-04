'use client'

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParticipantCard } from './ParticipantCard'
import { UserPlus } from 'lucide-react'
import { Participant } from '@/types'

interface UnassignedListProps {
  participants: Participant[]
  round: number
}

export function UnassignedList({ participants, round }: UnassignedListProps) {
  const { setNodeRef } = useSortable({
    id: `unassigned-${round}`,
    data: {
      type: 'container',
      tableLabel: 'unassigned',
      round: round
    }
  })

  return (
    <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-amber-500" />
          미배정 인원
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="max-h-[400px] overflow-y-auto p-3 min-h-[100px]">
        <SortableContext 
          items={participants.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          {participants.map(p => (
            <ParticipantCard key={p.id} participant={p} />
          ))}
        </SortableContext>
        {participants.length === 0 && (
          <p className="text-center py-4 text-xs font-bold text-muted-foreground">모두 배정되었습니다.</p>
        )}
      </CardContent>
    </Card>
  )
}

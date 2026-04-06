'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParticipantCard } from './ParticipantCard'
import { Participant } from '@/types'
import { getTableWarnings } from '@/lib/seating-algorithm'

interface TableContainerProps {
  label: string
  participants: Participant[]
  round: number
  tableLanguage?: string
}

export function TableContainer({ label, participants, round, tableLanguage }: TableContainerProps) {
  const { setNodeRef } = useDroppable({
    id: `table-${label}-${round}`,
    data: {
      type: 'container',
      tableLabel: label,
      round: round
    }
  })

  const warnings = getTableWarnings(participants)

  return (
    <Card className="border-none shadow-md bg-muted/20 rounded-[24px] overflow-hidden flex flex-col h-full">
      <CardHeader className="p-4 bg-card border-b flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-black">{label} Table</CardTitle>
            {tableLanguage && (
              <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                {tableLanguage}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground">{participants.length} 명</span>
        </div>
        
        {warnings.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {warnings.map(w => (
              <span key={w} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                {w}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent ref={setNodeRef} className="p-3 flex-1 min-h-[100px]">
        <SortableContext 
          items={participants.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-2">
            {participants.map(p => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutGrid, Save, 
  Users, Settings, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import _ from 'lodash'

import { Participant, RoundData } from '@/types'
import { arrangeRound, runAutoArrange, calculateAutoTableCounts } from '@/lib/seating-algorithm'
import { saveSession } from '@/lib/storage'
import { CSVUploader } from '@/components/CSVUploader'
import { ParticipantCard } from '@/components/ParticipantCard'
import { TableContainer } from '@/components/TableContainer'
import { UnassignedList } from '@/components/UnassignedList'
import { LatecomerAdder } from '@/components/LatecomerAdder'
import { RoundImageExporter } from '@/components/RoundImageExporter'
// 🔍 디버깅 로그 (임시 기능 - 나중에 삭제)
import { generateDebugLog, formatDebugLog } from '@/lib/debug-logger'

export default function SeatingPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rounds, setRounds] = useState<RoundData[]>([
    { round: 1, assignments: [] },
    { round: 2, assignments: [] },
    { round: 3, assignments: [] }
  ])
  const [currentRound, setCurrentRound] = useState(1)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [langTableCounts, setLangTableCounts] = useState<Record<string, number>>({})
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  // 🔍 디버깅 로그 (임시 기능 - 나중에 삭제)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [showDebugLogs, setShowDebugLogs] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDataLoaded = useCallback((loadedParticipants: Participant[]) => {
    setParticipants(loadedParticipants)
    const counts = calculateAutoTableCounts(loadedParticipants)
    setLangTableCounts(counts)
    toast.success('참가자 데이터를 불러왔습니다.')
  }, [])

  const handleArrangeRound = useCallback((roundNumber: number) => {
    if (participants.length === 0) {
      toast.error('참가자가 없습니다.')
      return
    }

    // 이전 라운드들 가져오기
    const previousRounds = rounds.filter(r => r.round < roundNumber && r.assignments.length > 0)
    
    // 해당 라운드 배치
    const newRoundData = arrangeRound(roundNumber, participants, langTableCounts, previousRounds)
    
    // 라운드 업데이트
    const updatedRounds = [...rounds]
    const idx = updatedRounds.findIndex(r => r.round === roundNumber)
    if (idx !== -1) {
      updatedRounds[idx] = newRoundData
    }
    setRounds(updatedRounds)
    
    // 🔍 디버깅 로그 생성 (임시 기능)
    const debugLog = generateDebugLog(roundNumber, newRoundData, updatedRounds, participants)
    const formattedLog = formatDebugLog(debugLog)
    console.log(formattedLog)
    setDebugLogs(prev => [...prev, formattedLog])
    
    toast.success(`${roundNumber}라운드 배치가 완료되었습니다.`)
    setCurrentRound(roundNumber)
  }, [participants, langTableCounts, rounds])

  const handleAddLatecomer = useCallback((newParticipant: Participant) => {
    setParticipants(prev => [...prev, newParticipant])
    
    // 현재 라운드에 배치
    const currentRoundData = rounds.find(r => r.round === currentRound)
    if (!currentRoundData || currentRoundData.assignments.length === 0) {
      toast.info(`${newParticipant.name}님이 추가되었습니다. 현재 라운드를 먼저 배치해주세요.`)
      return
    }
    
    // 같은 언어 그룹의 테이블 찾기
    const languageTables = currentRoundData.assignments.filter(a => {
      const p = participants.find(p => p.id === a.participant_id)
      return p?.language === newParticipant.language
    })
    
    if (languageTables.length === 0) {
      toast.warning(`${newParticipant.name}님이 추가되었습니다. 현재 라운드에 ${newParticipant.language} 테이블이 없어 미배정 상태입니다.`)
      return
    }
    
    // 같은 언어 테이블 중 인원이 가장 적은 테이블 찾기
    const tableGroups = _.groupBy(languageTables, 'table_label')
    let minTable = Object.keys(tableGroups)[0]
    let minCount = tableGroups[minTable].length
    
    Object.entries(tableGroups).forEach(([label, members]) => {
      if (members.length < minCount) {
        minCount = members.length
        minTable = label
      }
    })
    
    // 현재 라운드에 배치
    setRounds(prev => {
      const updated = [...prev]
      const roundIdx = updated.findIndex(r => r.round === currentRound)
      if (roundIdx !== -1) {
        updated[roundIdx] = {
          ...updated[roundIdx],
          assignments: [
            ...updated[roundIdx].assignments,
            { participant_id: newParticipant.id, table_label: minTable }
          ]
        }
      }
      return updated
    })
    
    toast.success(`${newParticipant.name}님이 ${currentRound}라운드 ${minTable}테이블에 배치되었습니다.`, {
      duration: 5000
    })
  }, [rounds, currentRound, participants])

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const isOverTable = over.data?.current?.type === 'container'
    
    setRounds(prev => {
      const newRounds = [...prev]
      const roundIdx = newRounds.findIndex(r => r.round === currentRound)
      const currentAssignments = [...(newRounds[roundIdx].assignments || [])]
      
      const activeIdx = currentAssignments.findIndex(a => a.participant_id === activeId)
      
      if (isOverTable && over.data.current) {
        const newTableLabel = over.data.current.tableLabel
        
        if (newTableLabel === 'unassigned') {
          if (activeIdx !== -1) {
            currentAssignments.splice(activeIdx, 1)
          }
        } else {
          if (activeIdx !== -1) {
            currentAssignments[activeIdx] = { ...currentAssignments[activeIdx], table_label: newTableLabel }
          } else {
            currentAssignments.push({ participant_id: activeId, table_label: newTableLabel })
          }
        }
      } else {
        const overParticipantIdx = currentAssignments.findIndex(a => a.participant_id === overId)
        
        if (overParticipantIdx !== -1) {
          const newTableLabel = currentAssignments[overParticipantIdx].table_label
          if (activeIdx !== -1) {
            currentAssignments[activeIdx] = { ...currentAssignments[activeIdx], table_label: newTableLabel }
          } else {
            currentAssignments.push({ participant_id: activeId, table_label: newTableLabel })
          }
        } else {
          const isOverUnassigned = participants.find(p => p.id === overId && !currentAssignments.some(a => a.participant_id === p.id))
          if (isOverUnassigned && activeIdx !== -1) {
            currentAssignments.splice(activeIdx, 1)
          }
        }
      }

      newRounds[roundIdx] = { ...newRounds[roundIdx], assignments: currentAssignments }
      return newRounds
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
  }

  const currentRoundAssignments = rounds.find(r => r.round === currentRound)?.assignments || []
  const tableLabels = Array.from(new Set(currentRoundAssignments.map(a => a.table_label))).sort()
  const activeParticipant = participants.find(p => p.id === activeId)
  const unassignedParticipants = participants.filter(p => !currentRoundAssignments.some(a => a.participant_id === p.id))

  const languageGroups = useMemo(() => _.groupBy(participants, 'language'), [participants])

  if (participants.length === 0) {
    return (
      <div className="p-4 md:p-8 bg-muted/30 min-h-screen">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">자리배치 프로그램</h1>
          </div>
          <p className="text-muted-foreground font-medium">언어교환 자리배치 자동화 도구</p>
        </header>

        <div className="max-w-2xl mx-auto">
          <CSVUploader onDataLoaded={handleDataLoaded} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-muted/30 min-h-screen space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">자리배치 프로그램</h1>
          </div>
          <p className="text-muted-foreground font-medium">{participants.length}명의 참가자</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={cn("rounded-xl font-bold gap-2", isConfigOpen && "bg-muted")}
            >
              <Settings className="w-4 h-4" />
              테이블 설정
            </Button>
            <Button 
              onClick={() => handleArrangeRound(1)} 
              className="rounded-xl font-black gap-2"
              variant={rounds[0].assignments.length > 0 ? "outline" : "default"}
              disabled={rounds[0].assignments.length > 0}
            >
              {rounds[0].assignments.length > 0 ? "1라운드 완료" : "1라운드 배치"}
            </Button>
            <Button 
              onClick={() => handleArrangeRound(2)} 
              className="rounded-xl font-black gap-2"
              variant={rounds[1].assignments.length > 0 ? "outline" : "default"}
              disabled={rounds[0].assignments.length === 0 || rounds[1].assignments.length > 0}
            >
              {rounds[1].assignments.length > 0 ? "2라운드 완료" : "2라운드 배치"}
            </Button>
            <Button 
              onClick={() => handleArrangeRound(3)} 
              className="rounded-xl font-black gap-2"
              variant={rounds[2].assignments.length > 0 ? "outline" : "default"}
              disabled={rounds[1].assignments.length === 0 || rounds[2].assignments.length > 0}
            >
              {rounds[2].assignments.length > 0 ? "3라운드 완료" : "3라운드 배치"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoundImageExporter 
              key={currentRound}
              round={currentRound}
              roundData={rounds.find(r => r.round === currentRound)!}
              participants={participants}
            />
            {/* 🔍 디버깅 로그 토글 (임시 기능 - 나중에 삭제) */}
            {debugLogs.length > 0 && (
              <Button
                onClick={() => setShowDebugLogs(!showDebugLogs)}
                variant={showDebugLogs ? "default" : "outline"}
                className="rounded-xl font-bold gap-2"
              >
                🔍 디버깅 로그 {showDebugLogs ? '숨기기' : '보기'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 🔍 디버깅 로그 표시 영역 (임시 기능 - 나중에 삭제) */}
      {showDebugLogs && debugLogs.length > 0 && (
        <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              🔍 디버깅 로그 (중복 만남 분석)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugLogs.map((log, idx) => (
                <pre key={idx} className="bg-muted p-4 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre">
                  {log}
                </pre>
              ))}
              <Button
                onClick={() => {
                  const allLogs = debugLogs.join('\n\n')
                  navigator.clipboard.writeText(allLogs)
                  toast.success('디버깅 로그를 클립보드에 복사했습니다.')
                }}
                variant="outline"
                className="w-full rounded-xl font-bold"
              >
                📋 전체 로그 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isConfigOpen && (
        <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-card animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              언어별 테이블 수 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(languageGroups).sort().map(([lang, members]) => (
                <div key={lang} className="space-y-2 p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{lang}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{members.length}명</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="1"
                      value={langTableCounts[lang] || Math.ceil(members.length / 5)} 
                      onChange={(e) => setLangTableCounts(prev => ({ 
                        ...prev, 
                        [lang]: parseInt(e.target.value) || 1 
                      }))}
                      className="h-9 rounded-xl text-center font-black text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">테이블</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <aside className="space-y-6">
            <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  참가자 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">전체</p>
                    <p className="text-xl font-black">{participants.length}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">배정됨</p>
                    <p className="text-xl font-black text-emerald-600">{currentRoundAssignments.length}</p>
                  </div>
                </div>
                
                <div className="h-px bg-muted" />
                
                <div className="space-y-2">
                  <p className="text-xs font-black text-muted-foreground uppercase">언어별 참가자</p>
                  {Object.entries(languageGroups).map(([lang, members]) => (
                    <div key={lang} className="flex justify-between items-center text-sm font-bold">
                      <span>{lang}</span>
                      <span className="text-primary">{members.length}명</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <LatecomerAdder onAddParticipant={handleAddLatecomer} />

            <UnassignedList 
              participants={unassignedParticipants} 
              round={currentRound}
            />
          </aside>

          <main className="space-y-6">
            <Tabs value={currentRound.toString()} onValueChange={(v) => setCurrentRound(parseInt(v))} className="w-full">
              <div className="mb-6">
                <TabsList className="bg-muted p-1 rounded-2xl h-14">
                  {[1, 2, 3].map(r => (
                    <TabsTrigger 
                      key={r} 
                      value={r.toString()}
                      className="rounded-xl px-8 h-full data-[state=active]:bg-card data-[state=active]:shadow-md font-black text-lg"
                    >
                      {r} Round
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {[1, 2, 3].map(r => (
                <TabsContent key={r} value={r.toString()} className="mt-0 focus-visible:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tableLabels.map(label => {
                      const tableParticipants = currentRoundAssignments
                        .filter(a => a.table_label === label)
                        .map(a => participants.find(p => p.id === a.participant_id))
                        .filter(Boolean) as Participant[]
                      
                      return (
                        <TableContainer 
                          key={label} 
                          label={label} 
                          participants={tableParticipants}
                          round={r}
                        />
                      )
                    })}
                    {tableLabels.length === 0 && (
                      <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-[40px] bg-card/50">
                        <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-xl font-black text-muted-foreground">배치 결과가 없습니다.</p>
                        <p className="text-muted-foreground font-medium mt-2">라운드 배치 버튼을 눌러주세요.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </main>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeParticipant ? (
            <ParticipantCard participant={activeParticipant} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

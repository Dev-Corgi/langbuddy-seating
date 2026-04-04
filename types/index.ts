export type Participant = {
  id: string
  name: string
  gender: '남' | '여' | string
  nationality: '한국인' | '외국인' | string
  language: string
}

export type Assignment = {
  participant_id: string
  table_label: string
}

export type RoundData = {
  round: number
  assignments: Assignment[]
}

export type SeatingConfig = {
  langTableCounts: Record<string, number>
}

export type SeatingSession = {
  participants: Participant[]
  rounds: RoundData[]
  config: SeatingConfig
  createdAt: string
  name?: string
}

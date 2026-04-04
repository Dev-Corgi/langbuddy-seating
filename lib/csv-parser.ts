import Papa from 'papaparse'
import { Participant } from '@/types'

export interface CSVRow {
  이름?: string
  name?: string
  성별?: string
  gender?: string
  국적?: string
  nationality?: string
  언어?: string
  language?: string
}

export function parseCSV(file: File): Promise<Participant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(processRawData(results.data))
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export function parseCSVString(csvString: string): Participant[] {
  const results = Papa.parse(csvString, {
    header: false,
    skipEmptyLines: true,
  })
  
  // 배열 형태의 데이터를 객체로 변환
  return results.data.map((row: any, index: number) => {
    const name = (row[0] || `참가자${index + 1}`).trim()
    let gender = (row[1] || '?').trim()
    let nationality = (row[2] || '?').trim()
    let language = (row[3] || '-').trim()

    // 성별 정규화: 남자/남 → 남, 여자/여 → 여
    if (gender === '남자') gender = '남'
    if (gender === '여자') gender = '여'
    
    // 국적 정규화: Foreigner, 日本人 → 외국인
    if (nationality.toLowerCase() === 'foreigner') nationality = '외국인'
    if (nationality === '日本人') nationality = '외국인'
    
    // 언어 정규화: English → 영어, 日本語 → 일본어
    if (language.toLowerCase() === 'english') language = '영어'
    if (language === '日本語') language = '일본어'

    return {
      id: `${Date.now()}-${index}`,
      name,
      gender,
      nationality,
      language,
    }
  })
}

function processRawData(data: CSVRow[]): Participant[] {
  return data.map((row, index) => {
    const name = (row.이름 || row.name || `참가자${index + 1}`).trim()
    let gender = (row.성별 || row.gender || '?').trim()
    let nationality = (row.국적 || row.nationality || '?').trim()
    let language = (row.언어 || row.language || '-').trim()

    // 성별 정규화: 남자/남 → 남, 여자/여 → 여
    if (gender === '남자') gender = '남'
    if (gender === '여자') gender = '여'
    
    // 국적 정규화: Foreigner, 日本人 → 외국인
    if (nationality.toLowerCase() === 'foreigner') nationality = '외국인'
    if (nationality === '日本人') nationality = '외국인'
    
    // 언어 정규화: English → 영어, 日本語 → 일본어
    if (language.toLowerCase() === 'english') language = '영어'
    if (language === '日本語') language = '일본어'

    return {
      id: `${Date.now()}-${index}`,
      name,
      gender,
      nationality,
      language,
    }
  })
}

export function validateParticipants(participants: Participant[]): string[] {
  const errors: string[] = []

  participants.forEach((p, index) => {
    const lineNum = index + 1
    
    // 이름 검증
    if (!p.name || p.name === '?' || p.name.trim() === '') {
      errors.push(`${lineNum}번째 줄: 이름이 없습니다.`)
    }
    
    // 성별 검증 (남/여만 허용)
    if (!['남', '여'].includes(p.gender)) {
      errors.push(`${lineNum}번째 줄 (${p.name}): 성별이 올바르지 않습니다. "남자" 또는 "여자"로 입력하세요.`)
    }
    
    // 국적 검증 (한국인/외국인만 허용)
    if (!['한국인', '외국인'].includes(p.nationality)) {
      errors.push(`${lineNum}번째 줄 (${p.name}): 국적이 올바르지 않습니다. "한국인" 또는 "Foreigner"로 입력하세요.`)
    }
    
    // 언어 검증
    if (!p.language || p.language === '-' || p.language.trim() === '') {
      errors.push(`${lineNum}번째 줄 (${p.name}): 언어가 없습니다.`)
    }
    
    // 공백 문자 경고
    if (p.name.includes('  ')) {
      errors.push(`${lineNum}번째 줄 (${p.name}): 이름에 불필요한 공백이 있습니다.`)
    }
  })

  return errors
}

export function generateSampleCSV(): string {
  // 단일 HTML 파일에서는 전역 변수 사용
  if (typeof window !== 'undefined' && (window as any).__SAMPLE_CSV_DATA__) {
    return (window as any).__SAMPLE_CSV_DATA__;
  }
  
  // 새로운 형식: 헤더 없음, 남자/여자, 日本人/Foreigner/한국인, English/日本語/영어/일본어
  return `재현,남자,한국인,English
김정우,남자,한국인,영어
김희원,여자,한국인,English
민종호,남자,한국인,영어
박보원,여자,한국인,English
성예지,여자,한국인,영어
성지완,남자,한국인,English
안준형,남자,한국인,영어
양철승,남자,한국인,English
오태윤,남자,한국인,영어
윤보경,남자,한국인,English
이민희,남자,한국인,영어
이성훈,남자,한국인,English
이준석,남자,한국인,영어
정서연,여자,한국인,English
정현지,여자,한국인,영어
최가은,여자,한국인,English
추정민,남자,한국인,영어
한세라,여자,한국인,English
허재아,여자,한국인,영어
AJ,남자,Foreigner,English
Annique,여자,Foreigner,영어
Jacky,남자,Foreigner,English
Kim Yana,여자,Foreigner,영어
minuka,여자,Foreigner,English
Victor,남자,Foreigner,영어
김태윤,남자,한국인,English
권효정,여자,한국인,영어
김태현,남자,한국인,English
한서은,여자,한국인,영어
Broedy,남자,Foreigner,English
Arthur,남자,Foreigner,영어
Ella,여자,Foreigner,English
Evie,여자,Foreigner,영어
Finn,남자,Foreigner,English
Hannah Morin-Ferguson,여자,Foreigner,영어
Ileana,여자,Foreigner,English
Jenny walshaw,여자,Foreigner,영어
Johan,남자,Foreigner,English
Kieran,남자,Foreigner,영어
Kimberly Williams,여자,Foreigner,English
Kubra,여자,Foreigner,영어
lena,여자,Foreigner,English
Pas,남자,Foreigner,영어
paula,여자,Foreigner,English
sarah,여자,Foreigner,영어
Tanner,남자,Foreigner,English
Tim,남자,Foreigner,영어
Valerie Ong-Tua,여자,Foreigner,English
김소희,여,한국인,日本語
田中美咲,여,日本人,일본어
박준혁,남,한국인,日本語
鈴木大輔,남,日本人,일본어
이채원,여,한국인,日本語
高橋さくら,여,日本人,일본어
정민재,남,한국인,日本語
渡辺翔太,남,日本人,일본어
최유나,여,한국인,日本語
伊藤結衣,여,日本人,일본어
강태윤,남,한국인,日本語
山本陽菜,여,日本人,일본어
윤서아,여,한국인,日本語
中村颯人,남,日本人,일본어
박현우,남,한국인,日本語
小林凛,여,日本人,일본어
이다은,여,한국인,日本語
加藤蓮,남,日本人,일본어
김태현,남,한국인,日本語
James Taylor,남,Foreigner,English
정수빈,여,한국인,영어
William Thomas,남,Foreigner,English
한예은,여,한국인,영어
Benjamin White,남,Foreigner,English
강민서,여,한국인,영어
Lucas Harris,남,Foreigner,English
윤지안,남,한국인,영어
Ava Martin,여,Foreigner,English
박도현,남,한국인,영어
Harper Thompson,여,Foreigner,English
이서윤,여,한국인,영어
Ethan Moore,남,Foreigner,English
최하준,남,한국인,영어
Ella Jackson,여,Foreigner,English
정아윤,여,한국인,영어
Alexander Lee,남,Foreigner,English
한지훈,남,한국인,영어
Lily Walker,여,Foreigner,English
강서진,여,한국인,영어
松田悠斗,남,日本人,日本語
김민지,여,한국인,일본어
井上葵,여,日本人,日本語
박성현,남,한국인,일본어
森本蒼空,남,日本人,日本語
이지유,여,한국인,일본어
木村心春,여,日本人,日本語
정재윤,남,한국인,일본어
林陽翔,남,日本人,日本語
최서현,여,한국인,일본어
清水美月,여,日本人,日本語
강민규,남,한국인,일본어
山田莉子,여,日本人,日本語
윤하린,여,한국인,일본어
吉田湊,남,日本人,日本語
박지환,남,한국인,일본어
斎藤花,여,日本人,日本語
이수아,여,한국인,일본어
岡田悠真,남,日本人,日本語
송하은,여,한국인,일본어
佐藤健太,남,日本人,日本語`
}

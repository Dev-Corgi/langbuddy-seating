# 설치 및 실행 가이드

## 🚀 빠른 시작

### 1단계: 패키지 설치
```bash
cd seating
npm install
```

### 2단계: 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어주세요.

---

## 📦 프로젝트 구조

```
seating/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 기본 컴포넌트
│   ├── CSVUploader.tsx   # CSV 업로드
│   ├── ParticipantCard.tsx
│   ├── TableContainer.tsx
│   ├── UnassignedList.tsx
│   └── ResultExporter.tsx
├── lib/                   # 유틸리티 함수
│   ├── utils.ts
│   ├── csv-parser.ts     # CSV 파싱
│   ├── seating-algorithm.ts  # 배치 알고리즘
│   └── storage.ts        # 로컬 저장소
├── types/                 # TypeScript 타입
│   └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 💡 사용 방법

### CSV 파일 준비
샘플 CSV를 다운로드하거나 다음 형식으로 작성:

```csv
이름,성별,국적,언어
김철수,남,한국인,영어
John Smith,남,외국인,영어
이영희,여,한국인,일본어
Yuki Tanaka,여,외국인,일본어
```

**필수 컬럼:**
- 이름 (name)
- 성별 (gender): 남/여
- 국적 (nationality): 한국인/외국인  
- 언어 (language): 영어, 일본어, 중국어 등

### 배치 프로세스

1. **CSV 업로드**
   - 드래그 앤 드롭 또는 파일 선택
   - 자동 검증 및 미리보기

2. **테이블 설정**
   - 언어별 테이블 수 자동 계산
   - 수동 조정 가능

3. **자동 배치**
   - "자동 배치 실행" 클릭
   - 3라운드 배치 자동 생성

4. **수동 조정**
   - 드래그 앤 드롭으로 참가자 이동
   - 실시간 제약조건 경고

5. **결과 저장**
   - 텍스트 복사
   - CSV 다운로드
   - 로컬 저장소에 세션 저장

---

## 🎯 주요 기능

### 자동 배치 알고리즘
- 언어별 그룹 분리
- 한국인/외국인 균등 분배
- 3라운드 중복 최소화
- 50회 시도 후 최적해 선택

### 제약조건 체크
각 테이블에 다음 조건 확인:
- ✅ 한국인 포함 여부
- ✅ 외국인 포함 여부
- ✅ 남성 포함 여부
- ✅ 여성 포함 여부

### 드래그 앤 드롭
- 테이블 간 참가자 이동
- 미배정 목록으로 이동
- 실시간 업데이트

---

## 🛠️ 개발 명령어

```bash
# 개발 서버 (Hot Reload)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 린트 체크
npm run lint
```

---

## 📤 배포

### 정적 사이트로 내보내기
```bash
npm run build
```

`out/` 폴더의 파일을 웹 서버에 업로드하면 됩니다.

### Vercel/Netlify 배포
1. GitHub에 푸시
2. Vercel/Netlify에 연결
3. 자동 배포

---

## 🔧 문제 해결

### 패키지 설치 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

### 포트 충돌
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### TypeScript 오류
```bash
# 타입 체크
npx tsc --noEmit
```

---

## 📝 라이선스

MIT License - 자유롭게 사용 가능

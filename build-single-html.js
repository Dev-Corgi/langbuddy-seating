const fs = require('fs');
const path = require('path');

console.log('🔨 단일 HTML 파일 생성 시작\n');

const outDir = path.join(__dirname, 'out');
const indexPath = path.join(outDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ out/index.html이 없습니다. npm run build를 먼저 실행하세요.');
  process.exit(1);
}

// ── 유틸리티 ──

const MIME = {
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon',
};

function toDataURI(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return `data:${MIME[ext] || 'application/octet-stream'};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

// ── HTML을 청크 단위로 재조립 ──
// .replace()의 $& 등 특수 치환 패턴 문제를 완전히 회피하기 위해
// 문자열을 직접 잘라 붙이는 방식으로 처리

let html = fs.readFileSync(indexPath, 'utf-8');

// ── 1단계: CSS 인라인 ──

for (const m of [...html.matchAll(/<link[^>]*href="([^"]*\.css)"[^>]*>/g)]) {
  const tag = m[0];
  const href = m[1];
  const cssPath = path.join(outDir, href);
  let css;
  try { css = fs.readFileSync(cssPath, 'utf-8'); } catch { continue; }

  // CSS url() → data URI
  css = css.replace(/url\(([^)]+)\)/g, (orig, raw) => {
    const url = raw.replace(/['"]/g, '').trim();
    if (url.startsWith('data:')) return orig;
    const p = url.startsWith('/') ? path.join(outDir, url) : path.join(path.dirname(cssPath), url);
    const uri = toDataURI(p);
    if (uri) { console.log(`  📦 리소스: ${url}`); return `url(${uri})`; }
    return orig;
  });

  // tag를 <style>로 교체 — indexOf로 위치를 찾아 직접 splice
  const idx = html.indexOf(tag);
  if (idx !== -1) {
    html = html.substring(0, idx) + `<style>${css}</style>` + html.substring(idx + tag.length);
    console.log(`✅ CSS: ${href}`);
  }
}

// ── 2단계: 외부 JS 인라인 ──
// 핵심 1: </ → <\/ 로 변환 (HTML 파서가 닫는 태그로 오인하지 않도록)
// 핵심 2: .replace() 대신 substring으로 직접 교체 ($& 등 특수 패턴 문제 회피)

for (const m of [...html.matchAll(/<script[^>]+src="([^"]*\.js)"[^>]*><\/script>/g)]) {
  const tag = m[0];
  const src = m[1];
  const jsPath = path.join(outDir, src);
  let code;
  try { code = fs.readFileSync(jsPath, 'utf-8'); } catch { continue; }

  // 모든 </ → <\/ (HTML 파서가 닫는 태그로 인식 방지, JS에서는 동일하게 해석)
  code = code.replace(/<\//g, '<\\/');

  const idx = html.indexOf(tag);
  if (idx !== -1) {
    html = html.substring(0, idx) + '<script>' + code + '</script>' + html.substring(idx + tag.length);
    console.log(`✅ JS: ${src}`);
  }
}

// ── 3단계: 샘플 CSV 전역 변수 삽입 ──

const sampleCSV = `재현,남자,한국인,English
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
佐藤健太,남,日本人,日本語`;

const idx = html.indexOf('</head>');
if (idx !== -1) {
  const tag = `<script>window.__SAMPLE_CSV_DATA__=${JSON.stringify(sampleCSV)};<\/script>`;
  html = html.substring(0, idx) + tag + html.substring(idx);
}

// ── 저장 ──

const outputPath = path.join(__dirname, 'seating-standalone.html');
fs.writeFileSync(outputPath, html, 'utf-8');

const sizeMB = (fs.statSync(outputPath).size / 1048576).toFixed(2);
console.log(`\n✅ 완료! ${outputPath}`);
console.log(`📦 크기: ${sizeMB} MB`);

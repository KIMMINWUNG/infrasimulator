/**
 * =================================================================
 * 오프라인 배포 패키지 생성 스크립트
 * =================================================================
 * 역할: 배포에 필요한 파일들만 모아서 패키지 폴더를 생성합니다.
 * 사용법: node create-offline-package.js
 * =================================================================
 */

const fs = require('fs');
const path = require('path');

// 회사 내부망 폴더 입력 시 사용할 폴더명
const OUTPUT_DIR = '정부합동평가_시뮬레이터';

// 복사할 파일/폴더 목록
const FILES_TO_COPY = [
  'dist',
  'server.cjs',
  '시뮬레이터_실행.bat',
  'package.json',
  'README.md',
  '오프라인_배포_가이드.md'
];

console.log('\n============================================');
console.log('📦 오프라인 배포 패키지 생성 중...');
console.log('============================================\n');

// 출력 폴더 생성
if (fs.existsSync(OUTPUT_DIR)) {
  console.log('⚠️  기존 패키지 폴더 삭제 중...');
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}

fs.mkdirSync(OUTPUT_DIR);
console.log(`✅ 출력 폴더 생성: ${OUTPUT_DIR}/\n`);

// 파일/폴더 복사 함수
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 파일 복사
FILES_TO_COPY.forEach(item => {
  const srcPath = path.join(__dirname, item);
  const destPath = path.join(__dirname, OUTPUT_DIR, item);
  
  if (fs.existsSync(srcPath)) {
    console.log(`📄 복사 중: ${item}`);
    copyRecursive(srcPath, destPath);
  } else {
    console.log(`⚠️  건너뛰기 (파일 없음): ${item}`);
  }
});

// 안내 파일 생성 (회사 내부망 폴더용)
const readmeContent = `
정부합동평가 시뮬레이터 (오프라인 버전)
=====================================

■ 빠른 시작
  1. 이 폴더 전체를 내부망 사용 위치에 복사하세요.
  2. '시뮬레이터_실행.bat' 파일을 더블클릭하세요.
  3. 브라우저에서 표시된 주소로 접속하세요.

■ 자세한 사용법
  '오프라인_배포_가이드.md' 파일을 참고하세요.
  (개별/관리자 모드, 상세 DB 다운로드, 관리주체 수정 방법 등)

■ 주의사항
  - Node.js가 설치되어 있어야 합니다.
  - 인터넷 연결 없이 동작합니다.
  - 이 폴더를 USB 등으로 복사해 다른 PC에서 사용할 수 있습니다.

제작: 국토안전관리원 기반시설관리실 | 김민웅
버전: 2.0.0 (오프라인)
`.trim();

fs.writeFileSync(
  path.join(__dirname, OUTPUT_DIR, 'README_배포용.txt'),
  readmeContent,
  'utf-8'
);

console.log('\n============================================');
console.log('✅ 배포 패키지 생성 완료!');
console.log('============================================');
console.log(`📁 위치: ${OUTPUT_DIR}/`);
console.log('\n📦 포함된 파일:');
FILES_TO_COPY.forEach(item => {
  if (fs.existsSync(path.join(__dirname, item))) {
    console.log(`   ✓ ${item}`);
  }
});
console.log('   ✓ README_배포용.txt (자동 생성)');
console.log('\n💡 다음 단계:');
console.log(`   1. '${OUTPUT_DIR}' 폴더를 USB에 복사`);
console.log('   2. 사용자 PC에서 폴더 복사 후 실행');
console.log('\n============================================\n');


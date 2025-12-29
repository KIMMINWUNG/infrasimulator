#!/usr/bin/env node

/**
 * =================================================================
 * 지자체 합동평가 시뮬레이터 - 오프라인 로컬 서버
 * =================================================================
 * 역할: dist 폴더의 빌드된 앱을 로컬에서 서빙합니다.
 * 사용법: node server.js 또는 더블클릭으로 실행
 * =================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv'
};

// 서버 생성
const server = http.createServer((req, res) => {
  // URL 디코딩 (한글 경로 지원)
  let filePath = decodeURIComponent(req.url);
  
  // 루트 경로는 index.html로
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // 절대 경로로 변환
  const absolutePath = path.join(DIST_DIR, filePath);

  // 파일 읽기
  fs.readFile(absolutePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 에러
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>', 'utf-8');
      } else {
        // 서버 에러
        res.writeHead(500);
        res.end(`서버 오류: ${err.code}`, 'utf-8');
      }
    } else {
      // 파일 확장자로 MIME 타입 결정
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log('\n============================================');
  console.log('🚀 지자체 합동평가 시뮬레이터 실행 중...');
  console.log('============================================');
  console.log(`📡 서버 주소: http://localhost:${PORT}`);
  console.log(`📁 서빙 폴더: ${DIST_DIR}`);
  console.log('============================================');
  console.log('✅ 브라우저가 자동으로 열립니다...');
  console.log('⚠️  종료하려면 Ctrl+C 를 누르세요');
  console.log('============================================\n');

  // 브라우저 자동 실행 (Windows)
  const url = `http://localhost:${PORT}`;
  
  // Windows에서 기본 브라우저 열기
  exec(`start ${url}`, (err) => {
    if (err) {
      console.error('브라우저를 자동으로 열 수 없습니다.');
      console.log(`수동으로 브라우저를 열고 다음 주소로 이동하세요: ${url}`);
    }
  });
});

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n\n서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다. 👋\n');
    process.exit(0);
  });
});


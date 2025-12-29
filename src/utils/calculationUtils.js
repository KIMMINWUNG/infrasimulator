// =================================================================
// FILE: src/utils/calculationUtils.js
// 역할: 모든 점수 계산 로직을 담당하는 유틸리티 파일 (대용량 파일 처리 성능 개선)
// =================================================================
import { readExcelToJson, readRawExcel } from './excelUtils';
import { HEADER_PLAN, HEADER_DB, HEADER_ORDINANCE, GRADE_EXCLUDE, PRIVATE_OWNERS } from '../constants';
import * as XLSX from 'xlsx';

// 브라우저가 멈추지 않도록 잠시 쉴 틈을 주는 함수
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

// 배열 데이터를 작은 덩어리(청크)로 나누어 처리하여 브라우저 멈춤 현상을 방지하는 함수
const processInChunks = async (array, processFn, chunkSize = 1000, setLoadingMessage, message) => {
    let results = [];
    if (setLoadingMessage && message) {
        setLoadingMessage(`${message} (0/${array.length})`);
        await yieldToMain();
    }

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        const processedChunk = chunk.filter(processFn);
        results = results.concat(processedChunk);
        
        if (setLoadingMessage && message) {
            setLoadingMessage(`${message} (${i + chunk.length}/${array.length})`);
        }
        await yieldToMain(); // 여기서 브라우저가 다른 일을 할 수 있도록 제어권을 넘김
    }
    return results;
};

// --- 각 지표별 계산 로직 (모두 비동기 함수로 변경) ---

const calculatePlan = async (sheet, gov, excludePrivate, setLoadingMessage) => {
    const filteredByGov = await processInChunks(sheet, r => r["관리계획 수립기관"]?.trim() === gov, 2000, setLoadingMessage, '지자체 필터링 중...');
    
    const finalData = excludePrivate 
        ? await processInChunks(filteredByGov, r => !PRIVATE_OWNERS.includes(r["작성기관"]?.trim()), 2000, setLoadingMessage, '민자사업자 제외 중...')
        : filteredByGov;
    
    const done = await processInChunks(finalData, r => {
        const dateValue = r["결재이력"];
        if (typeof dateValue === 'number') {
            const date = XLSX.SSF.parse_date_code(dateValue);
            return new Date(date.y, date.m - 1, date.d) <= new Date("2025-02-28T23:59:59");
        }
        const date = new Date(dateValue);
        return !isNaN(date) && date <= new Date("2025-02-28T23:59:59");
    }, 2000, setLoadingMessage, '제출 기한 확인 중...');
    
    const missed = finalData.filter(r => !done.includes(r));
    const score = finalData.length > 0 ? (done.length / finalData.length) * 10 : 0;

    return {
        score: score,
        details: { "제출 대상(분모)": finalData.length, "제출 완료(분자)": done.length },
        downloadableData: { "실행계획_미제출": missed }
    };
};

const calculateMaintain = async (noticeWB, dbSheet, gov, excludePrivate, setLoadingMessage) => {
    if (setLoadingMessage) setLoadingMessage('고시문 분석 중...');
    await yieldToMain();

    const sheet = noticeWB.Sheets[gov];
    if (!sheet) throw new Error(`고시문 파일에 "${gov}" 시트가 없습니다.`);

    let dbBody = dbSheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    if (excludePrivate) {
        dbBody = dbBody.filter(r => !PRIVATE_OWNERS.includes(r["관리주체"]?.trim()));
    }

    const groupKeys = new Set(), gradeKeys = new Set();
    const groupCols = ["C", "D", "E", "F", "G"], gradeCols = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];

    for (let i = 2; i < 500; i++) {
        const infra = sheet[`A${i}`]?.v?.trim(), fac = sheet[`B${i}`]?.v?.trim();
        if (!infra || !fac) continue;
        
        const processCols = (cols, keySet) => {
            for (const col of cols) {
                if (sheet[`${col}${i}`]?.v === "O") {
                    keySet.add(`${infra}||${fac}||${sheet[`${col}1`]?.v?.trim()}`);
                }
            }
        };
        processCols(groupCols, groupKeys);
        processCols(gradeCols, gradeKeys);
    }

    const included = await processInChunks(dbBody, r => groupKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["시설물종별"]}`), 1000, setLoadingMessage, '관리그룹 필터링 중...');
    const excluded = dbBody.filter(r => !included.includes(r));
    const validGrades = await processInChunks(included, r => !GRADE_EXCLUDE.includes(r["등급"]?.trim()), 1000, setLoadingMessage, '등급 유효성 검사 중...');
    const passed = await processInChunks(validGrades, r => gradeKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["등급"]}`), 1000, setLoadingMessage, '목표등급 만족여부 확인 중...');
    const failed = validGrades.filter(r => !passed.includes(r));

    const score = validGrades.length > 0 ? (passed.length / validGrades.length) * 20 : 0;

    return {
        score: score,
        details: { "관리그룹 대상": included.length, "등급 확인(분모)": validGrades.length, "목표등급 만족(분자)": passed.length },
        downloadableData: { "관리그룹_포함": included, "관리그룹_제외": excluded, "목표등급_만족": passed, "목표등급_불만족": failed }
    };
};

const calculateOrdinance = async (sheet, gov, setLoadingMessage) => {
    const filtered = await processInChunks(sheet, r => r["관리계획 수립기관"]?.trim() === gov, 2000, setLoadingMessage, '지자체 필터링 중...');
    const done = await processInChunks(filtered, r => r["충당금 조례 제정 여부"]?.toString().trim() === "O", 2000, setLoadingMessage, '조례 제정 여부 확인 중...');
    
    const score = filtered.length > 0 ? (done.length / filtered.length) * 20 : 0;
    
    return {
        score: score,
        details: { "대상 건수(분모)": filtered.length, "조례 제정(분자)": done.length },
        downloadableData: {}
    };
};

export const calculateScores = async (type, files, gov, excludePrivate, setLoadingMessage) => {
    // 각 단계 시작 전에 로딩 메시지를 설정하고, 브라우저가 메시지를 렌더링할 시간을 줍니다.
    switch (type) {
        case 'plan': {
            if (setLoadingMessage) setLoadingMessage('실행계획 파일 읽는 중...');
            await yieldToMain();
            const sheet = await readExcelToJson(files.planFile, HEADER_PLAN);
            return await calculatePlan(sheet, gov, excludePrivate, setLoadingMessage);
        }
        case 'maintain': {
            if (setLoadingMessage) setLoadingMessage('고시문 파일 읽는 중...');
            await yieldToMain();
            const noticeWB = await readRawExcel(files.noticeFile);

            if (setLoadingMessage) setLoadingMessage('실적DB 파일 읽는 중...');
            await yieldToMain();
            const dbSheet = await readExcelToJson(files.dbFile, HEADER_DB);
            
            return await calculateMaintain(noticeWB, dbSheet, gov, excludePrivate, setLoadingMessage);
        }
        case 'ordinance': {
            if (setLoadingMessage) setLoadingMessage('조례 파일 읽는 중...');
            await yieldToMain();
            const sheet = await readExcelToJson(files.ordinanceFile, HEADER_ORDINANCE);
            return await calculateOrdinance(sheet, gov, setLoadingMessage);
        }
        default:
            throw new Error("알 수 없는 계산 유형입니다.");
    }
};

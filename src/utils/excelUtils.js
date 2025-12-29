// =================================================================
// FILE: src/utils/excelUtils.js
// 역할: 엑셀 파일 읽기/쓰기 관련 유틸리티 함수 (다중 시트 내보내기 기능 수정)
// =================================================================
import * as XLSX from 'xlsx';

const validateHeader = (actual, expected) => {
    if (!actual || actual.length < expected.length) return false;
    return expected.every((v, i) => v === (actual[i] || "").trim());
};

export const readExcelToJson = (file, headerType) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            
            if (!validateHeader(data[0], headerType)) {
                console.error("Expected Header:", headerType);
                console.error("Actual Header:", data[0]);
                return reject(new Error(`잘못된 엑셀 헤더 형식입니다. (${sheetName})`));
            }
            
            const rows = data.slice(1).map(row =>
                Object.fromEntries(data[0].map((key, i) => [key, row[i]]))
            );
            resolve(rows);
        } catch (err) {
            reject(err);
        }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsArrayBuffer(file);
});

export const readRawExcel = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            resolve(XLSX.read(new Uint8Array(e.target.result), { type: "array" }));
        } catch (error) {
            reject(error);
        }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsArrayBuffer(file);
});

export const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
        alert("내보낼 데이터가 없습니다.");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "결과");
    XLSX.writeFile(wb, filename);
};

export const exportMultiSheetExcel = (dataByGov, filename) => {
    const wb = XLSX.utils.book_new();
    let sheetAdded = false;

    Object.keys(dataByGov).forEach(gov => {
        const data = dataByGov[gov];
        if (data && data.length > 0) {
            sheetAdded = true;
            const ws = XLSX.utils.json_to_sheet(data);
            const sheetName = gov.substring(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
    });

    if (sheetAdded) {
        XLSX.writeFile(wb, filename);
        return true; // 성공 여부 반환
    }
    
    return false; // 성공 여부 반환
};
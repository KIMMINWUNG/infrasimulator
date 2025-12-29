// =================================================================
// FILE: public/calculation.worker.js
// 역할: 모든 무거운 계산을 백그라운드에서 전담 (고시문 파일 읽기 로직 개선)
// =================================================================
// 오프라인 버전: 로컬 xlsx 라이브러리 사용
self.importScripts('/xlsx.full.min.js');

// --- 유틸리티 함수들 (워커 내에서 사용) ---
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

const validateHeader = (actual, expected) => {
    if (!actual || actual.length < expected.length) return false;
    return expected.every((v, i) => v === (actual[i] || "").trim());
};

const readExcelToJson = (file, headerType) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const wb = self.XLSX.read(new Uint8Array(e.target.result), { type: "array" });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const data = self.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            
            if (!validateHeader(data[0], headerType)) {
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

const readRawExcel = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            resolve(self.XLSX.read(new Uint8Array(e.target.result), { type: "array" }));
        } catch (error) {
            reject(error);
        }
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsArrayBuffer(file);
});

// --- 계산 로직 (워커 내에서 실행) ---

// 관리감독기관별 관리주체 목록을 반환하는 함수
const getManagementEntitiesForGov = (gov) => {
    const managementList = {
        "강원특별자치도": [
            "강원특별자치도",
            "강원특별자치도 춘천시",
            "강원특별자치도 원주시",
            "강원특별자치도 강릉시",
            "강원특별자치도 동해시",
            "강원특별자치도 태백시",
            "강원특별자치도 속초시",
            "강원특별자치도 삼척시",
            "강원특별자치도 홍천군",
            "강원특별자치도 횡성군",
            "강원특별자치도 영월군",
            "강원특별자치도 평창군",
            "강원특별자치도 정선군",
            "강원특별자치도 철원군",
            "강원특별자치도 화천군",
            "강원특별자치도 양구군",
            "강원특별자치도 인제군",
            "강원특별자치도 고성군",
            "강원특별자치도 양양군"
        ],
        "경기도": [
            "경기도",
            "경기도시주택공사",
            "경기도 수원시",
            "경기도 성남시",
            "경기도 의정부시",
            "경기도 안양시",
            "경기도 부천시",
            "경기도 광명시",
            "경기도 평택시",
            "경기도 동두천시",
            "경기도 안산시",
            "경기도 고양시",
            "경기도 과천시",
            "경기도 구리시",
            "경기도 남양주시",
            "경기도 오산시",
            "경기도 시흥시",
            "경기도 군포시",
            "경기도 의왕시",
            "경기도 하남시",
            "경기도 용인시",
            "경기도 파주시",
            "경기도 이천시",
            "경기도 안성시",
            "경기도 김포시",
            "경기도 화성시",
            "경기도 광주시",
            "경기도 양주시",
            "경기도 포천시",
            "경기도 여주시",
            "경기도 연천군",
            "경기도 가평군",
            "경기도 양평군",
            "인천교통공사",
            "서울교통공사"
        ],
        "경상남도": [
            "경상남도",
            "경상남도 창원시",
            "경상남도 진주시",
            "경상남도 통영시",
            "경상남도 사천시",
            "경상남도 김해시",
            "경상남도 밀양시",
            "경상남도 거제시",
            "경상남도 양산시",
            "경상남도 의령군",
            "경상남도 함안군",
            "경상남도 창녕군",
            "경상남도 고성군",
            "경상남도 남해군",
            "경상남도 하동군",
            "경상남도 산청군",
            "경상남도 함양군",
            "경상남도 거창군",
            "경상남도 합천군"
        ],
        "경상북도": [
            "경상북도",
            "경상북도 포항시",
            "경상북도 경주시",
            "경상북도 김천시",
            "경상북도 안동시",
            "경상북도 구미시",
            "경상북도 영주시",
            "경상북도 영천시",
            "경상북도 상주시",
            "경상북도 문경시",
            "경상북도 경산시",
            "경상북도 의성군",
            "경상북도 청송군",
            "경상북도 영양군",
            "경상북도 영덕군",
            "경상북도 청도군",
            "경상북도 고령군",
            "경상북도 성주군",
            "경상북도 칠곡군",
            "경상북도 예천군",
            "경상북도 봉화군",
            "경상북도 울진군",
            "경상북도 울릉군"
        ],
        "광주광역시": [
            "광주광역시",
            "광주광역시 동구",
            "광주광역시 서구",
            "광주광역시 남구",
            "광주광역시 북구",
            "광주광역시 광산구",
            "광주교통공사",
            "상수도사업본부"
        ],
        "대구광역시": [
            "대구광역시",
            "대구공공시설관리공단",
            "대구광역시 중구",
            "대구광역시 동구",
            "대구광역시 서구",
            "대구광역시 남구",
            "대구광역시 북구",
            "대구광역시 수성구",
            "대구광역시 달서구",
            "대구광역시 달성군",
            "대구광역시 군위군",
            "대구교통공사",
            "상수도사업본부"
        ],
        "대전광역시": [
            "대전광역시",
            "대전광역시 동구",
            "대전광역시 중구",
            "대전광역시 서구",
            "대전광역시 유성구",
            "대전광역시 대덕구",
            "대전교통공사",
            "상수도사업본부"
        ],
        "부산광역시": [
            "부산광역시",
            "부산시설공단",
            "백양터널(유)",
            "부산광역시 중구",
            "부산광역시 서구",
            "부산광역시 동구",
            "부산광역시 영도구",
            "부산광역시 부산진구",
            "부산광역시 동래구",
            "부산광역시 남구",
            "부산광역시 북구",
            "부산광역시 해운대구",
            "부산광역시 사하구",
            "부산광역시 금정구",
            "부산광역시 강서구",
            "부산광역시 연제구",
            "부산광역시 수영구",
            "부산광역시 사상구",
            "부산광역시 기장군",
            "부산교통공사",
            "상수도사업본부"
        ],
        "서울특별시": [
            "서울특별시",
            "서울시설공단",
            "서울주택도시공사",
            "서울특별시 종로구",
            "서울특별시 중구",
            "서울특별시 용산구",
            "서울특별시 성동구",
            "서울특별시 광진구",
            "서울특별시 동대문구",
            "서울특별시 중랑구",
            "서울특별시 성북구",
            "서울특별시 강북구",
            "서울특별시 도봉구",
            "서울특별시 노원구",
            "서울특별시 은평구",
            "서울특별시 서대문구",
            "서울특별시 마포구",
            "서울특별시 양천구",
            "서울특별시 강서구",
            "서울특별시 구로구",
            "서울특별시 금천구",
            "서울특별시 영등포구",
            "서울특별시 동작구",
            "서울특별시 관악구",
            "서울특별시 서초구",
            "서울특별시 강남구",
            "서울특별시 송파구",
            "서울특별시 강동구",
            "서울교통공사",
            "서울아리수본부"
        ],
        "세종특별자치시": [
            "세종특별자치시",
            "상하수도사업소"
        ],
        "울산광역시": [
            "울산광역시",
            "울산광역시 중구",
            "울산광역시 남구",
            "울산광역시 동구",
            "울산광역시 북구",
            "울산광역시 울주군",
            "상수도사업본부"
        ],
        "인천광역시": [
            "인천광역시",
            "인천경제자유구역청",
            "인천광역시 중구",
            "인천광역시 동구",
            "인천광역시 미추홀구",
            "인천광역시 연수구",
            "인천광역시 남동구",
            "인천광역시 부평구",
            "인천광역시 계양구",
            "인천광역시 서구",
            "인천광역시 강화군",
            "인천광역시 옹진군",
            "인천교통공사",
            "상수도사업본부",
            "인천환경공단"
        ],
        "전라남도": [
            "전라남도",
            "전라남도 목포시",
            "전라남도 여수시",
            "전라남도 순천시",
            "전라남도 나주시",
            "전라남도 광양시",
            "전라남도 담양군",
            "전라남도 곡성군",
            "전라남도 구례군",
            "전라남도 고흥군",
            "전라남도 보성군",
            "전라남도 화순군",
            "전라남도 장흥군",
            "전라남도 강진군",
            "전라남도 해남군",
            "전라남도 영암군",
            "전라남도 무안군",
            "전라남도 함평군",
            "전라남도 영광군",
            "전라남도 장성군",
            "전라남도 완도군",
            "전라남도 진도군",
            "전라남도 신안군"
        ],
        "전북특별자치도": [
            "전북특별자치도",
            "전북특별자치도 전주시",
            "전북특별자치도 군산시",
            "전북특별자치도 익산시",
            "전북특별자치도 정읍시",
            "전북특별자치도 남원시",
            "전북특별자치도 김제시",
            "전북특별자치도 완주군",
            "전북특별자치도 진안군",
            "전북특별자치도 무주군",
            "전북특별자치도 장수군",
            "전북특별자치도 임실군",
            "전북특별자치도 순창군",
            "전북특별자치도 고창군",
            "전북특별자치도 부안군"
        ],
        "제주특별자치도": [
            "제주특별자치도",
            "제주특별자치도 제주시",
            "제주특별자치도 서귀포시"
        ],
        "충청남도": [
            "충청남도",
            "충청남도 천안시",
            "충청남도 공주시",
            "충청남도 보령시",
            "충청남도 아산시",
            "충청남도 서산시",
            "충청남도 논산시",
            "충청남도 계룡시",
            "충청남도 당진시",
            "충청남도 금산군",
            "충청남도 부여군",
            "충청남도 서천군",
            "충청남도 청양군",
            "충청남도 홍성군",
            "충청남도 예산군",
            "충청남도 태안군"
        ],
        "충청북도": [
            "충청북도",
            "충청북도 청주시",
            "충청북도 충주시",
            "충청북도 제천시",
            "충청북도 보은군",
            "충청북도 옥천군",
            "충청북도 영동군",
            "충청북도 증평군",
            "충청북도 진천군",
            "충청북도 괴산군",
            "충청북도 음성군",
            "충청북도 단양군"
        ]
    };
    
    return managementList[gov] || [];
};

const calculatePlan = (sheet, gov, managementEntity, excludePrivate, constants) => {
    let filtered;
    
    // 시군구 확장 모드: 관리주체가 선택된 경우
    if (managementEntity && managementEntity !== "전체") {
        // 관리감독기관(B열)과 관리주체(C열) 모두 매칭
        filtered = sheet.filter(r => 
            r["관리계획 수립기관"]?.trim() === gov && 
            r["작성기관"]?.trim() === managementEntity
        );
    } else {
        // 기존 로직: 관리감독기관만 매칭
        filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    }
    
    const finalData = excludePrivate ? filtered.filter(r => !constants.PRIVATE_OWNERS.includes(r["작성기관"]?.trim())) : filtered;
    
    const done = finalData.filter(r => {
        const dateValue = r["결재이력"];
        if (typeof dateValue === 'number') {
            const date = self.XLSX.SSF.parse_date_code(dateValue);
            return new Date(date.y, date.m - 1, date.d) <= new Date("2025-02-28T23:59:59");
        }
        const date = new Date(dateValue);
        return !isNaN(date) && date <= new Date("2025-02-28T23:59:59");
    });
    
    const missed = finalData.filter(r => !done.includes(r));
    const score = finalData.length > 0 ? (done.length / finalData.length) * 10 : 0;

    return {
        score,
        details: { "제출 대상(분모)": finalData.length, "제출 완료(분자)": done.length },
        downloadableData: { "실행계획_미제출": missed }
    };
};

const calculateMaintain = (noticeWB, dbSheet, gov, managementEntity, excludePrivate, constants) => {
    const sheet = noticeWB.Sheets[gov];
    if (!sheet) throw new Error(`고시문 파일에 "${gov}" 시트가 없습니다.`);

    let dbBody;
    
    // 시군구 확장 모드: 관리주체가 선택된 경우
    if (managementEntity && managementEntity !== "전체") {
        // 관리감독기관(H열)과 관리주체(I열) 모두 매칭
        dbBody = dbSheet.filter(r => 
            r["관리계획 수립기관"]?.trim() === gov && 
            r["관리주체"]?.trim() === managementEntity
        );
    } else {
        // 기존 로직: 관리감독기관만 매칭
        dbBody = dbSheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    }
    
    if (excludePrivate) {
        dbBody = dbBody.filter(r => !constants.PRIVATE_OWNERS.includes(r["관리주체"]?.trim()));
    }

    const groupKeys = new Set(), gradeKeys = new Set();
    const groupCols = ["C", "D", "E", "F", "G"], gradeCols = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];

    // --- ✨ 수정된 부분 시작 ---
    // 엑셀 시트의 실제 데이터 범위를 동적으로 파악합니다.
    const range = self.XLSX.utils.decode_range(sheet['!ref']);
    const endRow = range.e.r; // 데이터가 있는 마지막 행 번호를 가져옵니다.

    // 고정된 500행 대신, 실제 데이터가 있는 마지막 행까지만 반복합니다.
    for (let i = 2; i <= endRow + 1; i++) { 
        const infraCell = sheet[`A${i}`];
        const facCell = sheet[`B${i}`];

        // 셀이나 셀의 값(v)이 없는 경우를 안전하게 처리합니다.
        const infra = infraCell?.v ? String(infraCell.v).trim() : null;
        const fac = facCell?.v ? String(facCell.v).trim() : null;
        
        if (!infra || !fac) continue;
        
        const processCols = (cols, keySet) => {
            for (const col of cols) {
                const cell = sheet[`${col}${i}`];
                const headerCell = sheet[`${col}1`];
                if (cell?.v === "O" && headerCell?.v) {
                    keySet.add(`${infra}||${fac}||${String(headerCell.v).trim()}`);
                }
            }
        };
        processCols(groupCols, groupKeys);
        processCols(gradeCols, gradeKeys);
    }
    // --- ✨ 수정된 부분 끝 ---

    const included = dbBody.filter(r => groupKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["시설물종별"]}`));
    const excluded = dbBody.filter(r => !included.includes(r));
    const validGrades = included.filter(r => !constants.GRADE_EXCLUDE.includes(r["등급"]?.trim()));
    const passed = validGrades.filter(r => gradeKeys.has(`${r["기반시설구분"]}||${r["시설물종류"]}||${r["등급"]}`));
    const failed = validGrades.filter(r => !passed.includes(r));

    const score = validGrades.length > 0 ? (passed.length / validGrades.length) * 20 : 0;

    return {
        score,
        details: { "관리그룹 대상": included.length, "등급 확인(분모)": validGrades.length, "목표등급 만족(분자)": passed.length },
        downloadableData: { "관리그룹_포함": included, "관리그룹_제외": excluded, "목표등급_만족": passed, "목표등급_불만족": failed }
    };
};

const calculateOrdinance = (sheet, gov) => {
    const filtered = sheet.filter(r => r["관리계획 수립기관"]?.trim() === gov);
    const done = filtered.filter(r => r["충당금 조례 제정 여부"]?.toString().trim() === "O");
    const score = filtered.length > 0 ? (done.length / filtered.length) * 20 : 0;
    
    return {
        score,
        details: { "대상 건수(분모)": filtered.length, "조례 제정(분자)": done.length },
        downloadableData: {}
    };
};

// --- 메인 이벤트 리스너 ---
self.onmessage = async (e) => {
    const { task, files, gov, managementEntity, excludePrivate, isAdminSigunguMode, selectedAgencyFilter, constants } = e.data;
    
    if (task === 'single') {
        try {
            self.postMessage({ type: 'progress', message: '실행계획 파일 읽는 중...' });
            const planSheet = await readExcelToJson(files.planFile, constants.HEADER_PLAN);
            const planResult = calculatePlan(planSheet, gov, managementEntity, excludePrivate, constants);
            self.postMessage({ type: 'progress', message: '실행계획 평가 완료.' });
            await yieldToMain();

            self.postMessage({ type: 'progress', message: '고시문 파일 읽는 중...' });
            const noticeWB = await readRawExcel(files.noticeFile);
            self.postMessage({ type: 'progress', message: '실적DB 파일 읽는 중... (시간 소요)' });
            const dbSheet = await readExcelToJson(files.dbFile, constants.HEADER_DB);
            const maintainResult = calculateMaintain(noticeWB, dbSheet, gov, managementEntity, excludePrivate, constants);
            self.postMessage({ type: 'progress', message: '유지관리기준 평가 완료.' });
            await yieldToMain();
            
            self.postMessage({ type: 'progress', message: '조례 파일 읽는 중...' });
            const ordinanceSheet = await readExcelToJson(files.ordinanceFile, constants.HEADER_ORDINANCE);
            const ordinanceResult = calculateOrdinance(ordinanceSheet, gov);
            self.postMessage({ type: 'progress', message: '조례 제정 평가 완료.' });

            self.postMessage({ 
                type: 'done', 
                results: { plan: planResult, maintain: maintainResult, ordinance: ordinanceResult }
            });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
    
    if (task === 'bulk') {
        try {
            self.postMessage({ type: 'bulk_progress', message: '일괄 계산용 파일 읽는 중...' });
            const planSheet = await readExcelToJson(files.planFile, constants.HEADER_PLAN);
            const noticeWB = await readRawExcel(files.noticeFile);
            const dbSheet = await readExcelToJson(files.dbFile, constants.HEADER_DB);
            const ordinanceSheet = await readExcelToJson(files.ordinanceFile, constants.HEADER_ORDINANCE);
            
            const allDetailedData = {
                '실행계획_미제출': {}, '관리그룹_포함': {}, '관리그룹_제외': {},
                '목표등급_만족': {}, '목표등급_불만족': {}
            };

            // 관리감독기관 필터와 시군구 토글에 따른 계산 대상 결정
            let calculationTargets = [];
            
            // 관리감독기관 필터 적용
            let targetAgencies = [];
            if (selectedAgencyFilter) {
                // 특정 관리감독기관만 선택된 경우
                targetAgencies = [selectedAgencyFilter];
                self.postMessage({ type: 'bulk_progress', message: `${selectedAgencyFilter} 필터링 모드로 진행 중...` });
            } else {
                // 전체 관리감독기관 선택된 경우
                targetAgencies = constants.LOCAL_GOV_LIST;
                self.postMessage({ type: 'bulk_progress', message: '전체 관리감독기관 계산 모드로 진행 중...' });
            }
            
            if (isAdminSigunguMode) {
                // 시군구 토글이 켜진 경우: 관리주체 리스트에 있는 모든 항목 계산
                self.postMessage({ type: 'bulk_progress', message: '관리주체별 상세 계산 모드로 진행 중...' });
                
                // 필터링된 관리감독기관에 대해 관리주체 리스트 생성
                for (const gov of targetAgencies) {
                    const managementEntities = getManagementEntitiesForGov(gov);
                    
                    for (const entity of managementEntities) {
                        if (entity === "전체") continue; // "전체"는 제외
                        calculationTargets.push({
                            gov: gov,
                            managementEntity: entity,
                            displayName: `${gov} - ${entity}`
                        });
                    }
                }
            } else {
                // 시군구 토글이 꺼진 경우: 관리감독기관만 계산
                self.postMessage({ type: 'bulk_progress', message: '관리감독기관 전체 계산 모드로 진행 중...' });
                
                for (const gov of targetAgencies) {
                    calculationTargets.push({
                        gov: gov,
                        managementEntity: null,
                        displayName: gov
                    });
                }
            }

            for (let i = 0; i < calculationTargets.length; i++) {
                const target = calculationTargets[i];
                self.postMessage({ type: 'bulk_progress', message: `[${i+1}/${calculationTargets.length}] ${target.displayName} 계산 중...` });
                await yieldToMain();

                try {
                    const planResult = calculatePlan(planSheet, target.gov, target.managementEntity, (excludePrivate ?? true), constants);
                    const maintainResult = calculateMaintain(noticeWB, dbSheet, target.gov, target.managementEntity, (excludePrivate ?? true), constants);
                    const ordinanceResult = calculateOrdinance(ordinanceSheet, target.gov);
                    
                    const newResult = {
                        지자체: target.displayName,
                        실행계획: planResult.score.toFixed(2),
                        유지관리기준: maintainResult.score.toFixed(2),
                        조례제정: ordinanceResult.score.toFixed(2),
                        총점: (planResult.score + maintainResult.score + ordinanceResult.score).toFixed(2)
                    };
                    self.postMessage({ type: 'bulk_result_partial', result: newResult });

                    // 상세 데이터 수집
                    allDetailedData['실행계획_미제출'][target.displayName] = planResult.downloadableData['실행계획_미제출'];
                    allDetailedData['관리그룹_포함'][target.displayName] = maintainResult.downloadableData['관리그룹_포함'];
                    allDetailedData['관리그룹_제외'][target.displayName] = maintainResult.downloadableData['관리그룹_제외'];
                    allDetailedData['목표등급_만족'][target.displayName] = maintainResult.downloadableData['목표등급_만족'];
                    allDetailedData['목표등급_불만족'][target.displayName] = maintainResult.downloadableData['목표등급_불만족'];

                } catch (govError) {
                     console.warn(`[${target.displayName}] 점수 계산 실패: ${govError.message}`);
                }
            }
            self.postMessage({ type: 'bulk_done', detailedData: allDetailedData });

        } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
        }
    }
};

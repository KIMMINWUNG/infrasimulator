// =================================================================
// FILE: src/hooks/useSimulator.js
// 역할: 시뮬레이터의 모든 상태와 로직을 관리 (일괄 다운로드 로직 수정)
// =================================================================
import { useState, useEffect, useRef } from 'react';
import { exportToExcel, exportMultiSheetExcel } from '../utils/excelUtils';
import * as constants from '../constants';

const initialScores = {
    plan: { score: 0, details: {} },
    maintain: { score: 0, details: {} },
    ordinance: { score: 0, details: {} },
};

const initialFiles = {
    planFile: null,
    noticeFile: null,
    dbFile: null,
    ordinanceFile: null,
};

export default function useSimulator() {
    const [selectedGov, setSelectedGov] = useState('');
    const [excludePrivate, setExcludePrivate] = useState(true);
    const [files, setFiles] = useState(initialFiles);
    const [scores, setScores] = useState(initialScores);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [notification, setNotification] = useState(null);
    const [downloadableData, setDownloadableData] = useState({});
    const [lastRunDurationMs, setLastRunDurationMs] = useState(null);
    const [lastBulkDurationMs, setLastBulkDurationMs] = useState(null);
    
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [bulkLoadingMessage, setBulkLoadingMessage] = useState('');
    const [bulkResults, setBulkResults] = useState([]);
    const [bulkDownloadableData, setBulkDownloadableData] = useState(null);
    const [isAdminSigunguMode, setIsAdminSigunguMode] = useState(false);
    const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('');
    /** 실행계획 제출 기한 연도: 2025(25년 실적) | 2026(26년 실적) */
    const [planDeadlineYear, setPlanDeadlineYear] = useState(2026);
    /** 단일 실행 시 계산할 평가 항목 선택 상태 */
    const [enabledMetrics, setEnabledMetrics] = useState({
        plan: true,
        maintain: true,
        ordinance: true
    });
    
    const workerRef = useRef(null);
    const singleStartTimeRef = useRef(null);
    const bulkStartTimeRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker('/calculation.worker.js');

        workerRef.current.onmessage = (e) => {
            const { type, message, results, result, detailedData } = e.data;
            switch (type) {
                case 'progress':
                    setLoadingMessage(message);
                    break;
                case 'done':
                    setScores(results);
                    setDownloadableData({ ...results.plan.downloadableData, ...results.maintain.downloadableData });
                    showNotification('점수 계산이 완료되었습니다!', 'success');
                    setIsLoading(false);
                    setLoadingMessage('');
                    if (singleStartTimeRef.current != null && typeof performance !== 'undefined') {
                        const elapsed = performance.now() - singleStartTimeRef.current;
                        setLastRunDurationMs(elapsed);
                        singleStartTimeRef.current = null;
                    }
                    break;
                case 'bulk_progress':
                    setBulkLoadingMessage(message);
                    break;
                case 'bulk_result_partial':
                    setBulkResults(prev => [...prev, result]);
                    break;
                case 'bulk_done':
                    setBulkLoadingMessage('일괄 계산 완료!');
                    setBulkDownloadableData(detailedData);
                    setIsBulkLoading(false);
                    if (bulkStartTimeRef.current != null && typeof performance !== 'undefined') {
                        const elapsedBulk = performance.now() - bulkStartTimeRef.current;
                        setLastBulkDurationMs(elapsedBulk);
                        bulkStartTimeRef.current = null;
                    }
                    break;
                case 'error':
                    showNotification(`계산 중 오류 발생: ${message}`, 'error');
                    setIsLoading(false);
                    setLoadingMessage('');
                    setIsBulkLoading(false);
                    setBulkLoadingMessage('');
                    if (singleStartTimeRef.current != null && typeof performance !== 'undefined') {
                        const elapsedErr = performance.now() - singleStartTimeRef.current;
                        setLastRunDurationMs(elapsedErr);
                        singleStartTimeRef.current = null;
                    }
                    if (bulkStartTimeRef.current != null && typeof performance !== 'undefined') {
                        const elapsedBulkErr = performance.now() - bulkStartTimeRef.current;
                        setLastBulkDurationMs(elapsedBulkErr);
                        bulkStartTimeRef.current = null;
                    }
                    break;
                default:
                    break;
            }
        };

        return () => {
            workerRef.current.terminate();
        };
    }, []);

    const setFile = (type, file) => {
        setFiles(prev => ({ ...prev, [type]: file }));
    };
    
    const clearNotification = () => setNotification(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ id: Date.now(), message, type });
    };

    const runSingleSimulation = async () => {
        if (!selectedGov) {
            showNotification('지자체를 먼저 선택해주세요.', 'error');
            return;
        }

        // 최소 한 개 이상의 평가 항목이 선택되어야 함
        if (!enabledMetrics.plan && !enabledMetrics.maintain && !enabledMetrics.ordinance) {
            showNotification('최소 한 개 이상의 평가 항목을 선택해주세요.', 'error');
            return;
        }

        // 선택된 항목별로 필요한 파일만 검사
        if (enabledMetrics.plan && !files.planFile) {
            showNotification('실행계획 항목을 선택하셨습니다. 실행계획 확정현황 파일을 업로드해주세요.', 'error');
            return;
        }
        if (enabledMetrics.maintain && (!files.noticeFile || !files.dbFile)) {
            showNotification('최소유지관리기준 항목을 선택하셨습니다. 고시문 파일과 실적DB 파일을 모두 업로드해주세요.', 'error');
            return;
        }
        if (enabledMetrics.ordinance && !files.ordinanceFile) {
            showNotification('충당금 조례 제정 항목을 선택하셨습니다. 충당금 조례 제정 파일을 업로드해주세요.', 'error');
            return;
        }

        if (typeof performance !== 'undefined') {
            singleStartTimeRef.current = performance.now();
        } else {
            singleStartTimeRef.current = null;
        }
        setLastRunDurationMs(null);
        setIsLoading(true);
        setScores(initialScores);
        setLoadingMessage('계산을 준비 중입니다...');
        
        // selectedGov 파싱: "관리감독기관 - 관리주체" 형식 또는 "관리감독기관" 형식
        let gov, managementEntity;
        if (selectedGov.includes(' - ')) {
            [gov, managementEntity] = selectedGov.split(' - ');
        } else {
            gov = selectedGov;
            managementEntity = null; // "전체" 선택 시
        }

        const workerConstants = {
            PRIVATE_OWNERS: constants.PRIVATE_OWNERS,
            LOCAL_GOV_LIST: constants.LOCAL_GOV_LIST,
            HEADER_PLAN: constants.HEADER_PLAN,
            HEADER_DB: constants.HEADER_DB,
            HEADER_ORDINANCE: constants.HEADER_ORDINANCE,
            GRADE_EXCLUDE: constants.GRADE_EXCLUDE,
            PLAN_DEADLINE: constants.PLAN_DEADLINE,
        };

        workerRef.current.postMessage({
            task: 'single',
            files,
            gov,
            managementEntity,
            excludePrivate,
            planDeadlineYear,
            enabledMetrics,
            constants: workerConstants
        });
    };
    
    const runBulkSimulation = async (adminFiles) => {
        // 최소 한 개 이상의 평가 항목이 선택되어야 함
        if (!enabledMetrics.plan && !enabledMetrics.maintain && !enabledMetrics.ordinance) {
            showNotification('관리자 모드: 최소 한 개 이상의 평가 항목을 선택해주세요.', 'error');
            return;
        }

        // 선택된 항목별로 필요한 파일만 검사 (단일 모드와 동일한 규칙)
        if (enabledMetrics.plan && !adminFiles.planFile) {
            showNotification('관리자 모드: 실행계획 항목을 선택하셨습니다. 실행계획 파일을 업로드해주세요.', 'error');
            return;
        }
        if (enabledMetrics.maintain && (!adminFiles.noticeFile || !adminFiles.dbFile)) {
            showNotification('관리자 모드: 최소유지관리기준 항목을 선택하셨습니다. 고시문 파일과 실적DB 파일을 모두 업로드해주세요.', 'error');
            return;
        }
        if (enabledMetrics.ordinance && !adminFiles.ordinanceFile) {
            showNotification('관리자 모드: 충당금 조례 제정 항목을 선택하셨습니다. 조례 파일을 업로드해주세요.', 'error');
            return;
        }
        
        if (typeof performance !== 'undefined') {
            bulkStartTimeRef.current = performance.now();
        } else {
            bulkStartTimeRef.current = null;
        }
        setLastBulkDurationMs(null);
        setIsBulkLoading(true);
        setBulkResults([]);
        setBulkDownloadableData(null);
        setBulkLoadingMessage('일괄 계산을 시작합니다...');

        const workerConstants = {
            PRIVATE_OWNERS: constants.PRIVATE_OWNERS,
            LOCAL_GOV_LIST: constants.LOCAL_GOV_LIST,
            HEADER_PLAN: constants.HEADER_PLAN,
            HEADER_DB: constants.HEADER_DB,
            HEADER_ORDINANCE: constants.HEADER_ORDINANCE,
            GRADE_EXCLUDE: constants.GRADE_EXCLUDE,
            PLAN_DEADLINE: constants.PLAN_DEADLINE,
        };

        workerRef.current.postMessage({
            task: 'bulk',
            files: adminFiles,
            excludePrivate,
            isAdminSigunguMode,
            selectedAgencyFilter,
            planDeadlineYear,
            enabledMetrics,
            constants: workerConstants
        });
    };

    const downloadDetailedData = (type) => {
        if (!downloadableData[type] || downloadableData[type].length === 0) {
            showNotification('다운로드할 데이터가 없습니다. 먼저 시뮬레이션을 실행해주세요.', 'warning');
            return;
        }
        exportToExcel(downloadableData[type], `${selectedGov}_${type}.xlsx`);
    };
    
    const downloadBulkDetailedData = (category) => {
        if (!bulkDownloadableData || !bulkDownloadableData[category]) {
            showNotification('다운로드할 데이터가 없습니다. 먼저 일괄 계산을 실행해주세요.', 'warning');
            return;
        }
        const success = exportMultiSheetExcel(bulkDownloadableData[category], `${category}_전체.xlsx`);
        if (!success) {
            showNotification('선택한 항목에 대해 다운로드할 데이터가 없습니다.', 'info');
        }
    };

    return {
        state: { selectedGov, excludePrivate, planDeadlineYear, enabledMetrics, lastRunDurationMs, lastBulkDurationMs, files, scores, isLoading, loadingMessage, notification, downloadableData, isBulkLoading, bulkLoadingMessage, bulkResults, isAdminSigunguMode, selectedAgencyFilter },
        setters: { setSelectedGov, setExcludePrivate, setPlanDeadlineYear, setEnabledMetrics, setFile, setIsAdminSigunguMode, setSelectedAgencyFilter },
        actions: { runSingleSimulation, runBulkSimulation, downloadDetailedData, downloadBulkDetailedData, clearNotification, showNotification }
    };
}
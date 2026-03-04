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
    
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [bulkLoadingMessage, setBulkLoadingMessage] = useState('');
    const [bulkResults, setBulkResults] = useState([]);
    const [bulkDownloadableData, setBulkDownloadableData] = useState(null);
    const [isAdminSigunguMode, setIsAdminSigunguMode] = useState(false);
    const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('');
    
    const workerRef = useRef(null);

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
                    break;
                case 'error':
                    showNotification(`계산 중 오류 발생: ${message}`, 'error');
                    setIsLoading(false);
                    setLoadingMessage('');
                    setIsBulkLoading(false);
                    setBulkLoadingMessage('');
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
        if (!files.planFile || !files.noticeFile || !files.dbFile || !files.ordinanceFile) {
            showNotification('모든 평가 파일을 업로드해야 합니다.', 'error');
            return;
        }

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

        workerRef.current.postMessage({
            task: 'single',
            files,
            gov,
            managementEntity,
            excludePrivate,
            constants
        });
    };
    
    const runBulkSimulation = async (adminFiles) => {
        if (!adminFiles.planFile || !adminFiles.noticeFile || !adminFiles.dbFile || !adminFiles.ordinanceFile) {
            showNotification('관리자 모드는 모든 파일을 업로드해야 합니다.', 'error');
            return;
        }
        
        setIsBulkLoading(true);
        setBulkResults([]);
        setBulkDownloadableData(null);
        setBulkLoadingMessage('일괄 계산을 시작합니다...');

        workerRef.current.postMessage({
            task: 'bulk',
            files: adminFiles,
            // 관리자 모드는 원본 로직(전체) 계산 기준. excludePrivate는 UI 설정을 따르도록 전달
            excludePrivate,
            isAdminSigunguMode, // 관리자모드 시군구 토글 상태 전달
            selectedAgencyFilter, // 선택된 관리감독기관 필터 전달
            constants
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
        state: { selectedGov, excludePrivate, files, scores, isLoading, loadingMessage, notification, downloadableData, isBulkLoading, bulkLoadingMessage, bulkResults, isAdminSigunguMode, selectedAgencyFilter },
        setters: { setSelectedGov, setExcludePrivate, setFile, setIsAdminSigunguMode, setSelectedAgencyFilter },
        actions: { runSingleSimulation, runBulkSimulation, downloadDetailedData, downloadBulkDetailedData, clearNotification, showNotification }
    };
}
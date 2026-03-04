// =================================================================
// FILE: src/components/AdminPanel.jsx
// 역할: 관리자 모드용 패널 (상세 데이터 다운로드 버튼 추가)
// =================================================================
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { exportToExcel } from '../utils/excelUtils';
import { getAgencyList as getAgencyListFallback } from '../utils/csvParser';

export default function AdminPanel({
    agencyList: agencyListProp,
    onClose,
    onRunBulkSim,
    bulkResults,
    isBulkLoading,
    bulkLoadingMessage,
    onDownloadBulkData,
    isSigunguMode,
    onSigunguToggle,
    selectedAgencyFilter,
    onAgencyFilterChange,
    planDeadlineYear,
    onPlanDeadlineYearChange,
    enabledMetrics,
    onEnabledMetricsChange,
    lastBulkDurationMs
}) {
    const [adminFiles, setAdminFiles] = useState({
        planFile: null,
        noticeFile: null,
        dbFile: null,
        ordinanceFile: null,
    });

    const handleFileChange = (type, file) => {
        setAdminFiles(prev => ({ ...prev, [type]: file }));
    };

    const handleExport = () => {
        if (bulkResults.length === 0) return;
        exportToExcel(bulkResults, '전체_지자체_점수_결과.xlsx');
    };

    const handleMetricToggle = (key) => {
        if (!onEnabledMetricsChange) return;
        onEnabledMetricsChange(prev => {
            const next = { ...prev, [key]: !prev[key] };
            if (!next.plan && !next.maintain && !next.ordinance) {
                return prev;
            }
            return next;
        });
    };

    const formatDuration = (ms) => {
        if (ms == null) return '';
        const totalSeconds = Math.round(ms / 1000);
        if (totalSeconds < 1) return '1초 미만';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes === 0) return `${seconds}초`;
        return `${minutes}분 ${seconds.toString().padStart(2, '0')}초`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-white border-opacity-20" style={{ background: 'linear-gradient(90deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
                <header className="p-6 border-b border-gray-200 flex justify-between items-center text-white rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                            <i className="fas fa-user-shield text-purple-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">관리자 모드</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto">
                    {/* 관리감독기관 필터 설정 */}
                    <div className="mb-6">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-filter text-purple-600"></i>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">관리감독기관 필터</h3>
                                    <p className="text-sm text-gray-600">
                                        특정 관리감독기관만 선택하여 계산할 수 있습니다
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <select
                                        value={selectedAgencyFilter}
                                        onChange={(e) => onAgencyFilterChange(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-0 transition-all"
                                        disabled={isBulkLoading}
                                    >
                                        <option value="">전체 관리감독기관 (17개)</option>
                                        {(agencyListProp && agencyListProp.length > 0 ? agencyListProp : getAgencyListFallback()).map(agency => (
                                            <option key={agency} value={agency}>
                                                {agency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {selectedAgencyFilter ? `${selectedAgencyFilter} 선택됨` : '전체 선택됨'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 시군구 토글 설정 */}
                    <div className="mb-6">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        <i className="fas fa-map-marked-alt text-orange-600"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">시군구 확장 모드</h3>
                                        <p className="text-sm text-gray-600">
                                            {isSigunguMode ? '관리주체별 상세 점수 표시' : '관리감독기관 전체 점수 표시'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={onSigunguToggle}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            isSigunguMode ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                        disabled={isBulkLoading}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isSigunguMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {isSigunguMode ? '켜짐' : '꺼짐'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 평가 항목 / 연도 설정 */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-list-check text-blue-600"></i>
                                </div>
                                <h3 className="font-semibold text-gray-800">평가 항목 선택</h3>
                            </div>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => handleMetricToggle('plan')}
                                    className={`w-full py-2 px-3 rounded-md text-sm font-semibold border transition-colors flex items-center justify-between ${enabledMetrics?.plan ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-300 text-gray-500'}`}
                                    disabled={isBulkLoading}
                                >
                                    <span>실행계획 항목</span>
                                    <span className="text-xs">{enabledMetrics?.plan ? '사용' : '미사용'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMetricToggle('maintain')}
                                    className={`w-full py-2 px-3 rounded-md text-sm font-semibold border transition-colors flex items-center justify-between ${enabledMetrics?.maintain ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'}`}
                                    disabled={isBulkLoading}
                                >
                                    <span>최소유지관리기준 항목</span>
                                    <span className="text-xs">{enabledMetrics?.maintain ? '사용' : '미사용'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMetricToggle('ordinance')}
                                    className={`w-full py-2 px-3 rounded-md text-sm font-semibold border transition-colors flex items-center justify-between ${enabledMetrics?.ordinance ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-gray-50 border-gray-300 text-gray-500'}`}
                                    disabled={isBulkLoading}
                                >
                                    <span>충당금 조례 제정 항목</span>
                                    <span className="text-xs">{enabledMetrics?.ordinance ? '사용' : '미사용'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-calendar-day text-indigo-600"></i>
                                </div>
                                <h3 className="font-semibold text-gray-800">실적 연도 (실행계획 기한)</h3>
                            </div>
                            <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => onPlanDeadlineYearChange(2025)}
                                    className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${planDeadlineYear === 2025 ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                                    disabled={isBulkLoading}
                                >
                                    25년 실적 (2025.2.28)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onPlanDeadlineYearChange(2026)}
                                    className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${planDeadlineYear === 2026 ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                                    disabled={isBulkLoading}
                                >
                                    26년 실적 (2026.2.28)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4 md:col-span-1">
                            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <i className="fas fa-upload text-blue-600"></i>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">일괄 계산용 파일 업로드</h3>
                                </div>
                                <FileUpload id="admin-plan" label="실행계획 파일" file={adminFiles.planFile} onFileChange={(f) => handleFileChange('planFile', f)} disabled={!enabledMetrics?.plan} />
                                <FileUpload id="admin-notice" label="고시문 파일" file={adminFiles.noticeFile} onFileChange={(f) => handleFileChange('noticeFile', f)} disabled={!enabledMetrics?.maintain} />
                                <FileUpload id="admin-db" label="실적DB 파일" file={adminFiles.dbFile} onFileChange={(f) => handleFileChange('dbFile', f)} disabled={!enabledMetrics?.maintain} />
                                <FileUpload id="admin-ord" label="조례 파일" file={adminFiles.ordinanceFile} onFileChange={(f) => handleFileChange('ordinanceFile', f)} disabled={!enabledMetrics?.ordinance} />
                            </div>
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                            <i className="fas fa-chart-bar text-green-600"></i>
                                        </div>
                                        <h3 className="font-semibold text-gray-800">일괄 계산 결과</h3>
                                    </div>
                                    {isBulkLoading && <span className="text-sm text-blue-600 font-semibold">{bulkLoadingMessage}</span>}
                                </div>
                                <div className="border border-gray-200 rounded-xl flex-grow overflow-y-auto bg-white">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-700">순위</th>
                                                <th className="p-3 font-semibold text-gray-700">지자체</th>
                                                <th className="p-3 font-semibold text-gray-700">실행계획</th>
                                                <th className="p-3 font-semibold text-gray-700">유지관리</th>
                                                <th className="p-3 font-semibold text-gray-700">조례</th>
                                                <th className="p-3 font-semibold text-gray-700">총점</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...bulkResults]
                                                .sort((a, b) => parseFloat(b.총점) - parseFloat(a.총점))
                                                .map((res, i) => (
                                                <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                                    <td className="p-3 font-semibold text-gray-800">{i + 1}위</td>
                                                    <td className="p-3 font-semibold text-gray-800">{res.지자체}</td>
                                                    <td className="p-3 text-gray-600">{res.실행계획}</td>
                                                    <td className="p-3 text-gray-600">{res.유지관리기준}</td>
                                                    <td className="p-3 text-gray-600">{res.조례제정}</td>
                                                    <td className="p-3 font-bold text-blue-600">{res.총점}</td>
                                                </tr>
                                            ))}
                                            {isBulkLoading && !bulkResults.length && <tr><td colSpan="5" className="text-center p-6 text-gray-500">{bulkLoadingMessage}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white border-opacity-20">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <i className="fas fa-download text-purple-600"></i>
                                </div>
                                <h3 className="font-semibold text-gray-800">상세 DB 다운로드 (전체 지자체)</h3>
                            </div>
                            <div className="flex flex-wrap gap-3 items-start">
                                <button onClick={() => onDownloadBulkData('실행계획_미제출')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>실행계획 미제출 DB</button>
                                <div className="pt-8">
                                    <button onClick={() => onDownloadBulkData('민자사업자_제외')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#0d9488', color: '#0d9488' }}>민자사업자 제외 DB</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="pt-8">
                                        <button onClick={() => onDownloadBulkData('관리그룹_포함')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#16a34a', color: '#16a34a' }}>관리그룹 포함</button>
                                    </div>
                                    <button onClick={() => onDownloadBulkData('관리그룹_제외')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#ca8a04', color: '#ca8a04' }}>관리그룹 제외</button>
                                </div>
                                <div className="rounded-lg p-1.5 border-2 border-purple-500 bg-purple-50/80">
                                    <div className="text-xs font-bold text-purple-600 mb-1">분모</div>
                                    <button onClick={() => onDownloadBulkData('등급확인')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>등급확인</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="rounded-lg p-1.5 border-2 border-purple-500 bg-purple-50/80">
                                        <div className="text-xs font-bold text-purple-600 mb-1">분자</div>
                                        <button onClick={() => onDownloadBulkData('목표등급_만족')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all w-full" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>목표등급 만족</button>
                                    </div>
                                    <button onClick={() => onDownloadBulkData('목표등급_불만족')} disabled={isBulkLoading || !bulkResults.length} className="px-3 py-2 text-sm font-semibold rounded-lg border bg-transparent hover:opacity-80 disabled:opacity-50 transition-all" style={{ borderColor: '#dc2626', color: '#dc2626' }}>목표등급 불만족</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 border-t border-gray-200 rounded-b-2xl flex flex-col md:flex-row md:justify-end gap-4 items-center" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)', color: 'white' }}>
                    <div className="text-xs text-indigo-100 md:mr-auto">
                        {!isBulkLoading && lastBulkDurationMs != null && (
                            <span>소요시간: {formatDuration(lastBulkDurationMs)}</span>
                        )}
                    </div>
                    <button onClick={() => onRunBulkSim(adminFiles)} disabled={isBulkLoading} className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 transition-all transform hover:scale-105 shadow-lg">
                        <div className="flex items-center">
                            <i className="fas fa-play mr-2"></i>
                            {isBulkLoading ? '계산 중...' : '일괄 계산 시작'}
                        </div>
                    </button>
                    <button onClick={handleExport} disabled={bulkResults.length === 0 || isBulkLoading} className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 transition-all transform hover:scale-105 shadow-lg">
                        <div className="flex items-center">
                            <i className="fas fa-file-excel mr-2"></i>
                            결과 엑셀 다운로드
                        </div>
                    </button>
                </footer>
            </div>
        </div>
    );
}
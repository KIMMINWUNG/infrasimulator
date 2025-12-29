// =================================================================
// FILE: src/components/ControlPanel.jsx
// 역할: 각 파일 업로드 컴포넌트에 툴팁으로 보여줄 설명 텍스트를 전달합니다. (문구 수정됨)
// =================================================================
import React, { useState, useEffect } from 'react';
import { LOCAL_GOV_LIST } from '../constants';
import { getAgencyList, getManagementEntities } from '../utils/csvParser';
import FileUpload from './FileUpload';

const cardHoverEffect = "transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl";

export default function ControlPanel({
    selectedGov,
    excludePrivate,
    files,
    isLoading,
    loadingMessage,
    onGovChange,
    onExcludeChange,
    onFileChange,
    onRunSimulation
}) {
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedManagementEntity, setSelectedManagementEntity] = useState('');
    const [managementEntities, setManagementEntities] = useState([]);
    const [agencyList, setAgencyList] = useState([]);

    useEffect(() => {
        // 지자체 목록 로드
        const agencies = getAgencyList();
        setAgencyList(agencies);
    }, []);

    useEffect(() => {
        // 선택된 지자체가 변경될 때 관리주체 목록 업데이트
        if (selectedAgency) {
            const entities = getManagementEntities(selectedAgency);
            setManagementEntities(entities);
            setSelectedManagementEntity(''); // 관리주체 선택 초기화
        } else {
            setManagementEntities([]);
            setSelectedManagementEntity('');
        }
    }, [selectedAgency]);

    const handleAgencyChange = (agency) => {
        setSelectedAgency(agency);
        if (agency) {
            onGovChange(agency); // 기존 로직과 호환성을 위해
        }
    };

    const handleManagementEntityChange = (entity) => {
        setSelectedManagementEntity(entity);
        // 선택된 관리주체를 부모 컴포넌트에 전달
        if (entity && selectedAgency) {
            if (entity === "전체") {
                // "전체" 선택 시 관리감독기관만 전달
                onGovChange(selectedAgency);
            } else {
                // 특정 관리주체 선택 시 "관리감독기관 - 관리주체" 형식으로 전달
                onGovChange(`${selectedAgency} - ${entity}`);
            }
        } else if (selectedAgency) {
            onGovChange(selectedAgency);
        }
    };

    return (
        <div className="space-y-6 bg-gradient-to-b from-white via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-white border-opacity-50">
            {/* Current Selection Display */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-4 border border-white border-opacity-20">
                <div className="flex items-center mb-3">
                    <i className="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                    <h3 className="font-semibold text-gray-800">현재 선택</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">관리감독기관:</span>
                        <span className="font-semibold text-blue-600">{selectedAgency || "미선택"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">관리주체:</span>
                        <span className="font-semibold text-green-600">{selectedManagementEntity || "미선택"}</span>
                    </div>
                </div>
            </div>
            
            <div className={`bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md ${cardHoverEffect} border border-white border-opacity-20 p-6`}>
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-cog text-blue-600"></i>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">기본 설정</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="agency-select" className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <i className="fas fa-building text-blue-600 text-xs"></i>
                            </div>
                            관리감독기관 선택
                        </label>
                        <select
                            id="agency-select"
                            value={selectedAgency}
                            onChange={(e) => handleAgencyChange(e.target.value)}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-0 transition-all"
                        >
                            <option value="">-- 관리감독기관을 선택하세요 --</option>
                            {agencyList.map(agency => (
                                <option key={agency} value={agency}>
                                    {agency}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedAgency && managementEntities.length > 0 && (
                        <div>
                            <label htmlFor="management-entity-select" className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                    <i className="fas fa-users text-green-600 text-xs"></i>
                                </div>
                                관리주체 선택
                            </label>
                            <select
                                id="management-entity-select"
                                value={selectedManagementEntity}
                                onChange={(e) => handleManagementEntityChange(e.target.value)}
                                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-0 transition-all shadow-sm"
                            >
                                <option value="">-- 관리주체를 선택하세요 --</option>
                                {managementEntities.map(entity => (
                                    <option key={entity} value={entity}>
                                        {entity}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">민자사업자 제외</label>
                        <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => onExcludeChange(true)}
                                className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${excludePrivate ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                            >
                                네
                            </button>
                            <button
                                onClick={() => onExcludeChange(false)}
                                className={`w-1/2 py-1 rounded-md text-sm font-semibold transition-colors ${!excludePrivate ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md ${cardHoverEffect} border border-white border-opacity-20 p-6`}>
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-upload text-green-600"></i>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">파일 업로드</h2>
                </div>
                <div className="space-y-4">
                    <FileUpload 
                        id="planFile" 
                        label="실행계획 확정현황 파일" 
                        file={files.planFile} 
                        onFileChange={(file) => onFileChange('planFile', file)}
                        tooltipText="기반시설관리시스템 공지사항에 있는 '실행계획 확정현황' 엑셀 파일을 업로드 해주세요."
                    />
                    <FileUpload 
                        id="noticeFile" 
                        label="최소유지관리기준 고시문 파일" 
                        file={files.noticeFile} 
                        onFileChange={(file) => onFileChange('noticeFile', file)}
                        tooltipText="기반시설관리시스템 공지사항에 있는 '최소유지관리기준 고시문' 엑셀 파일을 업로드 해주세요"
                    />
                    <FileUpload 
                        id="dbFile" 
                        label="실적DB 파일" 
                        file={files.dbFile} 
                        onFileChange={(file) => onFileChange('dbFile', file)}
                        tooltipText="기반시설관리시스템 통계현황-시설관리이력에서 다운로드한 실적 엑셀 파일을 업로드해주세요."
                    />
                    <FileUpload 
                        id="ordinanceFile" 
                        label="충당금 조례 제정 파일" 
                        file={files.ordinanceFile} 
                        onFileChange={(file) => onFileChange('ordinanceFile', file)}
                        tooltipText="기반시설관리시스템 공지사항에 있는 '충당금 조례 제정' 엑셀 파일을 업로드 해주세요."
                    />
                </div>
            </div>

            <button
                onClick={onRunSimulation}
                disabled={isLoading}
                className="w-full text-white font-bold py-5 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg">{loadingMessage || '계산을 준비 중입니다...'}</span>
                    </div>
                ) : (
                    <span className="text-lg">시뮬레이션 시작</span>
                )}
            </button>
        </div>
    );
}
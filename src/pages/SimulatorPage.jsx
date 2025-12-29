// =================================================================
// FILE: src/pages/SimulatorPage.jsx
// 역할: 시뮬레이터의 메인 페이지. (AdminPanel에 prop 전달)
// =================================================================
import React, { useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import Dashboard from '../components/Dashboard';
import AdminPanel from '../components/AdminPanel';
import AdminLoginModal from '../components/AdminLoginModal';
import Notification from '../components/Notification';
import Footer from '../components/Footer';
import useSimulator from '../hooks/useSimulator';

export default function SimulatorPage() {
    const {
        state,
        setters,
        actions
    } = useSimulator();
    
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    const handleAdminLoginSuccess = () => {
        setShowAdminLogin(false);
        setIsAdminPanelOpen(true);
    };

    return (
        <div className="min-h-screen text-gray-800 flex flex-col" style={{ background: 'linear-gradient(90deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
            {/* New Header Design (left-right fade like footer) */}
            <header className="text-white py-6 shadow-lg" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">지자체 합동평가 시뮬레이터</h1>
                            <p className="text-blue-100 mt-2">시설 안전관리 수준 강화 지표 점수 자동화 시스템</p>
                        </div>
                        <button
                            onClick={() => setShowAdminLogin(true)}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                            <i className="fas fa-cog mr-2"></i>관리자 모드
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                {/* Start Hero / Intro Section */}
                <section className="mb-8">
                    <div className="rounded-2xl shadow-lg text-white p-6" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">시뮬레이터 시작 안내</h2>
                                <p className="text-white/90 mt-1">좌측에서 관리감독기관과 관리주체를 선택하고 필수 파일을 업로드한 뒤 시뮬레이션을 실행하세요.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">1. 관리감독기관 선택</span>
                                <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">2. 관리주체 선택(선택)</span>
                                <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">3. 파일 업로드</span>
                                <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">4. 시뮬레이션 시작</span>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                        <ControlPanel
                            selectedGov={state.selectedGov}
                            excludePrivate={state.excludePrivate}
                            files={state.files}
                            isLoading={state.isLoading}
                            loadingMessage={state.loadingMessage}
                            onGovChange={setters.setSelectedGov}
                            onExcludeChange={setters.setExcludePrivate}
                            onFileChange={setters.setFile}
                            onRunSimulation={actions.runSingleSimulation}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <Dashboard
                            scores={state.scores}
                            downloadableData={state.downloadableData}
                            onDownload={actions.downloadDetailedData}
                        />
                    </div>
                </main>
            </div>

            <Footer /> 

            {showAdminLogin && (
                <AdminLoginModal
                    onSuccess={handleAdminLoginSuccess}
                    onCancel={() => setShowAdminLogin(false)}
                    setNotification={actions.showNotification}
                />
            )}

            {isAdminPanelOpen && (
                <AdminPanel
                    onClose={() => setIsAdminPanelOpen(false)}
                    onRunBulkSim={actions.runBulkSimulation}
                    bulkResults={state.bulkResults}
                    isBulkLoading={state.isBulkLoading}
                    bulkLoadingMessage={state.bulkLoadingMessage}
                    onDownloadBulkData={actions.downloadBulkDetailedData}
                    isSigunguMode={state.isAdminSigunguMode}
                    onSigunguToggle={() => setters.setIsAdminSigunguMode(!state.isAdminSigunguMode)}
                    selectedAgencyFilter={state.selectedAgencyFilter}
                    onAgencyFilterChange={setters.setSelectedAgencyFilter}
                />
            )}
            
            {state.notification && (
                <Notification
                    {...state.notification}
                    onClose={actions.clearNotification}
                />
            )}
        </div>
    );
}
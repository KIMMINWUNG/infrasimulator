// =================================================================
// FILE: src/App.jsx
// 역할: 앱의 최상위 컴포넌트. 초기 인증 화면을 담당합니다.
// =================================================================
import React, { useState } from 'react';
import ciLogo from './assets/ci_logo.png';
import SimulatorPage from './pages/SimulatorPage';
import Notification from './components/Notification';

// .env.local 파일에 VITE_MASTER_KEY="your_key" 형식으로 저장하는 것을 권장합니다.
const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "k.infra";

function LoginComponent({ onSuccess, setNotification }) {
    const [inputKey, setInputKey] = useState("");

    const handleLogin = () => {
        if (inputKey === MASTER_KEY) {
            onSuccess();
        } else {
            setNotification({
                id: Date.now(),
                type: 'error',
                message: '인증 KEY가 일치하지 않습니다.'
            });
            setInputKey("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(90deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>
            {/* Header with same style as footer (left-right fade) */}
            <header className="text-white py-6 shadow-lg" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold">지자체 합동평가 시뮬레이터</h1>
                            <p className="text-blue-100 mt-2">시설 안전관리 수준 강화 지표 점수 자동화 시스템</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-lock text-indigo-600 text-2xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">인증이 필요합니다</h2>
                        <p className="text-gray-600 mt-2">시뮬레이터 접속을 위한 KEY를 입력하세요.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="KEY 입력"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:border-indigo-500 focus:ring-0 transition-all"
                        />
                        <button
                            onClick={handleLogin}
                            className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}
                        >
                            <div className="flex items-center justify-center">
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                입장하기
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer with same style as main app */}
            <footer className="text-white py-6" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #6366f1 100%)' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-4">
                        <img 
                            src={ciLogo} 
                            alt="국토안전관리원 로고" 
                            className="h-12 w-auto"
                        />
                        <div>
                            <p>
                                <strong>국토안전관리원 기반시설관리실</strong> | 담당자: 김민웅 | 연락처: 055-771-8497
                            </p>
                            <p className="mt-1">
                                주소: 경상남도 진주시 사들로 123번길 40, 7층 배종프라임 기반시설관리실
                            </p>
                        </div>
                    </div>
                    <p className="mt-2 sm:mt-0">
                        ⓒ 2025 Kim Min Wung. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}


export default function App() {
    const [authorized, setAuthorized] = useState(false);
    const [notification, setNotification] = useState(null);

    if (!authorized) {
        return (
            <>
                <LoginComponent onSuccess={() => setAuthorized(true)} setNotification={setNotification} />
                {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            </>
        );
    }

    return <SimulatorPage />;
}
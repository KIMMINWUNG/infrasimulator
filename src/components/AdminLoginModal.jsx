// =================================================================
// FILE: src/components/AdminLoginModal.jsx
// 역할: 관리자 모드 접속을 위한 비밀번호 입력 모달
// =================================================================
import React, { useState } from 'react';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_MASTER_KEY || "kalis4114@@";

export default function AdminLoginModal({ onSuccess, onCancel, setNotification }) {
    const [inputKey, setInputKey] = useState("");

    const handleLogin = () => {
        if (inputKey === ADMIN_KEY) {
            onSuccess();
        } else {
            setNotification('관리자 비밀번호가 일치하지 않습니다.', 'error');
            setInputKey("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-white border-opacity-20">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-user-shield text-purple-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">관리자 로그인</h2>
                    <p className="text-gray-600 mb-6">관리자 전용 비밀번호를 입력하세요.</p>
                    <input
                        type="password"
                        placeholder="관리자 비밀번호"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white text-gray-800 font-medium focus:border-purple-500 focus:ring-0 transition-all mb-6"
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel} 
                            className="flex-1 px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleLogin} 
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        >
                            <div className="flex items-center justify-center">
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                입장
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
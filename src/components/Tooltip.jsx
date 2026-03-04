// =================================================================
// FILE: src/components/Tooltip.jsx (개선된 디자인)
// 역할: 마우스를 올렸을 때 설명을 보여주는 툴팁 컴포넌트
// =================================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ text }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* 정보 아이콘 */}
            <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>

            {/* 툴팁 말풍선 (AnimatePresence와 motion.div로 애니메이션 적용) */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-100 text-slate-700 text-sm rounded-lg shadow-lg z-10 border border-slate-200"
                    >
                        {text}
                        {/* 말풍선 꼬리 */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-100"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
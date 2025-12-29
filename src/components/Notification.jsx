// =================================================================
// FILE: src/components/Notification.jsx
// 역할: 화면 우측 상단에 나타나는 알림 메시지
// =================================================================
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Notification({ id, message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    }[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`fixed top-5 right-5 z-50 p-4 rounded-lg text-white font-semibold shadow-lg ${bgColor}`}
            >
                {message}
            </motion.div>
        </AnimatePresence>
    );
}
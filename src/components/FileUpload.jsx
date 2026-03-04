// =================================================================
// FILE: src/components/FileUpload.jsx
// 역할: 파일 업로드 UI 컴포넌트 (툴팁 기능 추가)
// =================================================================
import React, { useRef } from 'react';
import Tooltip from './Tooltip'; // Tooltip 컴포넌트 import

export default function FileUpload({ id, label, file, onFileChange, tooltipText }) {
    const inputRef = useRef(null);

    const handleFileClick = () => {
        inputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                {/* 툴팁 텍스트가 있을 경우에만 정보 아이콘과 툴팁을 표시 */}
                {tooltipText && <Tooltip text={tooltipText} />}
            </div>
            <div
                onClick={handleFileClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-500"
            >
                <input
                    type="file"
                    id={id}
                    ref={inputRef}
                    className="hidden"
                    accept=".xlsx"
                    onChange={handleFileChange}
                />
                {file ? (
                    <span className="text-sm font-semibold text-green-600">{file.name}</span>
                ) : (
                    <span className="text-sm text-gray-500">파일을 선택하거나 여기에 드래그하세요</span>
                )}
            </div>
        </div>
    );
}
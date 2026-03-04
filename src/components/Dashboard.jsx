// =================================================================
// FILE: src/components/Dashboard.jsx
// 역할: 우측의 결과 대시보드 UI
// =================================================================
import React from 'react';

const cardHoverEffect = "transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl";

const ScoreCard = ({ title, score, maxScore, color, details, downloads = {}, onDownload, icon, borderColor }) => {
    const numericScore = Number(score) || 0;
    const numericMaxScore = Number(maxScore) || 0;
    const percentage = numericMaxScore > 0 ? (numericScore / numericMaxScore) * 100 : 0;
    
    return (
        <div className={`bg-white rounded-xl shadow-md ${cardHoverEffect} p-6 border-l-6`} style={{ borderLeftColor: borderColor }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: color + '20' }}>
                        <i className={`${icon} text-lg`} style={{ color: color }}></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    </div>
                </div>
                {/* 상태 뱃지 제거 */}
            </div>
            
            <div className="grid grid-cols-2 gap-6 items-center">
                <div>
                    <div className="text-4xl font-bold mb-1" style={{ color: color }}>{numericScore.toFixed(2)}</div>
                    <div className="text-lg text-gray-500 mb-4">/ {numericMaxScore}점 만점</div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div className="h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%`, background: `linear-gradient(to right, ${color}, ${color}dd)` }}></div>
                    </div>
                    {/* 버튼은 카드 하단 전체영역에 렌더링하므로 여기선 표시하지 않음 */}
                    
                    <div className="space-y-2">
                        {Object.entries(details).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">{key}:</span>
                                <span className="font-bold text-lg">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: color + '20' }}>
                        <span className="text-2xl font-bold" style={{ color: color }}>{percentage.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* 카드 하단 전체영역: 시뮬레이터 실행 후에만 버튼 표시 */}
            {(() => {
                const downloadKeys = Object.keys(downloads || {}).filter((k) => !!downloads[k]);
                if (downloadKeys.length === 0) return null;
                return (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                            {downloadKeys.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => onDownload(key)}
                                    className="px-3 py-1.5 rounded-md text-sm font-semibold border bg-transparent hover:opacity-80 transition-colors"
                                    style={{ borderColor: color, color: color }}
                                >
                                    {key.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

const InfoBanner = () => (
    <div className="bg-white border-l-4 border-blue-400 text-blue-800 p-6 rounded-r-lg shadow-lg" role="alert">
        <div className="flex">
            <div className="py-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-info-circle text-blue-600"></i>
                </div>
            </div>
            <div>
                <p className="font-bold text-lg">안내사항</p>
                <p className="text-sm mt-1">업로드된 파일은 서버에 저장되지 않으며, 모든 데이터 처리는 사용자의 브라우저 내에서만 안전하게 이루어집니다.</p>
            </div>
        </div>
    </div>
);

export default function Dashboard({ scores, downloadableData, onDownload }) {
    const totalScore = (Number(scores.plan.score) + Number(scores.maintain.score) + Number(scores.ordinance.score)).toFixed(2);
    
    const colors = {
        plan: '#3b82f6',
        maintain: '#22c55e',
        ordinance: '#a855f7'
    };

    const planDownloads = {
        '실행계획_미제출': downloadableData['실행계획_미제출'],
        ...(downloadableData['실행계획_전체대상'] ? { '실행계획_전체대상': downloadableData['실행계획_전체대상'] } : {}),
        ...(downloadableData['실행계획_제출완료'] ? { '실행계획_제출완료': downloadableData['실행계획_제출완료'] } : {})
    };

    const maintainDownloads = {
        '관리그룹_포함': downloadableData['관리그룹_포함'],
        '관리그룹_제외': downloadableData['관리그룹_제외'],
        '목표등급_만족': downloadableData['목표등급_만족'],
        '목표등급_불만족': downloadableData['목표등급_불만족']
    };

    return (
        <div className="space-y-8">
            <InfoBanner />

            <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between ${cardHoverEffect}`}>
                <div>
                    <h2 className="text-xl font-semibold">종합 점수</h2>
                    <p className="text-blue-200">모든 항목의 점수를 합산한 결과입니다.</p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                    <p className="text-5xl font-bold">{totalScore}</p>
                    <p className="text-blue-100">/ 50점 만점</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <ScoreCard 
                    title="① 기반시설 관리 실행계획 제출여부" 
                    score={scores.plan.score} 
                    maxScore={10} 
                    color={colors.plan} 
                    borderColor={colors.plan}
                    icon="fas fa-file-alt"
                    details={scores.plan.details}
                    downloads={planDownloads}
                    onDownload={onDownload}
                />
                <ScoreCard 
                    title="② 최소유지관리기준 만족여부" 
                    score={scores.maintain.score} 
                    maxScore={20} 
                    color={colors.maintain} 
                    borderColor={colors.maintain}
                    icon="fas fa-tools"
                    details={scores.maintain.details}
                    downloads={maintainDownloads}
                    onDownload={onDownload}
                />
                <ScoreCard 
                    title="③ 성능개선 충당금 조례 제정 여부" 
                    score={scores.ordinance.score} 
                    maxScore={20} 
                    color={colors.ordinance} 
                    borderColor={colors.ordinance}
                    icon="fas fa-gavel"
                    details={scores.ordinance.details}
                />
            </div>
        </div>
    );
}
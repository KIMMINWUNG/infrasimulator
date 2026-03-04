// =================================================================
// FILE: src/hooks/useManagementList.js
// 역할: 관리주체 리스트 CSV를 불러와 화면/계산에 사용 (단일 소스)
// =================================================================
import { useState, useEffect } from 'react';
import { parseManagementList } from '../utils/csvParser';

const CSV_URL = '/management_list.csv';

export default function useManagementList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [managementList, setManagementList] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch(CSV_URL)
            .then((res) => {
                if (!res.ok) throw new Error('관리주체 목록을 불러올 수 없습니다.');
                return res.text();
            })
            .then((csvText) => {
                if (cancelled) return;
                const parsed = parseManagementList(csvText);
                setManagementList(parsed);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || '목록 로드 실패');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const agencyList = managementList ? Object.keys(managementList) : [];
    const getManagementEntities = (agency) => (managementList && managementList[agency]) || [];

    return {
        loading,
        error,
        agencyList,
        getManagementEntities,
        managementList: managementList || null
    };
}

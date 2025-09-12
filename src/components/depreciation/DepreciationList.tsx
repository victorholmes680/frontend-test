import React, { useState, useEffect } from 'react';
import { EquipmentDepreciation } from '../../types/equipment';

interface DepreciationListProps {
  onEdit: (depreciation: EquipmentDepreciation) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const DepreciationList: React.FC<DepreciationListProps> = ({ onEdit, onDelete, onCreate }) => {
  const [depreciations, setDepreciations] = useState<EquipmentDepreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepreciations();
  }, []);

  const fetchDepreciations = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: EquipmentDepreciation[] = [
        {
          id: '1',
          equipmentId: 'EQ001',
          depreciationAmount: 2000,
          currentValue: 48000,
          depreciationDate: '2024-01-31',
          method: 'straight-line'
        },
        {
          id: '2',
          equipmentId: 'EQ001',
          depreciationAmount: 2000,
          currentValue: 46000,
          depreciationDate: '2024-02-28',
          method: 'straight-line'
        },
        {
          id: '3',
          equipmentId: 'EQ002',
          depreciationAmount: 1500,
          currentValue: 13500,
          depreciationDate: '2024-01-31',
          method: 'declining-balance'
        },
        {
          id: '4',
          equipmentId: 'EQ002',
          depreciationAmount: 1275,
          currentValue: 12225,
          depreciationDate: '2024-02-28',
          method: 'declining-balance'
        }
      ];
      setDepreciations(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取折旧记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'straight-line': return '直线法';
      case 'declining-balance': return '余额递减法';
      case 'units-of-production': return '工作量法';
      default: return '未知';
    }
  };

  const getMethodClass = (method: string) => {
    switch (method) {
      case 'straight-line': return 'method-straight-line';
      case 'declining-balance': return 'method-declining-balance';
      case 'units-of-production': return 'method-units-of-production';
      default: return 'method-unknown';
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-message">{error}</div>
        <button onClick={fetchDepreciations} className="retry-button">重试</button>
      </div>
    );
  }

  return (
    <div className="depreciation-page">
      <div className="page-header">
        <h1 className="page-title">折旧管理</h1>
        <button onClick={onCreate} className="btn btn-primary">
          <span className="btn-icon">+</span>
          新建折旧记录
        </button>
      </div>

      <div className="list-container">
        {depreciations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>暂无折旧记录</p>
            <button onClick={onCreate} className="btn btn-outline-primary">
              创建第一条折旧记录
            </button>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>设备ID</th>
                  <th>折旧金额</th>
                  <th>当前价值</th>
                  <th>折旧日期</th>
                  <th>折旧方法</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {depreciations.map((depreciation) => (
                  <tr key={depreciation.id}>
                    <td>{depreciation.equipmentId}</td>
                    <td className="amount">¥{depreciation.depreciationAmount.toLocaleString()}</td>
                    <td className="current-value">¥{depreciation.currentValue.toLocaleString()}</td>
                    <td>{new Date(depreciation.depreciationDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`method-badge ${getMethodClass(depreciation.method)}`}>
                        {getMethodText(depreciation.method)}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => onEdit(depreciation)}
                        className="btn btn-sm btn-outline-primary"
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(depreciation.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepreciationList;
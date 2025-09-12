import React, { useState } from 'react';
import { EquipmentDepreciation } from '../../types/equipment';
import { EquipmentService } from '../../services/api';

interface DepreciationCalculatorProps {
  equipmentId: string;
}

const DepreciationCalculator: React.FC<DepreciationCalculatorProps> = ({ equipmentId }) => {
  const [method, setMethod] = useState<string>('straight-line');
  const [depreciation, setDepreciation] = useState<EquipmentDepreciation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDepreciation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await EquipmentService.calculateDepreciation(equipmentId, method);
      setDepreciation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算折旧失败');
    } finally {
      setLoading(false);
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'straight-line': return '直线法';
      case 'declining-balance': return '余额递减法';
      case 'units-of-production': return '工作量法';
      default: return method;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">折旧计算器</h3>
      </div>
      <div className="card-body">
        {error && <div className="error">{error}</div>}
        
        <div className="depreciation-method">
          <label className="form-label">计算方法:</label>
          <select 
            className="form-control" 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="straight-line">直线法</option>
            <option value="declining-balance">余额递减法</option>
            <option value="units-of-production">工作量法</option>
          </select>
          <button 
            className="btn btn-primary" 
            onClick={calculateDepreciation} 
            disabled={loading}
          >
            {loading ? '计算中...' : '计算折旧'}
          </button>
        </div>
        
        {depreciation.length > 0 && (
          <div className="mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>折旧金额</th>
                  <th>当前价值</th>
                  <th>计算方法</th>
                </tr>
              </thead>
              <tbody>
                {depreciation.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.depreciationDate).toLocaleDateString()}</td>
                    <td className="amount">${item.depreciationAmount.toLocaleString()}</td>
                    <td className="amount">${item.currentValue.toLocaleString()}</td>
                    <td>{getMethodDisplayName(item.method)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {depreciation.length === 0 && !loading && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>计算折旧以查看结果</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepreciationCalculator;
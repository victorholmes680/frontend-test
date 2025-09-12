import React, { useState, useEffect } from 'react';
import { EquipmentDepreciation } from '../../types/equipment';

interface DepreciationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (depreciation: Omit<EquipmentDepreciation, 'id'>) => void;
  editData?: EquipmentDepreciation | null;
}

const DepreciationFormModal: React.FC<DepreciationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState<Omit<EquipmentDepreciation, 'id'>>({
    equipmentId: '',
    depreciationAmount: 0,
    currentValue: 0,
    depreciationDate: new Date().toISOString().split('T')[0],
    method: 'straight-line'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      setFormData({
        equipmentId: editData.equipmentId,
        depreciationAmount: editData.depreciationAmount,
        currentValue: editData.currentValue,
        depreciationDate: editData.depreciationDate,
        method: editData.method
      });
    } else {
      setFormData({
        equipmentId: '',
        depreciationAmount: 0,
        currentValue: 0,
        depreciationDate: new Date().toISOString().split('T')[0],
        method: 'straight-line'
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipmentId.trim()) {
      newErrors.equipmentId = '请选择设备';
    }
    if (formData.depreciationAmount <= 0) {
      newErrors.depreciationAmount = '折旧金额必须大于0';
    }
    if (formData.currentValue < 0) {
      newErrors.currentValue = '当前价值不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'depreciationAmount' || name === 'currentValue' 
        ? parseFloat(value) || 0 
        : value
    } as Omit<EquipmentDepreciation, 'id'>));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editData ? '编辑折旧记录' : '新建折旧记录'}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="depreciation-form">
          <div className="form-group">
            <label htmlFor="equipmentId">设备ID *</label>
            <input
              type="text"
              id="equipmentId"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              className={errors.equipmentId ? 'error' : ''}
              placeholder="请输入设备ID"
            />
            {errors.equipmentId && <span className="error-message">{errors.equipmentId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="method">折旧方法 *</label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              className={errors.method ? 'error' : ''}
            >
              <option value="straight-line">直线法</option>
              <option value="declining-balance">余额递减法</option>
              <option value="units-of-production">工作量法</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="depreciationAmount">折旧金额 (¥) *</label>
            <input
              type="number"
              id="depreciationAmount"
              name="depreciationAmount"
              value={formData.depreciationAmount}
              onChange={handleChange}
              className={errors.depreciationAmount ? 'error' : ''}
              placeholder="请输入折旧金额"
              min="0"
              step="0.01"
            />
            {errors.depreciationAmount && <span className="error-message">{errors.depreciationAmount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currentValue">当前价值 (¥) *</label>
            <input
              type="number"
              id="currentValue"
              name="currentValue"
              value={formData.currentValue}
              onChange={handleChange}
              className={errors.currentValue ? 'error' : ''}
              placeholder="请输入当前价值"
              min="0"
              step="0.01"
            />
            {errors.currentValue && <span className="error-message">{errors.currentValue}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="depreciationDate">折旧日期 *</label>
            <input
              type="date"
              id="depreciationDate"
              name="depreciationDate"
              value={formData.depreciationDate}
              onChange={handleChange}
              className={errors.depreciationDate ? 'error' : ''}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              {editData ? '更新' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepreciationFormModal;
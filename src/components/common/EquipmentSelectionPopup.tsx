import React, { useState, useEffect } from 'react';
import { Equipment } from '../../types/equipment';
import { EquipmentService } from '../../services/api';

interface EquipmentSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (equipment: Equipment) => void;
  title?: string;
}

const EquipmentSelectionPopup: React.FC<EquipmentSelectionPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  title = "选择设备" 
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEquipment();
    }
  }, [isOpen]);

  useEffect(() => {
    if (equipment.length > 0) {
      const filtered = equipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  }, [equipment, searchTerm]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.getEquipmentList();
      setEquipment(data);
      setFilteredEquipment(data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedEquipment) {
      onSelect(selectedEquipment);
      onClose();
      setSelectedEquipment(null);
      setSearchTerm('');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'inactive': return '停用';
      case 'maintenance': return '维护中';
      default: return '未知';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'maintenance': return 'status-maintenance';
      default: return 'status-inactive';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content equipment-selection-popup">
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="popup-body">
          <div className="search-section">
            <input
              type="text"
              placeholder="搜索设备名称、类型或编号..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="equipment-list">
            {loading ? (
              <div className="loading">正在加载设备...</div>
            ) : (
              <div className="equipment-grid-popup">
                {filteredEquipment.map((item) => (
                  <div
                    key={item.id}
                    className={`equipment-card-popup ${selectedEquipment?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedEquipment(item)}
                  >
                    <div className="equipment-card-header">
                      <h4>{item.name}</h4>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="equipment-card-body">
                      <p><strong>编号:</strong> {item.equipNo}</p>
                      <p><strong>类型:</strong> {item.type}</p>
                      <p><strong>原始价值:</strong> ${item.originalValue.toLocaleString()}</p>
                      <p><strong>当前价值:</strong> ${item.currentValue.toLocaleString()}</p>
                      <p><strong>购买日期:</strong> {new Date(item.purchaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="popup-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSelect}
            disabled={!selectedEquipment}
          >
            选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelectionPopup;
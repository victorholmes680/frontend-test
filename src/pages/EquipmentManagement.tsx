import React, { useState } from 'react';
import EquipmentList from '../components/equipment/EquipmentList';
import InvestmentForm from '../components/equipment/InvestmentForm';
import DepreciationCalculator from '../components/equipment/DepreciationCalculator';

const EquipmentManagement: React.FC = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEquipmentSelect = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  const handleInvestmentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="main-content">
      <h1 className="page-title">设备管理系统</h1>
      
      <div className="mb-4">
        <EquipmentList 
          key={refreshKey}
          onEquipmentSelect={handleEquipmentSelect}
          selectedEquipmentId={selectedEquipmentId}
        />
      </div>
      
      {selectedEquipmentId && (
        <div className="grid grid-2">
          <InvestmentForm 
            equipmentId={selectedEquipmentId}
            onInvestmentCreated={handleInvestmentCreated}
          />
          
          <DepreciationCalculator equipmentId={selectedEquipmentId} />
        </div>
      )}
      
      {!selectedEquipmentId && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <p>选择一个设备来测试投资和折旧功能</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;
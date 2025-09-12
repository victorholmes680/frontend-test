import React, { useState } from "react";
import EquipmentList from "../components/equipment/EquipmentList";

const EquipmentManagement: React.FC = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  const handleEquipmentSelect = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  return (
    <div className="main-content">
      <h1 className="page-title">设备管理系统</h1>

      <div className="mb-4">
        <EquipmentList
          onEquipmentSelect={handleEquipmentSelect}
          selectedEquipmentId={selectedEquipmentId}
        />
      </div>
    </div>
  );
};

export default EquipmentManagement;

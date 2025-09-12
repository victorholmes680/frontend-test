import React, { useState } from 'react';
import { EquipmentDepreciation } from '../types/equipment';
import DepreciationList from '../components/depreciation/DepreciationList';
import DepreciationFormModal from '../components/depreciation/DepreciationFormModal';

const DepreciationPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepreciation, setEditingDepreciation] = useState<EquipmentDepreciation | null>(null);
  const [depreciations, setDepreciations] = useState<EquipmentDepreciation[]>([]);

  const handleCreate = () => {
    setEditingDepreciation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (depreciation: EquipmentDepreciation) => {
    setEditingDepreciation(depreciation);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条折旧记录吗？')) {
      setDepreciations(prev => prev.filter(dep => dep.id !== id));
    }
  };

  const handleSave = (depreciationData: Omit<EquipmentDepreciation, 'id'>) => {
    if (editingDepreciation) {
      // Update existing depreciation
      setDepreciations(prev => prev.map(dep => 
        dep.id === editingDepreciation.id 
          ? { ...depreciationData, id: editingDepreciation.id }
          : dep
      ));
    } else {
      // Create new depreciation
      const newDepreciation: EquipmentDepreciation = {
        ...depreciationData,
        id: Date.now().toString() // Simple ID generation
      };
      setDepreciations(prev => [...prev, newDepreciation]);
    }
    setIsModalOpen(false);
    setEditingDepreciation(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepreciation(null);
  };

  return (
    <div className="depreciation-page-container">
      <DepreciationList
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <DepreciationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editData={editingDepreciation}
      />
    </div>
  );
};

export default DepreciationPage;
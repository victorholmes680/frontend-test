import React, { useState, useRef } from "react";
import { EquipmentInvestment } from "../types/equipment";
import InvestmentList, {
  InvestmentListRef,
} from "../components/investment/InvestmentList";
import InvestmentFormModal from "../components/investment/InvestmentFormModal";
import { EquipmentService } from "../services/api";

const InvestmentPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] =
    useState<EquipmentInvestment | null>(null);
  const [investments, setInvestments] = useState<EquipmentInvestment[]>([]);
  const listRef = useRef<InvestmentListRef>(null); // the ref must contain the function called fetchInvestments

  const handleCreate = () => {
    setEditingInvestment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (investment: EquipmentInvestment) => {
    setEditingInvestment(investment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (window.confirm("确定要删除这条投资记录吗？")) {
        await EquipmentService.deleteInvestment(id);
        // Refresh the investment list after successful deletion
        if (listRef.current) {
          await listRef.current.fetchInvestments();
        }
      }
    } catch (error) {
      console.error("删除投资记录失败:", error);
      alert("删除投资记录失败，请稍后重试。");
    }
  };

  const handleSave = async (
    investmentData: Omit<EquipmentInvestment, "id">
  ) => {
    try {
      if (editingInvestment) {
        // Update existing investment
        setInvestments((prev) =>
          prev.map((inv) =>
            inv.id === editingInvestment.id
              ? { ...investmentData, id: editingInvestment.id }
              : inv
          )
        );
      } else {
        // Create new investment
        const newInvestment: EquipmentInvestment = {
          ...investmentData,
          id: Date.now().toString(), // Simple ID generation
        };
        setInvestments((prev) => [...prev, newInvestment]);
      }
      setIsModalOpen(false);
      setEditingInvestment(null);

      // Refresh the investment list after save
      if (listRef.current) {
        await listRef.current.fetchInvestments();
      }
    } catch (error) {
      console.error("保存投资记录失败:", error);
      alert("保存投资记录失败，请稍后重试。");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
  };

  return (
    <div className="investment-page-container">
      <InvestmentList
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        ref={listRef}
      />

      <InvestmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editData={editingInvestment}
      />
    </div>
  );
};

export default InvestmentPage;

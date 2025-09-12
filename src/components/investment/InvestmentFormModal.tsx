import React, { useState, useEffect } from "react";
import { EquipmentInvestment, Equipment } from "../../types/equipment";
import EquipmentSelectionPopup from "../../components/common/EquipmentSelectionPopup";
import { EquipmentService } from "../../services/api";

interface InvestmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Omit<EquipmentInvestment, "id">) => Promise<void>;
  editData?: EquipmentInvestment | null;
}

const InvestmentFormModal: React.FC<InvestmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [selectedEquipmentName, setSelectedEquipmentName] =
    useState<string>("");
  const [isEquipmentPopupOpen, setIsEquipmentPopupOpen] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [formData, setFormData] = useState<Omit<EquipmentInvestment, "id">>({
    equipmentId: "",
    investmentValue: 0,
    investmentRemainValue: 0,
    investmentMonth: "",
    investmentDescription: "",
    // amount: 0,
    // investmentDate: new Date().toISOString().split("T")[0],
    // description: "",
    type: "purchase",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch equipment list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEquipment();
    }
  }, [isOpen]);

  const fetchEquipment = async () => {
    try {
      setIsLoadingEquipment(true);
      const data = await EquipmentService.getEquipmentList();
      setEquipment(data);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  // Set form data when editing or creating new investment
  useEffect(() => {
    if (editData) {
      setFormData({
        equipmentId: editData.equipmentId,
        investmentValue: editData.investmentValue,
        investmentRemainValue: editData.investmentRemainValue,
        investmentMonth: editData.investmentMonth,
        investmentDescription: editData.investmentDescription,
        // amount: editData.amount,
        // investmentDate: editData.investmentDate,
        // description: editData.description,
        type: editData.type,
      });

      // Check for EquipmentInvestmentVo with equipmentName property
      if ("equipmentName" in editData && editData.equipmentName) {
        setSelectedEquipmentName(editData.equipmentName as string);
      } else if (editData.equipmentId && equipment.length > 0) {
        // Look up equipment name from our loaded equipment data
        const matchedEquipment = equipment.find(
          (e) => e.equipId === editData.equipmentId
        );
        if (matchedEquipment) {
          setSelectedEquipmentName(matchedEquipment.equipName);
        }
      }
    } else {
      setFormData({
        equipmentId: "",
        investmentValue: 0,
        investmentRemainValue: 0,
        investmentMonth: "",
        investmentDescription: "",
        // amount: 0,
        // investmentDate: new Date().toISOString().split("T")[0],
        // description: "",
        type: "purchase",
      });
    }
    setErrors({});
  }, [editData, isOpen, equipment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipmentId.trim()) {
      newErrors.equipmentId = "请选择设备";
    }
    if (formData.investmentValue <= 0) {
      newErrors.investmentValue = "投资金额必须大于0";
    }
    if (formData.investmentRemainValue < 0) {
      newErrors.investmentRemainValue = "投资剩余价值不能为负数";
    }
    if (formData.investmentRemainValue > formData.investmentValue) {
      newErrors.investmentRemainValue = "投资剩余价值不能大于投资金额";
    }
    if (!formData.investmentDescription.trim()) {
      newErrors.investmentDescription = "请填写描述";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for investment amount
    if (name === "amount") {
      const numValue = parseFloat(value) || 0;
      setFormData(
        (prev) =>
          ({
            ...prev,
            investmentValue: numValue,
            // Don't auto-update remain value - they are independent
          } as Omit<EquipmentInvestment, "id">)
      );
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            [name]:
              name === "investmentRemainValue" ? parseFloat(value) || 0 : value,
          } as Omit<EquipmentInvestment, "id">)
      );
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectEquipment = (equipment: Equipment) => {
    setFormData((prev) => ({
      ...prev,
      equipmentId: equipment.equipId,
      // Don't auto-set investment remain value, let user input manually
    }));
    setSelectedEquipmentName(equipment.equipName);

    // Clear error if it exists
    if (errors.equipmentId) {
      setErrors((prev) => ({ ...prev, equipmentId: "" }));
    }
  };

  const openEquipmentPopup = () => {
    setIsEquipmentPopupOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editData ? "编辑投资记录" : "新建投资记录"}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="investment-form">
          <div className="form-group">
            <label htmlFor="equipmentId">设备 *</label>
            <div className="equipment-select-container">
              <input
                type="text"
                id="equipmentDisplay"
                value={selectedEquipmentName}
                readOnly
                className={errors.equipmentId ? "error" : ""}
                placeholder="请选择设备"
                onClick={openEquipmentPopup}
              />
              <button
                type="button"
                className="select-equipment-btn"
                onClick={openEquipmentPopup}
              >
                选择
              </button>
            </div>
            {errors.equipmentId && (
              <span className="error-message">{errors.equipmentId}</span>
            )}
          </div>

          {/* <div className="form-group">
            <label htmlFor="type">投资类型 *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? "error" : ""}
            >
              <option value="purchase">购买</option>
              <option value="upgrade">升级</option>
              <option value="maintenance">维护</option>
            </select>
          </div> */}

          <div className="form-group">
            <label htmlFor="amount">投资金额 (¥) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.investmentValue}
              onChange={handleChange}
              className={errors.investmentValue ? "error" : ""}
              placeholder="请输入投资金额"
              min="0"
              step="0.01"
            />
            {errors.investmentValue && (
              <span className="error-message">{errors.investmentValue}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="investmentRemainValue">投资剩余价值 (¥) *</label>
            <input
              type="number"
              id="investmentRemainValue"
              name="investmentRemainValue"
              value={formData.investmentRemainValue}
              onChange={handleChange}
              className={errors.investmentRemainValue ? "error" : ""}
              placeholder="请输入投资剩余价值"
              min="0"
              step="0.01"
            />
            {errors.investmentRemainValue && (
              <span className="error-message">
                {errors.investmentRemainValue}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="investmentMonth">投资月份 *</label>
            <input
              type="month"
              id="investmentMonth"
              name="investmentMonth"
              value={formData.investmentMonth}
              onChange={handleChange}
              className={errors.investmentMonth ? "error" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="investmentDescription">描述 *</label>
            <textarea
              id="investmentDescription"
              name="investmentDescription"
              value={formData.investmentDescription}
              onChange={handleChange}
              className={errors.investmentDescription ? "error" : ""}
              placeholder="请输入投资描述"
              rows={3}
            />
            {errors.investmentDescription && (
              <span className="error-message">
                {errors.investmentDescription}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : editData ? "更新" : "创建"}
            </button>
          </div>
        </form>
      </div>

      {/* Equipment Selection Popup */}
      <EquipmentSelectionPopup
        isOpen={isEquipmentPopupOpen}
        onClose={() => setIsEquipmentPopupOpen(false)}
        onSelect={handleSelectEquipment}
        title="选择设备"
      />
    </div>
  );
};

export default InvestmentFormModal;

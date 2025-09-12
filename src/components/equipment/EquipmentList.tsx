import React, { useState, useEffect } from "react";
import { Equipment } from "../../types/equipment";
import { EquipmentService } from "../../services/api";

interface EquipmentListProps {
  onEquipmentSelect?: (equipmentId: string) => void;
  selectedEquipmentId?: string;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  onEquipmentSelect,
  selectedEquipmentId,
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.getEquipmentList();
      console.log("Equipment data:", data);
      setEquipment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取设备列表失败");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "inactive":
        return "status-inactive";
      case "maintenance":
        return "status-maintenance";
      default:
        return "status-inactive";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "正常";
      case "inactive":
        return "停用";
      case "maintenance":
        return "维护中";
      default:
        return "未知";
    }
  };

  if (loading) return <div className="loading">正在加载设备...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">设备列表</h3>
      </div>
      <div className="card-body">
        {equipment.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>未找到设备</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>设备名称</th>
                <th>设备类型</th>
                <th>购买日期</th>
                <th>原始价值</th>
                <th>当前价值</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr
                  key={item.id}
                  className={selectedEquipmentId === item.id ? "selected" : ""}
                >
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>
                    {item.purchaseDate
                      ? new Date(item.purchaseDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="amount">
                    ${(item.originalValue || 0).toLocaleString()}
                  </td>
                  <td className="amount">
                    ${(item.currentValue || 0).toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className="equipment-actions">
                      <button
                        className={`btn ${
                          selectedEquipmentId === item.id
                            ? "btn-primary"
                            : "btn-secondary"
                        }`}
                        onClick={() => onEquipmentSelect?.(item.id)}
                        disabled={selectedEquipmentId === item.id}
                      >
                        {selectedEquipmentId === item.id ? "已选中" : "选择"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;

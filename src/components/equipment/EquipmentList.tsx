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
  const [lastDepreciationMonths, setLastDepreciationMonths] = useState<
    Record<string, string>
  >({});
  const [loadingDepreciation, setLoadingDepreciation] = useState<
    Record<string, boolean>
  >({});

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

  const fetchLastDepreciationMonth = async (equipmentId: string) => {
    try {
      setLoadingDepreciation((prev) => ({ ...prev, [equipmentId]: true }));
      const month = await EquipmentService.getLatestDepreciatedMonth(
        equipmentId
      );
      setLastDepreciationMonths((prev) => ({ ...prev, [equipmentId]: month }));
    } catch (err) {
      console.error(
        `Failed to fetch last depreciation month for ${equipmentId}:`,
        err
      );
      setLastDepreciationMonths((prev) => ({
        ...prev,
        [equipmentId]: "无数据",
      }));
    } finally {
      setLoadingDepreciation((prev) => ({ ...prev, [equipmentId]: false }));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "1":
        return "status-active";
      case "0":
        return "status-inactive";
      case "2":
        return "status-maintenance";
      default:
        return "status-inactive";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "正常";
      case "0":
        return "停用";
      case "2":
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
          <div className="equipment-list">
            <div className="table-scroll-hint">
              <span className="scroll-hint-text">
                💡 表格较宽，可以左右滑动查看所有列
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>设备编号</th>
                  <th>设备名称</th>
                  <th>设备型号</th>
                  <th>设备类型</th>
                  <th>制造商</th>
                  <th>购买日期</th>
                  <th>原值</th>
                  <th>残值</th>
                  <th>投资金额</th>
                  <th>折旧月数</th>
                  <th>状态</th>
                  <th>上次折旧月份</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr
                    key={item.equipId}
                    className={
                      selectedEquipmentId === item.equipId ? "selected" : ""
                    }
                  >
                    <td>{item.equipNo}</td>
                    <td>{item.equipName}</td>
                    <td>{item.equipModel}</td>
                    <td>{item.equipTypeName}</td>
                    <td>{item.manufacturer}</td>
                    <td>
                      {item.purchaseDate
                        ? new Date(item.purchaseDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="amount">
                      ¥{(item.originValueOfAssets || 0).toLocaleString()}
                    </td>
                    <td className="amount">
                      ¥{(item.expectedResidualValue || 0).toLocaleString()}
                    </td>
                    <td className="amount">
                      ¥{(item.investmentMoney || 0).toLocaleString()}
                    </td>
                    <td>
                      {item.depreciatedMonths || 0} /{" "}
                      {item.totalDepreciationMonths || 0}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          item.equipStatus
                        )}`}
                      >
                        {getStatusText(item.equipStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="depreciation-month-cell">
                        {lastDepreciationMonths[item.equipId] ? (
                          <span className="depreciation-month">
                            {lastDepreciationMonths[item.equipId]}
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              fetchLastDepreciationMonth(item.equipId)
                            }
                            disabled={loadingDepreciation[item.equipId]}
                          >
                            {loadingDepreciation[item.equipId]
                              ? "查询中..."
                              : "查看"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="equipment-actions">
                        <button
                          className={`btn ${
                            selectedEquipmentId === item.equipId
                              ? "btn-primary"
                              : "btn-secondary"
                          }`}
                          onClick={() => onEquipmentSelect?.(item.equipId)}
                          disabled={selectedEquipmentId === item.equipId}
                        >
                          {selectedEquipmentId === item.equipId
                            ? "已选中"
                            : "选择"}
                        </button>
                      </div>
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

export default EquipmentList;

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { EquipmentService } from "../../services/api";
import {
  EquipmentInvestment,
  EquipmentInvestmentVo,
} from "../../types/equipment";

export interface InvestmentListRef {
  fetchInvestments: () => Promise<void>;
}

interface InvestmentListProps {
  onEdit: (investment: EquipmentInvestment) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRefresh?: () => void;
}

const InvestmentList = forwardRef<InvestmentListRef, InvestmentListProps>(
  ({ onEdit, onDelete, onCreate }, ref) => {
    const [investments, setInvestments] = useState<EquipmentInvestmentVo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const data = await EquipmentService.getInvestmentList();
        setInvestments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取投资列表失败");
      } finally {
        setLoading(false);
      }
    };

    // 自定义引用对象绑定的值，否则默认绑定到dom node上
    useImperativeHandle(ref, () => ({
      fetchInvestments,
    }));

    const getTypeText = (type: string) => {
      switch (type) {
        case "purchase":
          return "购买";
        case "upgrade":
          return "升级";
        case "maintenance":
          return "维护";
        default:
          return "其他";
      }
    };

    const getTypeClass = (type: string) => {
      switch (type) {
        case "purchase":
          return "type-purchase";
        case "upgrade":
          return "type-upgrade";
        case "maintenance":
          return "type-maintenance";
        default:
          return "type-other";
      }
    };

    if (loading) {
      return (
        <div className="page-loading">
          <div className="loading-spinner">加载中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="page-error">
          <div className="error-message">{error}</div>
          <button onClick={fetchInvestments} className="retry-button">
            重试
          </button>
        </div>
      );
    }

    return (
      <div className="investment-page">
        <div className="page-header">
          <h1 className="page-title">投资管理</h1>
          <button onClick={onCreate} className="btn btn-primary">
            <span className="btn-icon">+</span>
            新建投资记录
          </button>
        </div>

        <div className="list-container">
          {investments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <p>暂无投资记录</p>
              <button onClick={onCreate} className="btn btn-outline-primary">
                创建第一条投资记录
              </button>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>设备名称</th>
                    <th>投资值</th>
                    <th>投资剩余值</th>
                    <th>投资月份</th>
                    <th>描述</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {investments
                    .filter((investment) => investment?.id)
                    .map((investment) => (
                      <tr key={investment.id}>
                        <td>{investment.equipmentName}</td>
                        <td className="amount">
                          ¥{(investment.investmentValue || 0).toLocaleString()}
                        </td>
                        <td className="amount">
                          ¥
                          {(
                            investment.investmentRemainValue || 0
                          ).toLocaleString()}
                        </td>
                        <td>{investment.investmentMonth}</td>
                        <td className="description">
                          {investment.investmentDescription}
                        </td>
                        <td className="actions">
                          <button
                            onClick={() => onEdit(investment)}
                            className="btn btn-sm btn-outline-primary"
                            title="编辑"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              investment.id && onDelete(investment.id)
                            }
                            className="btn btn-sm btn-outline-danger"
                            title="删除"
                          >
                            🗑️
                          </button>
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
  }
);

export default InvestmentList;

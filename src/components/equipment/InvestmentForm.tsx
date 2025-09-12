import React, { useState } from "react";
import { EquipmentInvestment } from "../../types/equipment";
import { EquipmentService } from "../../services/api";

interface InvestmentFormProps {
  equipmentId: string;
  onInvestmentCreated: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  equipmentId,
  onInvestmentCreated,
}) => {
  const [investment, setInvestment] = useState<Omit<EquipmentInvestment, "id">>(
    {
      equipmentId,
      investmentValue: 0,
      investmentRemainValue: 0,
      investmentMonth: "",
      investmentDescription: "",
      type: "purchase",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await EquipmentService.createInvestment(investment);
      setInvestment({
        equipmentId,
        investmentValue: 0,
        investmentRemainValue: 0,
        investmentMonth: "",
        investmentDescription: "",
        type: "purchase",
      });
      setSuccess("投资创建成功");
      onInvestmentCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建投资失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">添加投资</h3>
      </div>
      <div className="card-body">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">金额 ($):</label>
            <input
              type="number"
              className="form-control"
              value={investment.investmentValue}
              onChange={(e) =>
                setInvestment({
                  ...investment,
                  investmentValue: parseFloat(e.target.value),
                })
              }
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">投资月份:</label>
            <input
              type="month"
              className="form-control"
              value={investment.investmentMonth}
              onChange={(e) =>
                setInvestment({
                  ...investment,
                  investmentMonth: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">类型:</label>
            <select
              className="form-control"
              value={investment.type}
              onChange={(e) =>
                setInvestment({ ...investment, type: e.target.value as any })
              }
              required
            >
              <option value="purchase">购买</option>
              <option value="upgrade">升级</option>
              <option value="maintenance">维护</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">描述:</label>
            <textarea
              className="form-control"
              value={investment.investmentDescription}
              onChange={(e) =>
                setInvestment({
                  ...investment,
                  investmentDescription: e.target.value,
                })
              }
              rows={3}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "创建中..." : "创建投资"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvestmentForm;

import React, { useState, useEffect } from "react";
import { EquipmentService } from "../services/api";

interface DepreciationReportItem {
  equipmentTypeId: string;
  equipmentTypeName: string;
  investmentValue: number;
  equipmentCode: string;
  equipmentSpecification: string;
  originalValue: number;
  equipmentName: string;
  depreciationAmount: number;
  equipmentId: string;
  residualValue: number;
  currentValue: number;
}

interface CurrentValueReportItem {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  purchaseDate: string;
  originalValue: number;
  residualValue: number;
  depreciationMonths: number;
  totalDepreciation: number;
  lastPeriodDepreciation: number;
  currentValue: number;
  investmentValue: number;
  equipmentTypeId: string;
  equipmentTypeName: string;
}

const DepreciationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "process" | "report" | "currentValue"
  >("process");
  const [targetMonth, setTargetMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Report states
  const [depreciationReport, setDepreciationReport] = useState<
    DepreciationReportItem[]
  >([]);
  const [currentValueReport, setCurrentValueReport] = useState<
    CurrentValueReportItem[]
  >([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Filter states for reports
  const [reportFilters, setReportFilters] = useState({
    targetMonth: "",
    departmentId: "",
    equipmentTypeId: "",
  });

  const [currentValueFilters, setCurrentValueFilters] = useState({
    equipmentCode: "",
    equipmentName: "",
    equipmentTypeId: "",
  });

  useEffect(() => {
    // Set default target month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    setTargetMonth(currentMonth);
    setReportFilters((prev) => ({ ...prev, targetMonth: currentMonth }));
  }, []);

  const handleProcessDepreciation = async () => {
    if (!targetMonth) {
      setError("请选择目标月份");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await EquipmentService.processDepreciation(targetMonth);
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "执行折旧处理失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDepreciation = async () => {
    if (!targetMonth) {
      setError("请选择目标月份");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await EquipmentService.cancelDepreciation(targetMonth);
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消折旧处理失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDepreciationReport = async () => {
    try {
      setReportLoading(true);
      const data = await EquipmentService.getDepreciationReport(
        reportFilters.targetMonth || undefined,
        reportFilters.departmentId || undefined,
        reportFilters.equipmentTypeId || undefined
      );
      setDepreciationReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取折旧报表失败");
    } finally {
      setReportLoading(false);
    }
  };

  const handleGetCurrentValueReport = async () => {
    try {
      setReportLoading(true);
      const data = await EquipmentService.getCurrentValueReport(
        currentValueFilters.equipmentCode || undefined,
        currentValueFilters.equipmentName || undefined,
        currentValueFilters.equipmentTypeId || undefined
      );
      setCurrentValueReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取现值报表失败");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="depreciation-page-container">
      <div className="page-header">
        <h1 className="page-title">折旧管理</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "process" ? "active" : ""}`}
          onClick={() => setActiveTab("process")}
        >
          折旧处理
        </button>
        <button
          className={`tab-button ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          折旧报表
        </button>
        <button
          className={`tab-button ${
            activeTab === "currentValue" ? "active" : ""
          }`}
          onClick={() => setActiveTab("currentValue")}
        >
          现值报表
        </button>
      </div>

      {/* Messages */}
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Depreciation Process Tab */}
      {activeTab === "process" && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">折旧处理</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="targetMonth">目标月份</label>
                <input
                  type="month"
                  id="targetMonth"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleProcessDepreciation}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "处理中..." : "执行折旧处理"}
                </button>
                <button
                  onClick={handleCancelDepreciation}
                  disabled={loading}
                  className="btn btn-danger"
                >
                  {loading ? "处理中..." : "取消折旧处理"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Depreciation Report Tab */}
      {activeTab === "report" && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">折旧报表</h3>
            </div>
            <div className="card-body">
              <div className="report-filters">
                <div className="form-group">
                  <label htmlFor="reportTargetMonth">目标月份</label>
                  <input
                    type="month"
                    id="reportTargetMonth"
                    value={reportFilters.targetMonth}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        targetMonth: e.target.value,
                      }))
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departmentId">部门ID</label>
                  <input
                    type="text"
                    id="departmentId"
                    value={reportFilters.departmentId}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="可选"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="equipmentTypeId">设备类型ID</label>
                  <input
                    type="text"
                    id="equipmentTypeId"
                    value={reportFilters.equipmentTypeId}
                    onChange={(e) =>
                      setReportFilters((prev) => ({
                        ...prev,
                        equipmentTypeId: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="可选"
                  />
                </div>
                <button
                  onClick={handleGetDepreciationReport}
                  disabled={reportLoading}
                  className="btn btn-primary"
                >
                  {reportLoading ? "加载中..." : "获取报表"}
                </button>
              </div>

              {depreciationReport.length > 0 && (
                <div className="data-table-container depreciation-report">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>设备ID</th>
                        <th>设备编号</th>
                        <th>设备名称</th>
                        <th>设备规格</th>
                        <th>设备类型</th>
                        <th>原值</th>
                        <th>残值</th>
                        <th>折旧金额</th>
                        <th>当前价值</th>
                        <th>投资价值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depreciationReport.map((item, index) => (
                        <tr key={index}>
                          <td>{item.equipmentId}</td>
                          <td>{item.equipmentCode}</td>
                          <td>{item.equipmentName}</td>
                          <td>{item.equipmentSpecification}</td>
                          <td>{item.equipmentTypeName}</td>
                          <td className="amount">
                            ¥{(item.originalValue || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.residualValue || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.depreciationAmount || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.currentValue || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.investmentValue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current Value Report Tab */}
      {activeTab === "currentValue" && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">设备现值报表</h3>
            </div>
            <div className="card-body">
              <div className="report-filters">
                <div className="form-group">
                  <label htmlFor="equipmentCode">设备编号</label>
                  <input
                    type="text"
                    id="equipmentCode"
                    value={currentValueFilters.equipmentCode}
                    onChange={(e) =>
                      setCurrentValueFilters((prev) => ({
                        ...prev,
                        equipmentCode: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="可选"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="equipmentName">设备名称</label>
                  <input
                    type="text"
                    id="equipmentName"
                    value={currentValueFilters.equipmentName}
                    onChange={(e) =>
                      setCurrentValueFilters((prev) => ({
                        ...prev,
                        equipmentName: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="可选"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currentValueEquipmentTypeId">
                    设备类型ID
                  </label>
                  <input
                    type="text"
                    id="currentValueEquipmentTypeId"
                    value={currentValueFilters.equipmentTypeId}
                    onChange={(e) =>
                      setCurrentValueFilters((prev) => ({
                        ...prev,
                        equipmentTypeId: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="可选"
                  />
                </div>
                <button
                  onClick={handleGetCurrentValueReport}
                  disabled={reportLoading}
                  className="btn btn-primary"
                >
                  {reportLoading ? "加载中..." : "获取报表"}
                </button>
              </div>

              {currentValueReport.length > 0 && (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>设备ID</th>
                        <th>设备编号</th>
                        <th>设备名称</th>
                        <th>设备类型</th>
                        <th>购买日期</th>
                        <th>原值</th>
                        <th>残值</th>
                        <th>折旧月数</th>
                        <th>累计折旧</th>
                        <th>上期折旧</th>
                        <th>当前价值</th>
                        <th>投资价值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentValueReport.map((item, index) => (
                        <tr key={index}>
                          <td>{item.equipmentId}</td>
                          <td>{item.equipmentCode}</td>
                          <td>{item.equipmentName}</td>
                          <td>{item.equipmentTypeName}</td>
                          <td>
                            {item.purchaseDate
                              ? new Date(item.purchaseDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="amount">
                            ¥{(item.originalValue || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.residualValue || 0).toLocaleString()}
                          </td>
                          <td>{item.depreciationMonths || 0}</td>
                          <td className="amount">
                            ¥{(item.totalDepreciation || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥
                            {(
                              item.lastPeriodDepreciation || 0
                            ).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.currentValue || 0).toLocaleString()}
                          </td>
                          <td className="amount">
                            ¥{(item.investmentValue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepreciationPage;

import React, { useState, useEffect } from "react";
import {
  ManageDimensionVo,
  DimensionGroups,
  PageResponse,
  TreeDataItem,
} from "../../types/equipment";
import { EquipmentService } from "../../services/api";
import ManageDimensionFormModal from "./ManageDimensionFormModal";

interface ManageDimensionListProps {
  onDimensionSelect?: (dimensionId: string) => void;
  selectedDimensionId?: string;
}

const ManageDimensionList: React.FC<ManageDimensionListProps> = ({
  onDimensionSelect,
  selectedDimensionId,
}) => {
  const [dimensions, setDimensions] = useState<ManageDimensionVo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    size: 10,
    current: 1,
    pages: 0,
  });
  const [dimensionGroups, setDimensionGroups] = useState<DimensionGroups>({});
  const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const [showModal, setShowModal] = useState(false);
  const [editingDimension, setEditingDimension] =
    useState<ManageDimensionVo | null>(null);

  useEffect(() => {
    fetchDimensionGroups();
    fetchTreeData();
  }, [currentPage]);

  const fetchDimensionGroups = async () => {
    try {
      const groups = await EquipmentService.getDimensionGroups();
      setDimensionGroups(groups);
    } catch (err) {
      console.error("获取维度组失败:", err);
    }
  };

  const fetchTreeData = async () => {
    try {
      const data = await EquipmentService.getDimensionTreeListByGroup();
      setTreeData(data);
    } catch (err) {
      console.error("获取树形数据失败:", err);
    }
  };

  const handleAddDimension = () => {
    setEditingDimension(null);
    setShowModal(true);
  };

  const handleEditDimension = (dimension: ManageDimensionVo) => {
    setEditingDimension(dimension);
    setShowModal(true);
  };

  const handleDeleteDimension = async (mdId: string) => {
    if (window.confirm("确定要删除这个维度吗？")) {
      try {
        await EquipmentService.removeDimension(mdId);
        await fetchTreeData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "删除维度失败");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDimensionSelect = (dimensionId: string) => {
    if (onDimensionSelect) {
      onDimensionSelect(dimensionId);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDimension(null);
  };

  const handleModalSubmit = async () => {
    await fetchTreeData();
    handleModalClose();
  };

  const renderTreeItem = (item: TreeDataItem) => (
    <div key={item.key} className="tree-item">
      <div className="tree-item-content">
        <span className="tree-item-label">{item.label}</span>
        <span className="tree-item-group">
          ({dimensionGroups[item.dimensionGroupId]})
        </span>
        {item.area && <span className="tree-item-area">{item.area}㎡</span>}
        <div className="tree-item-actions">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleEditDimension(item as ManageDimensionVo)}
          >
            编辑
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteDimension(item.mdId)}
          >
            删除
          </button>
        </div>
      </div>
      {item.children && item.children.length > 0 && (
        <div className="tree-children">
          {item.children.map((child) => renderTreeItem(child))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dimension-management">
      <div className="dimension-header">
        <h2>管理维度</h2>
        <div className="dimension-actions">
          <div className="view-mode-toggle">
            <button
              className={`btn ${
                viewMode === "list" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setViewMode("list")}
            >
              列表视图
            </button>
            <button
              className={`btn ${
                viewMode === "tree" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setViewMode("tree")}
            >
              树形视图
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleAddDimension}>
            添加维度
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="dimension-list-view">
          <table className="table">
            <thead>
              <tr>
                <th>维度名称</th>
                <th>维度组</th>
                <th>面积</th>
                <th>父维度</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension) => (
                <tr
                  key={dimension.mdId}
                  className={`dimension-row ${
                    selectedDimensionId === dimension.mdId ? "selected" : ""
                  }`}
                  onClick={() => handleDimensionSelect(dimension.mdId)}
                >
                  <td>{dimension.mdName}</td>
                  <td>{dimensionGroups[dimension.dimensionGroupId]}</td>
                  <td>{dimension.area || "-"}</td>
                  <td>{dimension.parentId || "-"}</td>
                  <td>{dimension.orderNo || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDimension(dimension);
                        }}
                      >
                        编辑
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDimension(dimension.mdId);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </button>
              <span className="page-info">
                第 {currentPage} 页，共 {pagination.pages} 页
              </span>
              <button
                className="btn btn-sm"
                disabled={currentPage === pagination.pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="dimension-tree-view">
          <div className="tree-container">
            {treeData.length > 0 ? (
              treeData.map((item) => renderTreeItem(item))
            ) : (
              <div className="no-data">暂无数据</div>
            )}
          </div>
        </div>
      )}

      <ManageDimensionFormModal
          dimension={editingDimension}
          dimensionGroups={dimensionGroups}
          treeData={treeData}
          visible={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
    </div>
  );
};

export default ManageDimensionList;

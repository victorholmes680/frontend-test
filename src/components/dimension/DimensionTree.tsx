import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ManageDimensionVo,
  DimensionGroups,
  TreeDataItem,
} from "../../types/equipment";
import { EquipmentService } from "../../services/api";

export interface DimensionTreeRef {
  fetchTreeData: () => Promise<void>;
}

interface DimensionTreeProps {
  onEdit: (dimension: ManageDimensionVo) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRefresh?: () => void;
}

const DimensionTree = forwardRef<DimensionTreeRef, DimensionTreeProps>(
  ({ onEdit, onDelete, onCreate }, ref) => {
    const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
    const [dimensionGroups, setDimensionGroups] = useState<DimensionGroups>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    useEffect(() => {
      fetchTreeData();
      fetchDimensionGroups();
    }, []);

    const fetchTreeData = async () => {
      try {
        setLoading(true);
        const data = await EquipmentService.getDimensionTreeListByGroup();
        setTreeData(data);

        // Auto-expand all nodes by default
        const allKeys = data.reduce((keys: string[], item) => {
          keys.push(item.key);
          if (item.children) {
            item.children.forEach((child: TreeDataItem) => keys.push(child.key));
          }
          return keys;
        }, []);
        setExpandedKeys(allKeys);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取树形数据失败");
      } finally {
        setLoading(false);
      }
    };

    const fetchDimensionGroups = async () => {
      try {
        const groups = await EquipmentService.getDimensionGroups();
        setDimensionGroups(groups);
      } catch (err) {
        console.error("获取维度组失败:", err);
      }
    };

    const handleToggleExpand = (key: string) => {
      setExpandedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const renderTreeItem = (item: TreeDataItem, level: number = 0) => {
      const isExpanded = expandedKeys.includes(item.key);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.key} className="tree-item">
          <div
            className={`tree-item-content ${level === 0 ? "tree-root" : ""}`}
            style={{ paddingLeft: `${level * 20 + 10}px` }}
          >
            <div className="tree-item-main">
              {hasChildren && (
                <button
                  className="tree-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(item.key);
                  }}
                >
                  {isExpanded ? "▼" : "►"}
                </button>
              )}

              <div className="tree-item-info">
                <div className="tree-item-name">{item.label}</div>
                <div className="tree-item-meta">
                  <span className="dimension-group">
                    {dimensionGroups[item.dimensionGroupId]}
                  </span>
                  {item.area && (
                    <span className="dimension-area">{item.area}㎡</span>
                  )}
                  {item.orderNo !== undefined && (
                    <span className="dimension-order">#{item.orderNo}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="tree-item-actions">
              <button
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item as ManageDimensionVo);
                }}
                title="编辑"
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.mdId);
                }}
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="tree-children">
              {item.children!.map((child: TreeDataItem) => renderTreeItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    useImperativeHandle(ref, () => ({
      fetchTreeData,
    }));

    if (loading) {
      return (
        <div className="dimension-tree-loading">
          <div className="loading-spinner">加载中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dimension-tree-error">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={fetchDimensionGroups}>
            重试
          </button>
        </div>
      );
    }

    return (
      <div className="dimension-tree-container">
        <div className="dimension-tree-header">
          <div className="dimension-tree-title">
            <h3>管理维度树</h3>
            <span className="dimension-count">
              共 {treeData.length} 个根维度
            </span>
          </div>
          <button className="btn btn-primary" onClick={onCreate}>
            ➕ 添加维度
          </button>
        </div>

        <div className="dimension-tree-legend">
          <span className="legend-item">
            <span className="legend-color root"></span>根维度
          </span>
          <span className="legend-item">
            <span className="legend-color child"></span>子维度
          </span>
        </div>

        <div className="dimension-tree">
          {treeData.length > 0 ? (
            treeData.map((item) => renderTreeItem(item))
          ) : (
            <div className="dimension-tree-empty">
              <div className="empty-icon">📁</div>
              <div className="empty-text">暂无维度数据</div>
              <button className="btn btn-primary" onClick={onCreate}>
                创建第一个维度
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default DimensionTree;

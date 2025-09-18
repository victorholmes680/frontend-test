import React, { useState, useRef, useEffect } from "react";
import {
  ManageDimensionVo,
  DimensionGroups,
  TreeDataItem,
} from "../types/equipment";
import ManageDimensionFormModal from "../components/dimension/ManageDimensionFormModal";
import { EquipmentService } from "../services/api";
import {
  Layout,
  Card,
  Tree,
  Button,
  Spin,
  Alert,
  Row,
  Col,
  Typography,
  Space,
  message,
  Breadcrumb,
  Select,
} from "antd";
import type { TreeProps } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ManageDimensionPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDimension, setEditingDimension] =
    useState<ManageDimensionVo | null>(null);
  const [dimensionGroups, setDimensionGroups] = useState<DimensionGroups>({});
  const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useEffect(() => {
    fetchDimensionGroups();
    fetchTreeData();
  }, []);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    fetchTreeData(groupId);
  };

  const fetchDimensionGroups = async () => {
    try {
      const groups = await EquipmentService.getDimensionGroups();
      setDimensionGroups(groups);
    } catch (err) {
      console.error("获取维度组失败:", err);
    }
  };

  const fetchTreeData = async (groupId?: string) => {
    try {
      setLoading(true);
      const response = await EquipmentService.getDimensionTreeListByGroup();
      console.log("API Response:", response); // Debug log

      // Filter the response by selected group if provided
      const filteredData = groupId
        ? response.filter((item: any) => {
            // Check if the item or its children belong to the selected group
            const itemGroupId = item.data?.dimensionGroupId;
            if (itemGroupId === groupId) return true;

            // Check children recursively
            const checkChildren = (children: any[]): boolean => {
              return children.some((child: any) => {
                const childGroupId = child.data?.dimensionGroupId;
                if (childGroupId === groupId) return true;
                if (child.children) return checkChildren(child.children);
                return false;
              });
            };

            return item.children ? checkChildren(item.children) : false;
          })
        : response;

      // Process the nested structure recursively
      const processTreeItem = (item: any): TreeDataItem => {
        const data = item.data;
        const treeItem: TreeDataItem = {
          key: data.mdId,
          label: data.mdName,
          mdId: data.mdId,
          mdName: data.mdName,
          dimensionGroupId: data.dimensionGroupId,
          dimensionGroupName: data.dimensionGroupName,
          parentId: data.parentId,
          orderNo: data.orderNo,
          area: data.area,
          children: []
        };

        // Process children recursively and filter by selected group
        if (item.children && item.children.length > 0) {
          const filteredChildren = groupId
            ? item.children.filter((child: any) => child.data?.dimensionGroupId === groupId)
            : item.children;
          treeItem.children = filteredChildren.map((child: any) => processTreeItem(child));
        }

        return treeItem;
      };

      const extractedData = filteredData.map((item: any) => processTreeItem(item));
      console.log("Extracted Data:", extractedData); // Debug log
      setTreeData(extractedData);

      // Auto-expand all keys
      const allKeys = extractedData.reduce((keys: string[], item) => {
        keys.push(item.key);
        if (item.children) {
          item.children.forEach((child: TreeDataItem) => keys.push(child.key));
        }
        return keys;
      }, []);
      setExpandedKeys(allKeys);

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err); // Debug log
      setError(err instanceof Error ? err.message : "获取树形数据失败");
    } finally {
      setLoading(false);
    }
  };

  // Convert TreeDataItem to Ant Design Tree data structure
  const convertToAntTreeData = (items: TreeDataItem[]): TreeProps['treeData'] => {
    return items.map(item => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text strong>{item.label}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dimensionGroups[item.dimensionGroupId]}
              {item.area && ` • ${item.area}㎡`}
              {item.orderNo !== undefined && ` • #${item.orderNo}`}
            </Text>
          </div>
          <Space>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.mdId);
              }}
            />
          </Space>
        </div>
      ),
      key: item.key,
      icon: expandedKeys.includes(item.key) ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: item.children ? convertToAntTreeData(item.children) : undefined,
    }));
  };

  const handleCreate = () => {
    setEditingDimension(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dimension: TreeDataItem) => {
    setEditingDimension(dimension as ManageDimensionVo);
    setIsModalOpen(true);
  };

  const handleDelete = async (mdId: string) => {
    try {
      if (window.confirm("确定要删除这个维度吗？")) {
        await EquipmentService.removeDimension(mdId);
        message.success("删除成功");
        await fetchTreeData(selectedGroup);
      }
    } catch (error) {
      console.error("删除维度失败:", error);
      message.error("删除维度失败，请稍后重试。");
    }
  };

  const handleSave = async () => {
    try {
      setIsModalOpen(false);
      setEditingDimension(null);
      message.success("保存成功");
      await fetchTreeData(selectedGroup);
    } catch (error) {
      console.error("保存维度失败:", error);
      message.error("保存维度失败，请稍后重试。");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDimension(null);
  };

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue as string[]);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeysValue) => {
    setSelectedKeys(selectedKeysValue as string[]);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item>首页</Breadcrumb.Item>
                <Breadcrumb.Item>系统管理</Breadcrumb.Item>
                <Breadcrumb.Item>维度管理</Breadcrumb.Item>
              </Breadcrumb>
              <Title level={2} style={{ margin: 0, marginTop: 8 }}>
                维度管理
              </Title>
              <Text type="secondary">管理和组织您的维度结构</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                添加维度
              </Button>
            </Col>
          </Row>

          {/* Group Selector */}
          <Row style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Text strong>选择维度组：</Text>
              <Select
                style={{ width: 200, marginLeft: 8 }}
                placeholder="请选择维度组"
                value={selectedGroup}
                onChange={handleGroupChange}
                allowClear
                optionFilterProp="children"
              >
                {Object.entries(dimensionGroups).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {selectedGroup
                  ? `当前显示：${dimensionGroups[selectedGroup]}`
                  : '显示所有维度组'
                }
              </Text>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>加载维度数据...</Text>
              </div>
            </div>
          ) : error ? (
            <Alert
              message="加载失败"
              description={error}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => fetchTreeData(selectedGroup)}>
                  重试
                </Button>
              }
            />
          ) : (
            <>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Text>
                    共 <strong>{treeData.length}</strong> 个根维度
                  </Text>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchTreeData(selectedGroup)}
                  >
                    刷新
                  </Button>
                </Col>
              </Row>

              {treeData.length > 0 ? (
                <Card>
                  <Tree
                    treeData={convertToAntTreeData(treeData)}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    onExpand={onExpand}
                    onSelect={onSelect}
                    showLine
                    blockNode
                  />
                </Card>
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <FolderOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <Title level={4} style={{ marginTop: 16, color: '#8c8c8c' }}>
                      暂无维度数据
                    </Title>
                    <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
                      点击上方"添加维度"按钮创建您的第一个维度
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                    >
                      创建维度
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </Card>

        <ManageDimensionFormModal
          dimension={editingDimension}
          dimensionGroups={dimensionGroups}
          treeData={treeData}
          visible={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSave}
        />
      </Content>
    </Layout>
  );
};

export default ManageDimensionPage;

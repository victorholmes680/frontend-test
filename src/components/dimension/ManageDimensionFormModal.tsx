import React, { useState, useEffect } from "react";
import {
  ManageDimensionVo,
  ManageDimensionAddDto,
  ManageDimensionEditDto,
  DimensionGroups,
  TreeDataItem
} from "../../types/equipment";
import { EquipmentService } from "../../services/api";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  message,
  Row,
  Col,
  Alert,
} from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface ManageDimensionFormModalProps {
  dimension?: ManageDimensionVo | null;
  dimensionGroups: DimensionGroups;
  treeData: TreeDataItem[];
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const { Option } = Select;

const ManageDimensionFormModal: React.FC<ManageDimensionFormModalProps> = ({
  dimension,
  dimensionGroups,
  treeData,
  visible,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableParents, setAvailableParents] = useState<ManageDimensionVo[]>([]);

  useEffect(() => {
    if (dimension) {
      form.setFieldsValue({
        dimensionGroupId: dimension.dimensionGroupId,
        mdName: dimension.mdName,
        area: dimension.area,
        parentId: dimension.parentId,
        orderNo: dimension.orderNo,
      });
      updateAvailableParents(dimension.dimensionGroupId);
    } else {
      form.resetFields();
      updateAvailableParents();
    }
  }, [dimension, form]);

  const updateAvailableParents = (dimensionGroupId?: string) => {
    if (!dimensionGroupId) {
      setAvailableParents([]);
      return;
    }

    // Flatten tree structure to get all dimensions
    const flattenTree = (items: TreeDataItem[]): ManageDimensionVo[] => {
      const result: ManageDimensionVo[] = [];
      items.forEach(item => {
        result.push({
          mdId: item.mdId,
          mdName: item.mdName,
          dimensionGroupId: item.dimensionGroupId,
          dimensionGroupName: item.dimensionGroupName,
          area: item.area,
          parentId: item.parentId,
          orderNo: item.orderNo
        });
        if (item.children && item.children.length > 0) {
          result.push(...flattenTree(item.children));
        }
      });
      return result;
    };

    const allDimensions = flattenTree(treeData);
    const parents = allDimensions.filter(p => p.dimensionGroupId === dimensionGroupId);

    // Filter out the current dimension when editing
    const filteredParents = dimension
      ? parents.filter(p => p.mdId !== dimension.mdId)
      : parents;
    setAvailableParents(filteredParents);
  };

  const handleDimensionGroupChange = (dimensionGroupId: string) => {
    form.setFieldsValue({ parentId: '' });
    updateAvailableParents(dimensionGroupId);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (dimension) {
        // Edit existing dimension
        const editData: ManageDimensionEditDto = {
          ...values,
          mdId: dimension.mdId,
        };
        await EquipmentService.editDimension(editData);
        message.success("编辑成功");
      } else {
        // Add new dimension
        await EquipmentService.addDimension(values);
        message.success("添加成功");
      }

      onSubmit();
    } catch (err) {
      console.error("操作失败:", err);
      message.error("操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          {dimension ? '编辑维度' : '添加维度'}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {dimension ? '更新' : '添加'}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          dimensionGroupId: dimension?.dimensionGroupId || '',
          mdName: dimension?.mdName || '',
          area: dimension?.area || null,
          parentId: dimension?.parentId || '',
          orderNo: dimension?.orderNo || null,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dimensionGroupId"
              label="维度组"
              rules={[{ required: true, message: '请选择维度组' }]}
            >
              <Select
                placeholder="请选择维度组"
                onChange={handleDimensionGroupChange}
              >
                {Object.entries(dimensionGroups).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="orderNo"
              label="排序号"
            >
              <InputNumber
                placeholder="请输入排序号"
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="mdName"
          label="维度名称"
          rules={[{ required: true, message: '请输入维度名称' }]}
        >
          <Input placeholder="请输入维度名称" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="area"
              label="面积（平方米）"
            >
              <InputNumber
                placeholder="请输入面积"
                min={0}
                step={0.01}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="parentId"
              label="父维度"
            >
              <Select
                placeholder="无（根维度）"
              >
                {availableParents.map(parent => (
                  <Option key={parent.mdId} value={parent.mdId}>
                    {parent.mdName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Alert
          message="提示"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>带 * 的字段为必填项</li>
              <li>根维度的父维度为空</li>
              <li>排序号用于控制显示顺序</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Form>
    </Modal>
  );
};

export default ManageDimensionFormModal;
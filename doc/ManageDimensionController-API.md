# ManageDimensionController API Documentation

## Overview

管理维度控制器，提供管理维度的增删改查操作，支持维度组功能。所有接口都需要租户登录认证。

## Base URL

```
/iot/manage/dimension
```

## Common Response Format

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## API Endpoints

### 1. 添加维度

**Endpoint:** `POST /add`
**Description:** 创建新的管理维度
**Authentication:** Required
**Permissions:** Tenant User

**Request Body:**

```json
{
  "dimensionGroupId": "string", // [Required] 维度组ID
  "mdName": "string", // [Required] 管理维度名称
  "area": "number", // [Optional] 面积（平方米）
  "parentId": "string", // [Optional] 父维度ID，根维度为空字符串
  "orderNo": "number" // [Optional] 排序号
}
```

**Validation Rules:**

- `dimensionGroupId`: 必须为有效的维度组 ID（从 /dimensionGroups 接口获取）
- `mdName`: 不能为空，长度限制取决于数据库配置

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": "操作成功"
}
```

**Error Examples:**

```json
{
  "code": 400,
  "message": "无效的维度组ID"
}
```

---

### 2. 删除维度

**Endpoint:** `DELETE /remove/{mdId}`
**Description:** 删除指定的管理维度
**Authentication:** Required
**Permissions:** Tenant User

**Path Parameters:**

- `mdId` (string, required): 管理维度 ID

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": "操作成功"
}
```

---

### 3. 编辑维度

**Endpoint:** `PUT /edit`
**Description:** 更新管理维度信息
**Authentication:** Required
**Permissions:** Tenant User

**Request Body:**

```json
{
  "mdId": "string", // [Required] 维度ID
  "dimensionGroupId": "string", // [Required] 维度组ID
  "mdName": "string", // [Required] 管理维度名称
  "area": "number", // [Optional] 面积（平方米）
  "parentId": "string", // [Optional] 父维度ID
  "orderNo": "number" // [Optional] 排序号
}
```

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": "操作成功"
}
```

---

### 4. 维度列表（分页）

**Endpoint:** `GET /list`
**Description:** 获取管理维度分页列表
**Authentication:** Required
**Permissions:** Tenant User

**Query Parameters:**

- `current` (number, optional): 当前页码，默认 1
- `size` (number, optional): 每页大小，默认 10

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "mdId": "string",
        "mdName": "string",
        "dimensionGroupId": "string",
        "dimensionGroupName": "string",
        "area": "number",
        "parentId": "string",
        "orderNo": "number"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

---

### 5. 树形列表

**Endpoint:** `GET /treeList`
**Description:** 获取管理维度的树形结构列表
**Authentication:** Required
**Permissions:** Tenant User

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "key": "mdId",
      "label": "mdName",
      "children": [],
      "mdId": "string",
      "mdName": "string",
      "dimensionGroupId": "string",
      "dimensionGroupName": "string",
      "area": "number",
      "parentId": "string",
      "orderNo": "number"
    }
  ]
}
```

---

### 6. 编辑详情

**Endpoint:** `GET /edit/detail/{mdId}`
**Description:** 获取指定维度的详细信息
**Authentication:** Required
**Permissions:** Tenant User

**Path Parameters:**

- `mdId` (string, required): 管理维度 ID

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "mdId": "string",
    "mdName": "string",
    "dimensionGroupId": "string",
    "dimensionGroupName": "string",
    "area": "number",
    "parentId": "string",
    "orderNo": "number"
  }
}
```

---

## 维度组相关接口

### 7. 获取可用维度组

**Endpoint:** `GET /dimensionGroups`
**Description:** 获取所有可用的维度组列表
**Authentication:** Required
**Permissions:** Tenant User

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "region": "区域",
    "department": "部门",
    "format": "业态",
    "circuit": "回路",
    "machine": "设备"
  }
}
```

**Usage:** 此接口用于获取创建/编辑维度时可选的维度组列表，key 为维度组 ID，value 为维度组名称。

---

### 8. 根据维度组获取维度列表

**Endpoint:** `GET /byDimensionGroup`
**Description:** 根据维度组 ID 获取管理维度列表
**Authentication:** Required
**Permissions:** Tenant User

**Query Parameters:**

- `dimensionGroupId` (string, optional): 维度组 ID，为空时返回所有维度

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "mdId": "string",
      "mdName": "string",
      "dimensionGroupId": "string",
      "dimensionGroupName": "string",
      "area": "number",
      "parentId": "string",
      "orderNo": "number"
    }
  ]
}
```

---

### 9. 获取根维度列表

**Endpoint:** `GET /rootDimensions`
**Description:** 获取租户下的所有根管理维度（parentId 为空的维度）
**Authentication:** Required
**Permissions:** Tenant User

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "mdId": "string",
      "mdName": "string",
      "dimensionGroupId": "string",
      "dimensionGroupName": "string",
      "area": "number",
      "parentId": "",
      "orderNo": "number"
    }
  ]
}
```

---

### 10. 获取指定维度组的根维度

**Endpoint:** `GET /rootDimensionByGroup`
**Description:** 获取指定维度组的根管理维度
**Authentication:** Required
**Permissions:** Tenant User

**Query Parameters:**

- `dimensionGroupId` (string, required): 维度组 ID

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "mdId": "string",
    "mdName": "全厂",
    "dimensionGroupId": "region",
    "dimensionGroupName": "区域",
    "area": null,
    "parentId": "",
    "orderNo": 1
  }
}
```

---

### 11. 创建或获取根维度

**Endpoint:** `POST /createOrGetRootDimension`
**Description:** 创建或获取指定维度组的根管理维度
**Authentication:** Required
**Permissions:** Tenant User

**Query Parameters:**

- `dimensionGroupId` (string, required): 维度组 ID

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "mdId": "string",
    "mdName": "全厂",
    "dimensionGroupId": "region",
    "dimensionGroupName": "区域",
    "area": null,
    "parentId": "",
    "orderNo": 1
  }
}
```

**Behavior:**

- 如果指定维度组的根维度已存在，返回现有维度
- 如果不存在，自动创建新的根维度（名称为"全厂"）
- 主要用于能源分类启用时自动创建关口设备所需的管理维度

---

### 12. 根据维度组获取树形列表

**Endpoint:** `GET /treeListByGroup`
**Description:** 根据维度组 ID 获取树形结构列表
**Authentication:** Required
**Permissions:** Tenant User

**Query Parameters:**

- `dimensionGroupId` (string, optional): 维度组 ID，为空时返回所有维度

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "key": "mdId",
      "label": "mdName",
      "children": [],
      "mdId": "string",
      "mdName": "string",
      "dimensionGroupId": "string",
      "dimensionGroupName": "string",
      "area": "number",
      "parentId": "string",
      "orderNo": "number"
    }
  ]
}
```

---

## Data Models

### ManageDimensionVo

```typescript
interface ManageDimensionVo {
  mdId: string; // 维度ID
  mdName: string; // 维度名称
  dimensionGroupId: string; // 维度组ID
  dimensionGroupName: string; // 维度组名称（自动填充）
  area?: number; // 面积（平方米，可选）
  parentId: string; // 父维度ID
  orderNo?: number; // 排序号（可选）
}
```

### ManageDimensionAddDto

```typescript
interface ManageDimensionAddDto {
  dimensionGroupId: string; // [Required] 维度组ID
  mdName: string; // [Required] 维度名称
  area?: number; // [Optional] 面积
  parentId?: string; // [Optional] 父维度ID
  orderNo?: number; // [Optional] 排序号
}
```

### ManageDimensionEditDto

```typescript
interface ManageDimensionEditDto extends ManageDimensionAddDto {
  mdId: string; // [Required] 维度ID
}
```

## Usage Examples

### Example 1: 创建新的管理维度

```javascript
// 1. 首先获取可用维度组
const dimensionGroups = await fetch("/iot/manage/dimension/dimensionGroups");
// 返回: { region: "区域", department: "部门", ... }

// 2. 创建区域维度下的新维度
const newDimension = {
  dimensionGroupId: "region",
  mdName: "生产车间",
  area: 1000,
  parentId: "", // 根维度
  orderNo: 1,
};

const response = await fetch("/iot/manage/dimension/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newDimension),
});
```

### Example 2: 获取树形结构数据

```javascript
// 获取所有维度的树形结构
const treeData = await fetch("/iot/manage/dimension/treeList");

// 或者获取特定维度组的树形结构
const regionTreeData = await fetch(
  "/iot/manage/dimension/treeListByGroup?dimensionGroupId=region"
);

// 树形数据格式适合用于树形组件如 Ant Design Tree, Element UI Tree 等
```

### Example 3: 创建根维度

```javascript
// 为区域维度组创建根维度（通常由系统自动调用）
const rootDimension = await fetch(
  "/iot/manage/dimension/createOrGetRootDimension?dimensionGroupId=region",
  {
    method: "POST",
  }
);

// 返回的区域根维度通常名称为"全厂"
```

## Error Handling

### Common Error Codes

- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `500`: 服务器内部错误

### Error Response Format

```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null
}
```

## Notes for Frontend Developers

1. **维度组验证**: 在创建/编辑维度时，确保 `dimensionGroupId` 来自 `/dimensionGroups` 接口返回的有效值

2. **自动填充字段**: `dimensionGroupName` 字段由后端自动填充，前端无需设置

3. **根维度处理**: 根维度的 `parentId` 为空字符串 `""`

4. **树形结构**: 使用 `treeList` 或 `treeListByGroup` 接口获取的数据可以直接用于前端树形组件

5. **分页处理**: 列表接口支持分页，前端需要处理分页参数和分页数据

6. **权限控制**: 所有接口都需要租户用户权限，确保在用户已登录的状态下调用

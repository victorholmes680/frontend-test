export interface Equipment {
  equipId: string;
  equipNo: string;
  equipName: string;
  parentEquipId: string;
  unitId: string;
  manufacturer: string;
  equipTypeId: string;
  equipStatus: string;
  equipModel: string;
  purchaseDate: string;
  investmentMoney: number;
  deptId: string;
  tenantId: string;
  depreciationMethod: string;
  originValueOfAssets: number;
  expectedResidualValue: number;
  totalDepreciationMonths: number;
  depreciatedMonths: number;
  equipTypeName: string;
  onlineFlag: boolean;
  
  // Legacy fields for compatibility
  id: string;
  name: string;
  type: string;
  originalValue: number;
  currentValue: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface EquipmentInvestment {
  id: string;
  equipmentId: string;
  investmentValue: number;
  investmentRemainValue: number;
  investmentMonth: string;
  investmentDescription: string;
  // amount: number;
  // investmentDate: string;
  // description: string;
  type: 'purchase' | 'upgrade' | 'maintenance';
}

export interface EquipmentInvestmentVo {
  id: string;
  equipmentId: string;
  equipmentName: string;
  investmentValue: number;
  investmentRemainValue: number;
  investmentMonth: string;
  investmentDescription: string;
  amount: number;
  investmentDate: string;
  description: string;
  type: 'purchase' | 'upgrade' | 'maintenance';
}

export interface EquipmentDepreciation {
  id: string;
  equipmentId: string;
  depreciationAmount: number;
  currentValue: number;
  depreciationDate: string;
  method: 'straight-line' | 'declining-balance' | 'units-of-production';
}

// ManageDimension types
export interface ManageDimensionVo {
  mdId: string;
  mdName: string;
  dimensionGroupId: string;
  dimensionGroupName: string;
  area?: number;
  parentId: string;
  orderNo?: number;
}

export interface ManageDimensionAddDto {
  dimensionGroupId: string;
  mdName: string;
  area?: number;
  parentId?: string;
  orderNo?: number;
}

export interface ManageDimensionEditDto extends ManageDimensionAddDto {
  mdId: string;
}

export interface DimensionGroups {
  [key: string]: string;
}

export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface TreeDataItem {
  key: string;
  label: string;
  children?: TreeDataItem[];
  mdId: string;
  mdName: string;
  dimensionGroupId: string;
  dimensionGroupName: string;
  area?: number;
  parentId: string;
  orderNo?: number;
}
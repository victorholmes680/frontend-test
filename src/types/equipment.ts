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
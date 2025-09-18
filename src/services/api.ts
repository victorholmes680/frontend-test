import {
  Equipment,
  EquipmentInvestment,
  EquipmentInvestmentVo,
  EquipmentDepreciation,
  ManageDimensionVo,
  ManageDimensionAddDto,
  ManageDimensionEditDto,
  DimensionGroups,
  PageResponse,
  TreeDataItem
} from '../types/equipment';
import { authService } from './auth';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = authService.getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.message || 'API request failed', response.status);
  }

  return response.json();
}

export class EquipmentService {
  // Equipment endpoints
  static async getEquipmentList(pageNo: number = 1, pageSize: number = 15): Promise<{data: Equipment[], pagination: {total: number, size: number, current: number, pages: number}}> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/tree/list?pageNo=${pageNo}&pageSize=${pageSize}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    // Extract equipment data from the nested response structure
    if (response && response.data) {
      const equipmentData = response.data.records.map((record: any) => {
        const apiData = record.data;
        return {
          ...apiData,
          // Map legacy fields for compatibility
          id: apiData.equipId,
          name: apiData.equipName,
          type: apiData.equipTypeName,
          originalValue: apiData.originValueOfAssets,
          currentValue: apiData.originValueOfAssets - (apiData.investmentMoney || 0),
          status: apiData.equipStatus === '1' ? 'active' : 'inactive'
        };
      });
      
      return {
        data: equipmentData,
        pagination: {
          total: response.data.total,
          size: response.data.size,
          current: response.data.current,
          pages: response.data.pages
        }
      };
    }
    
    return {
      data: [],
      pagination: { total: 0, size: pageSize, current: pageNo, pages: 0 }
    };
  }

  static async getEquipmentById(id: string): Promise<Equipment> {
    return apiRequest<Equipment>(`${API_BASE_URL}/equipment/${id}`);
  }

  static async createEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    return apiRequest<Equipment>(`${API_BASE_URL}/equipment`, {
      method: 'POST',
      body: JSON.stringify(equipment)
    });
  }

  static async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
    return apiRequest<Equipment>(`${API_BASE_URL}/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipment)
    });
  }

  // Investment endpoints
  static async getInvestmentsByEquipment(equipmentId: string): Promise<EquipmentInvestment[]> {
    return apiRequest<EquipmentInvestment[]>(`${API_BASE_URL}/equipment/${equipmentId}/investments`);
  }

  static async createInvestment(investment: Omit<EquipmentInvestment, 'id'>): Promise<EquipmentInvestment> {
    // Map the frontend data structure to the API expected format
    const requestBody = {
      equipmentId: investment.equipmentId,
      investmentValue: investment.investmentValue,
      investmentRemainValue: investment.investmentRemainValue,
      investmentMonth: investment.investmentMonth,
      investmentDescription: investment.investmentDescription
    };
    
    return apiRequest<EquipmentInvestment>(`${API_BASE_URL}/machine/equipment/additional-investment/add`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
  }

  static async updateInvestment(id: string, investment: Partial<EquipmentInvestment>): Promise<EquipmentInvestment> {
    // Map the frontend data structure to the API expected format for editing
    const requestBody = {
      id: id,
      investmentMonth: investment.investmentMonth,
      investmentValue: investment.investmentValue,
      investmentRemainValue: investment.investmentRemainValue,
      investmentDescription: investment.investmentDescription
    };
    
    return apiRequest<EquipmentInvestment>(`${API_BASE_URL}/machine/equipment/additional-investment/edit`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    });
  }

  static async getInvestmentList(pageNo: number = 1, pageSize: number = 15): Promise<{data: EquipmentInvestmentVo[], pagination: {total: number, size: number, current: number, pages: number}}> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/additional-investment/list?pageNo=${pageNo}&pageSize=${pageSize}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    // Extract investment data from the nested response structure
    if (response && response.data) {
      const investmentData = response.data.records.map((record: any) => {
        const apiData = record;
        return {
          ...apiData,
          // Map legacy fields for compatibility
          id: apiData.id,
          equipmentId: apiData.equipmentId,
          equipmentName: apiData.equipmentName,
          investmentValue: apiData.investmentValue,
          investmentRemainValue: apiData.investmentRemainValue,
          investmentMonths: apiData.investmentMonths,
          investmentDescription: apiData.investmentDescription,
          amount: apiData.amount,
          investmentDate: apiData.investmentDate,
          type: apiData.type
        };
      });
      
      return {
        data: investmentData,
        pagination: {
          total: response.data.total,
          size: response.data.size,
          current: response.data.current,
          pages: response.data.pages
        }
      };
    }
    
    return {
      data: [],
      pagination: { total: 0, size: pageSize, current: pageNo, pages: 0 }
    };
  }

  static async deleteInvestment(id: string): Promise<void> {
    await apiRequest<void>(`${API_BASE_URL}/machine/equipment/additional-investment/remove/${id}`, {
      method: 'DELETE'
    });
  }

  // Depreciation endpoints
  static async getLatestDepreciatedMonth(equipmentId: string): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/latestDepreciatedMonth/${equipmentId}`);
    return response.data;
  }

  static async processDepreciation(targetMonth: string): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/process?targetMonth=${targetMonth}`, {
      method: 'POST'
    });
    return response.data;
  }

  static async cancelDepreciation(targetMonth: string): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/cancel?targetMonth=${targetMonth}`, {
      method: 'POST'
    });
    return response.data;
  }

  static async getDepreciationReport(targetMonth?: string, departmentId?: string, equipmentTypeId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (targetMonth) params.append('targetMonth', targetMonth);
    if (departmentId) params.append('departmentId', departmentId);
    if (equipmentTypeId) params.append('equipmentTypeId', equipmentTypeId);
    
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/report?${params.toString()}`);
    return response.data;
  }

  static async getCurrentValueReport(equipmentCode?: string, equipmentName?: string, equipmentTypeId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (equipmentCode) params.append('equipmentCode', equipmentCode);
    if (equipmentName) params.append('equipmentName', equipmentName);
    if (equipmentTypeId) params.append('equipmentTypeId', equipmentTypeId);
    
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/report/currentValue?${params.toString()}`);
    return response.data;
  }

  static async getEquipmentCurrentValue(equipmentId: string): Promise<any> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/depreciation/currentValue/${equipmentId}`);
    return response.data;
  }

  // Legacy depreciation endpoints (keeping for backward compatibility)
  static async getDepreciationByEquipment(equipmentId: string): Promise<EquipmentDepreciation[]> {
    return apiRequest<EquipmentDepreciation[]>(`${API_BASE_URL}/equipment/${equipmentId}/depreciation`);
  }

  static async createDepreciation(depreciation: Omit<EquipmentDepreciation, 'id'>): Promise<EquipmentDepreciation> {
    return apiRequest<EquipmentDepreciation>(`${API_BASE_URL}/equipment-depreciation`, {
      method: 'POST',
      body: JSON.stringify(depreciation)
    });
  }

  static async calculateDepreciation(equipmentId: string, method: string): Promise<EquipmentDepreciation[]> {
    return apiRequest<EquipmentDepreciation[]>(`${API_BASE_URL}/equipment-depreciation/calculate/${equipmentId}?method=${method}`);
  }

  // ManageDimension CRUD endpoints
  static async addDimension(dimension: ManageDimensionAddDto): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/add`, {
      method: 'POST',
      body: JSON.stringify(dimension)
    });
    return response.data;
  }

  static async removeDimension(mdId: string): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/remove/${mdId}`, {
      method: 'DELETE'
    });
    return response.data;
  }

  static async editDimension(dimension: ManageDimensionEditDto): Promise<string> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/edit`, {
      method: 'PUT',
      body: JSON.stringify(dimension)
    });
    return response.data;
  }

  static async getDimensionTreeList(): Promise<any[]> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/treeList`);
    return response.data;
  }

  static async getDimensionTreeListByGroup(): Promise<any[]> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/treeListByGroup`);
    return response.data;
  }

  static async getDimensionDetail(mdId: string): Promise<ManageDimensionVo> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/edit/detail/${mdId}`);
    return response.data;
  }

  static async getDimensionGroups(): Promise<DimensionGroups> {
    const response = await apiRequest<any>(`${API_BASE_URL}/energy/iot/manage/dimension/dimensionGroups`);
    return response.data;
  }
}
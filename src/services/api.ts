import { Equipment, EquipmentInvestment,EquipmentInvestmentVo, EquipmentDepreciation } from '../types/equipment';
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
  static async getEquipmentList(): Promise<Equipment[]> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/tree/list?pageNo=1&pageSize=15`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    // Extract equipment data from the nested response structure
    if (response && response.data && response.data.records) {
      return response.data.records.map((record: any) => {
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
    }
    
    return [];
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
    return apiRequest<EquipmentInvestment>(`${API_BASE_URL}/equipment-investment`, {
      method: 'POST',
      body: JSON.stringify(investment)
    });
  }

  static async getInvestmentList(): Promise<EquipmentInvestmentVo[]> {
    const response = await apiRequest<any>(`${API_BASE_URL}/machine/equipment/additional-investment/list?pageNo=1&pageSize=15`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    // Extract investment data from the nested response structure
    if (response && response.data && response.data.records) {
      return response.data.records.map((record: any) => {
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
    }
    
    return [];
  }

  static async deleteInvestment(id: string): Promise<void> {
    await apiRequest<void>(`${API_BASE_URL}/machine/equipment/additional-investment/remove/${id}`, {
      method: 'DELETE'
    });
  }

  // Depreciation endpoints
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
}
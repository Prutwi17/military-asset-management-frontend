export type Role = 'ADMIN' | 'BASE_COMMANDER' | 'LOGISTICS_OFFICER';

export type AssetCategory =
  | 'VEHICLE'
  | 'WEAPON'
  | 'AMMUNITION'
  | 'COMMUNICATION'
  | 'IT_EQUIPMENT'
  | 'OTHER';

export type AssetStatus =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'DEPLOYED'
  | 'DECOMMISSIONED';

export interface Base {
  id: number;
  name: string;
  code: string;
  location?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  rank: string;
  role: Role;
  base?: Base | null;
  active: boolean;
}

export interface Asset {
  id: number;
  assetCode: string;
  name: string;
  category: AssetCategory;
  equipmentType?: string;
  serialNumber?: string;
  quantity: number;
  unit: string;
  status: AssetStatus;
  baseId: number;
  baseName: string;
  baseCode: string;
  location?: string;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  lastMaintenanceDate?: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: number;
  referenceNumber: string;
  assetId?: number;
  assetName: string;
  assetCode?: string;
  category: AssetCategory;
  equipmentType?: string;
  baseId: number;
  baseName: string;
  baseCode: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalAmount?: number;
  purchaseDate: string;
  supplier: string;
  notes?: string;
  createdBy: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface CreateAssetInput {
  assetCode?: string;
  name: string;
  category: AssetCategory;
  equipmentType?: string;
  serialNumber?: string;
  quantity: number;
  unit?: string;
  status: AssetStatus;
  baseId: number;
  location?: string;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  lastMaintenanceDate?: string;
  imageUrl?: string;
}

export interface CreatePurchaseInput {
  referenceNumber?: string;
  assetId?: number;
  assetName: string;
  category: AssetCategory;
  equipmentType?: string;
  baseId: number;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  totalAmount?: number;
  purchaseDate: string;
  supplier: string;
  notes?: string;
}

export type TransferStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BaseSummary {
  id: number;
  name: string;
  code: string;
  location?: string;
}

export interface Transfer {
  id: number;
  referenceNumber: string;
  assetId?: number;
  assetCode?: string;
  assetName: string;
  category: AssetCategory;
  equipmentType?: string;
  quantity: number;
  unit: string;
  sourceBase: BaseSummary;
  destinationBase: BaseSummary;
  transferDate: string;
  status: TransferStatus;
  requestedBy: string;
  requestedByUserId?: number;
  approvedBy?: string;
  approvedByUserId?: number;
  reason: string;
  notes?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CreateTransferInput {
  assetId: number;
  destinationBaseId: number;
  quantity: number;
  transferDate?: string;
  reason: string;
  notes?: string;
  referenceNumber?: string;
}

export type AssignmentStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Assignment {
  id: number;
  referenceNumber: string;
  assetId?: number;
  assetCode?: string;
  assetName: string;
  category: AssetCategory;
  base: BaseSummary;
  personnelName: string;
  personnelRank?: string;
  personnelId: string;
  unitDivision?: string;
  quantity: number;
  unit: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssignmentStatus;
  assignedBy: string;
  returnCondition?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssignmentInput {
  assetId: number;
  baseId: number;
  personnelName: string;
  personnelRank?: string;
  personnelId: string;
  unitDivision?: string;
  quantity: number;
  assignmentDate?: string;
  expectedReturnDate?: string;
  notes?: string;
  referenceNumber?: string;
}

export interface ReturnAssignmentInput {
  returnDate?: string;
  returnCondition?: string;
  notes?: string;
}

export interface Expenditure {
  id: number;
  referenceNumber: string;
  assetId?: number;
  assetCode?: string;
  assetName: string;
  category: AssetCategory;
  equipmentType?: string;
  base: BaseSummary;
  quantity: number;
  unit: string;
  personnelOrUnit: string;
  expenditureDate: string;
  reason: string;
  reference?: string;
  recordedBy: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateExpenditureInput {
  assetId: number;
  baseId: number;
  quantity: number;
  unit?: string;
  personnelOrUnit: string;
  expenditureDate?: string;
  reason: string;
  reference?: string;
  notes?: string;
  referenceNumber?: string;
}

export interface AuditLog {
  id: number;
  username: string;
  userFullName: string;
  role: Role;
  action: string;
  entityName: string;
  entityId?: number;
  details: string;
  status: string;
  ipAddress?: string;
  timestamp: string;
}

export interface StatusCount {
  status: AssetStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CategoryDistribution {
  category: AssetCategory;
  label: string;
  quantity: number;
  itemCount: number;
  percentage: number;
  color: string;
}

export interface DashboardStats {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  purchasesQuantity: number;
  transfersInQuantity: number;
  transfersOutQuantity: number;
  assignedQuantity: number;
  expendedQuantity: number;
  totalTrackedAssets: number;
  totalCurrentQuantity: number;
  readinessRate: number;
  baseId?: number;
  baseName: string;
  startDate: string;
  endDate: string;
  statusBreakdown: StatusCount[];
  categoryDistribution: CategoryDistribution[];
  recentActivities: AuditLog[];
}

export interface NetMovementItem {
  id: number;
  date: string;
  assetName: string;
  assetCode?: string;
  category: AssetCategory;
  quantity: number;
  unit: string;
  baseId: number;
  baseName: string;
  partnerBaseName?: string;
  reference: string;
  transactionType: 'PURCHASE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  details?: string;
}

export interface NetMovementResponse {
  totalPurchases: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
  netMovement: number;
  baseId?: number;
  baseName: string;
  startDate: string;
  endDate: string;
  items: NetMovementItem[];
}

export interface BaseInventorySummary {
  baseId: number;
  baseName: string;
  baseCode: string;
  location?: string;
  totalAssetsCount: number;
  totalQuantity: number;
  totalValuation: number;
  activeAssignments: number;
}

export interface EquipmentDistributionSummary {
  category: AssetCategory;
  categoryName: string;
  totalQuantity: number;
  totalAssetTypes: number;
  totalValuation: number;
  percentage: number;
}

export interface AssetUtilizationSummary {
  totalAssetTypes: number;
  totalQuantity: number;
  availableQuantity: number;
  inUseQuantity: number;
  maintenanceQuantity: number;
  deployedQuantity: number;
  decommissionedQuantity: number;
  combatReadinessRate: number;
}

export interface FullReportsResponse {
  utilization: AssetUtilizationSummary;
  baseInventory: BaseInventorySummary[];
  equipmentDistribution: EquipmentDistributionSummary[];
  purchaseHistory: Purchase[];
  transferHistory: Transfer[];
  assignmentHistory: Assignment[];
  expenditureHistory: Expenditure[];
}

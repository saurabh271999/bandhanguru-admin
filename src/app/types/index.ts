// Common types for the application

export interface BaseRecord {
    id: string;
    _id?: string;
    [key: string]: unknown;
}

export interface User extends BaseRecord {
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

export interface Client extends BaseRecord {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    createdAt: string;
}

export interface Installer extends BaseRecord {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    status: string;
    createdAt: string;
}

export interface Project extends BaseRecord {
    name: string;
    client: string;
    installer: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface Complaint extends BaseRecord {
    title: string;
    description: string;
    client: string;
    status: string;
    priority: string;
    createdAt: string;
}

export interface Vendor extends BaseRecord {
    vendorCategory: string;
    vendorName: string;
    vendorEmail: string;
    vendorPhone: string;
    vendorAddress: string;
    vendorCity: string;
    vendorState: string;
    vendorZip: string;
    vendorSubscription: string;
    vendorSubscriptionStartDate: string;
    vendorSubscriptionEndDate: string;
    vendorSubscriptionStatus: string;
    vendorSubscriptionType: string;
    vendorSubscriptionAmount: string;
}

export interface Category extends BaseRecord {
    name: string;
    description: string;
    status: string;
}

export interface Role extends BaseRecord {
    name: string;
    permissions: string[];
    description: string;
}

// Table related types
export interface Column {
    key: string;
    title: string;
    dataIndex: string;
    render?: (text: string, record: BaseRecord, index: number) => React.ReactNode;
    width?: string;
    sortable?: boolean;
    type?: 'text' | 'document' | 'profileImage' | 'date' | 'status';
    fileNameIndex?: string; // For document columns, specifies which field contains the filename
    documentTypeIndex?: string; // For document columns, specifies which field contains the document type
    uploadDateIndex?: string; // For document columns, specifies which field contains the upload date
    fileSizeIndex?: string; // For document columns, specifies which field contains the file size
}

export interface Filter {
    key: string;
    label: string;
    type: "input" | "select" | "date";
    placeholder?: string;
    options?: { value: string; label: string }[];
    width?: string;
}

export interface TableRecord extends BaseRecord {
    [key: string]: unknown;
}

// API response types
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    total?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Form types
export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "number" | "select" | "textarea" | "date";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: RegExp;
        message?: string;
    };
}

// Permission types
export interface Permission {
    module: string;
    actions: string[];
}

export interface UserPermissions {
    userId: string;
    permissions: Permission[];
}

// Event handlers
export type TableActionHandler = (record: TableRecord) => void;
export type SearchHandler = (value: string) => void;
export type FilterHandler = (filters: Record<string, string | number>) => void;
export type ClearFilters = () => void;
export type PageChangeHandler = (page: number, pageSize: number) => void;
export type SelectionChangeHandler = (selectedKeys: string[]) => void; 
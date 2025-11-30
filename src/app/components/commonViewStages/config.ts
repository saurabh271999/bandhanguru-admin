// src/config/config.ts

export interface MMSField {
  key: string;
  label: string;
  show: boolean;
  type?: "text" | "date" | "document" | "dropdown" | "time";
}

export interface CardConfig {
  title: string;
  fields: MMSField[];
}

export const cardsConfig: CardConfig[] = [
  {
    title: "MMS",
    fields: [
      { key: "mmsNumber", label: "MMS Number", show: true, type: "dropdown" },
      { key: "date", label: "Date", show: true, type: "date" },
      { key: "document", label: "Document", show: true, type: "document" },
      { key: "startTime", label: "Start Time", show: true, type: "time" },
      { key: "endTime", label: "End Time", show: true, type: "time" },
      // { key: "preQualityReport", label: "Pre Quality Report", show: true, type: "document" },
      // { key: "dispatchNumber", label: "Dispatch Number", show: true, type: "text" },
      // { key: "nameOfInstaller", label: "Name of Installer", show: true, type: "text" },
      // { key: "fixingStartDate", label: "Fixing Start Date", show: true, type: "date" },
      // { key: "targetDate", label: "Target Date", show: true, type: "date" },
      // { key: "completionDate", label: "Completion Date", show: true, type: "date" },
      // { key: "manpowerUsed", label: "No. of Manpower Used", show: true, type: "text" },
      // { key: "phrFile", label: "PHR File", show: true, type: "document" },
      // { key: "chrFile", label: "CHR File", show: true, type: "document" },
    ]
  },

  {
    title: "BOM",
    fields: [
      { key: "mmsNumber", label: "MMS Number", show: true, type: "dropdown" },
      { key: "document", label: "Document", show: true, type: "document" },
      { key: "startTime", label: "Start Time", show: true, type: "time" },
      { key: "endTime", label: "End Time", show: true, type: "time" },
      { key: "bomNumber", label: "BOM Number", show: true, type: "text" },
      { key: "material", label: "Material", show: true, type: "text" },
      { key: "quantity", label: "Quantity", show: true, type: "text" },
      { key: "status", label: "Status", show: true, type: "text" },
    ]
  },

  {
    title: "Production",
    fields: [
      { key: "mmsNumber", label: "MMS Number", show: true, type: "dropdown" },
      { key: "document", label: "Document", show: true, type: "document" },
      { key: "startTime", label: "Start Time", show: true, type: "time" },
      { key: "endTime", label: "End Time", show: true, type: "time" },
      { key: "productionId", label: "Production ID", show: true, type: "text" },
      { key: "product", label: "Product", show: true, type: "text" },
      { key: "quantity", label: "Quantity", show: true, type: "text" },
      { key: "startDate", label: "Start Date", show: true, type: "date" },
      { key: "endDate", label: "End Date", show: true, type: "date" },
      { key: "status", label: "Status", show: true, type: "text" },
    ]
  },

  {
    title: "Dispatch",
    fields: [
      { key: "dispatchId", label: "Dispatch ID", show: true, type: "text" },
      { key: "vehicleNumber", label: "Vehicle Number", show: true, type: "text" },
      { key: "driverName", label: "Driver Name", show: true, type: "text" },
      { key: "dispatchDate", label: "Dispatch Date", show: true, type: "date" },
      { key: "expectedDelivery", label: "Expected Delivery", show: true, type: "date" },
    ]
  },

  {
    title: "Ready to Dispatch",
    fields: [
      { key: "readyId", label: "Ready ID", show: true, type: "text" },
      { key: "warehouse", label: "Warehouse", show: true, type: "text" },
      { key: "packedItems", label: "Packed Items", show: true, type: "text" },
      { key: "qcStatus", label: "QC Status", show: true, type: "text" },
    ]
  },

  {
    title: "Fixing Team Info",
    fields: [
      { key: "teamId", label: "Team ID", show: true, type: "text" },
      { key: "teamLead", label: "Team Lead", show: true, type: "text" },
      { key: "members", label: "Members", show: true, type: "text" },
      { key: "contactNumber", label: "Contact Number", show: true, type: "text" },
    ]
  },

  {
    title: "Installation Complete",
    fields: [
      { key: "installationId", label: "Installation ID", show: true, type: "text" },
      { key: "siteName", label: "Site Name", show: true, type: "text" },
      { key: "completionDate", label: "Completion Date", show: true, type: "date" },
      { key: "remarks", label: "Remarks", show: true, type: "text" },
      { key: "verifiedBy", label: "Verified By", show: true, type: "text" },
    ]
  },
];

// Legacy config for backward compatibility
export const legacyCardsConfig = {
  MMS: {
    mmsNumber: { label: "MMS Number", show: true },
    date: { label: "Date", show: true },
    document: { label: "Document", show: true },
    startTime: { label: "Start Time", show: true },
    endTime: { label: "End Time", show: true },
    preQualityReport: { label: "Pre Quality Report", show: true },
    dispatchNumber: { label: "Dispatch Number", show: true },
    nameOfInstaller: { label: "Name of Installer", show: true },
    fixingStartDate: { label: "Fixing Start Date", show: true },
    targetDate: { label: "Target Date", show: true },
    completionDate: { label: "Completion Date", show: true },
    manpowerUsed: { label: "No. of Manpower Used", show: true },
    phrFile: { label: "PHR File", show: true },
    chrFile: { label: "CHR File", show: true },
  },

  BOM: {
    bomNumber: { label: "BOM Number", show: true },
    material: { label: "Material", show: true },
    quantity: { label: "Quantity", show: true },
    status: { label: "Status", show: true },
  },

  PRODUCTION: {
    productionId: { label: "Production ID", show: true },
    product: { label: "Product", show: true },
    quantity: { label: "Quantity", show: true },
    startDate: { label: "Start Date", show: true },
    endDate: { label: "End Date", show: true },
    status: { label: "Status", show: true },
  },

  DISPATCH: {
    dispatchId: { label: "Dispatch ID", show: true },
    vehicleNumber: { label: "Vehicle Number", show: true },
    driverName: { label: "Driver Name", show: true },
    dispatchDate: { label: "Dispatch Date", show: true },
    expectedDelivery: { label: "Expected Delivery", show: true },
  },

  READY_TO_DISPATCH: {
    readyId: { label: "Ready ID", show: true },
    warehouse: { label: "Warehouse", show: true },
    packedItems: { label: "Packed Items", show: true },
    qcStatus: { label: "QC Status", show: true },
  },

  FIXING_TEAM_INFO: {
    teamId: { label: "Team ID", show: true },
    teamLead: { label: "Team Lead", show: true },
    members: { label: "Members", show: true },
    contactNumber: { label: "Contact Number", show: true },
  },

  INSTALLATION_COMPLETE: {
    installationId: { label: "Installation ID", show: true },
    siteName: { label: "Site Name", show: true },
    completionDate: { label: "Completion Date", show: true },
    remarks: { label: "Remarks", show: true },
    verifiedBy: { label: "Verified By", show: true },
  },
};

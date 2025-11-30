# How Active/Inactive Approved Vendors Work

## Overview
This document explains how the active/inactive toggle functionality works for approved vendors in the subscribed vendors table.

## Data Flow

### 1. Data Loading
- **Endpoint**: `/api/v1/subscriptions/paid` (paginated)
- **Response Structure**: Contains subscriptions with nested `vendorId` objects
- **Transformation**: Vendor data is spread at root level for easier access
  ```typescript
  {
    ...vendor,           // All vendor fields including isActive
    _id: vendor._id,
    subscription: {...}, // Full subscription object
    status: "active",    // Subscription status (different from isActive)
    planName: "...",
    // ... other subscription fields
  }
  ```

### 2. Two Different Status Fields

⚠️ **Important**: There are TWO different status concepts:

#### A. Vendor Active/Inactive (`isActive`)
- **Type**: Boolean (`true` or `false`)
- **Purpose**: Controls whether the vendor account is active
- **Location**: On the vendor object itself (`vendor.isActive`)
- **Toggle Endpoint**: `PATCH /api/v1/toggle/vendor/${vendorId}`
- **Payload**: `{ isActive: !currentIsActive }`

#### B. Subscription Status (`status`)
- **Type**: String (`"active"`, `"pending"`, `"expired"`, etc.)
- **Purpose**: Indicates the subscription plan status
- **Location**: On the subscription object (`subscription.status`)
- **Display**: Shown in the "Status" column of the table (line 275-296)

### 3. Toggle Mechanism

#### Step 1: User Interaction
1. User clicks the Switch toggle in the Actions column
2. CommonTable's `handleStatusChange` is triggered
3. A confirmation modal (`ActiveModal`) is shown

#### Step 2: Confirmation
1. User confirms the toggle action
2. `handleActiveConfirm` calls `onActive(recordToActive)`
3. This triggers `tableOps.onActive` which is `handleToggleActive` from `useTableOperations`

#### Step 3: API Call
```javascript
// From useTableOperations.js (lines 371-396)
const handleToggleActive = async (record) => {
  const id = record.id || record._id;
  
  // PATCH request to toggle vendor active status
  await patchQuery({
    url: `/api/v1/toggle/vendor/${id}`,
    patchData: {
      isActive: !record?.isActive
    }
  });
  
  // Refresh table data
  stableFetchData();
};
```

#### Step 4: Refresh
- After successful toggle, `stableFetchData()` is called
- ⚠️ **Issue**: `stableFetchData()` fetches from `apiUrls.getAllVendorsAll`, not from the subscription endpoint
- This means the table may not show updated data after toggling

## Current Implementation Details

### File: `src/app/dashboard/subscribedvendors/page.tsx`

1. **Table Operations Setup** (line 190-194):
   ```typescript
   const tableOps = useTableOperations({
     apiUrl: apiUrls.getAllVendorsAll,  // Used for refresh after toggle
     pageSize: 10,
     activeApiUrl: apiUrls.toggleActiveStatus("vendor"), // /api/v1/toggle/vendor
   });
   ```

2. **Data Source** (line 54-155):
   - Custom data loading from `/api/v1/subscriptions/paid`
   - Not using `tableOps.data` (which comes from `getAllVendorsAll`)
   - Uses custom `subscribedVendors` and `filteredVendors` state

3. **Active Toggle** (line 554):
   ```typescript
   onActive={tableOps.onActive}  // Passes toggle function to CommonTable
   ```

4. **Switch Display**:
   - CommonTable automatically shows a Switch when `onActive` prop is provided
   - Switch state is controlled by `record?.isActive`
   - Switch label: "Activate" or "Deactivate" based on current state

### File: `src/app/components/CommonTable.tsx`

1. **Switch Component** (lines 488-494):
   ```typescript
   {onActive && (
     <Tooltip title={record?.isActive ? "Deactivate" : "Activate"}>
       <Switch
         checked={Boolean(record?.isActive)}
         onChange={() => handleStatusChange(record)}
       />
     </Tooltip>
   )}
   ```

2. **Confirmation Modal** (lines 514-523):
   - Shows `ActiveModal` before toggling
   - Displays current active/inactive state
   - Requires user confirmation

## Known Issues

### Issue 1: Data Refresh After Toggle
**Problem**: After toggling active/inactive, the table doesn't refresh with updated data from the subscription endpoint.

**Root Cause**: 
- Toggle uses `tableOps.onActive` which calls `stableFetchData()`
- `stableFetchData()` fetches from `apiUrls.getAllVendorsAll`
- But the table displays data from custom subscription API loading

**Solution Options**:
1. Add a callback to refresh subscription data after toggle
2. Manually update local state after successful toggle
3. Refetch subscription data in the toggle success callback

### Issue 2: Status Column vs isActive Switch
**Problem**: The "Status" column shows subscription status, not vendor active/inactive status.

**Clarification**: 
- "Status" column = Subscription plan status (active/pending/expired)
- Switch toggle = Vendor account active/inactive

These are separate concepts and serve different purposes.

## How to Use

1. **View Active/Inactive Status**:
   - Check the Switch toggle in the Actions column
   - Green/ON = Vendor is active
   - Gray/OFF = Vendor is inactive

2. **Toggle Active/Inactive**:
   - Click the Switch toggle
   - Confirm in the modal dialog
   - The vendor's `isActive` field will be toggled
   - You may need to refresh the page to see the change (due to Issue 1)

3. **View Subscription Status**:
   - Check the "Status" column
   - Shows subscription plan status (not vendor active/inactive)

## API Endpoints

- **Get Paid Subscriptions**: `GET /api/v1/subscriptions/paid?page=1&limit=10`
- **Toggle Vendor Active**: `PATCH /api/v1/toggle/vendor/${vendorId}`
  - Body: `{ isActive: boolean }`

## Files Involved

1. `src/app/dashboard/subscribedvendors/page.tsx` - Main page component
2. `src/app/components/CommonTable.tsx` - Table with switch toggle
3. `src/app/hooks/useTableOperations.js` - Toggle logic
4. `src/app/components/ActiveModal/ActiveModal.tsx` - Confirmation modal
5. `src/app/apis/index.js` - API endpoint definitions


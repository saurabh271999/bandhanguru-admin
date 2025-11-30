# MMS Card Component Documentation

## Overview
The MMS Card component has been updated to match the exact design shown in the reference image. It now supports different field types with proper styling, including dropdown arrows, document icons, and special time field styling with light green labels. The component now includes the new card designs: Ready to Dispatch, Dispatch, and Fixing Team Info.

## Features
- **Field Visibility Control**: Use boolean props to show/hide specific fields
- **Field Type Support**: Different field types (dropdown, document, time, date, text) with appropriate styling
- **Custom Labels**: Override default field labels
- **Custom Titles**: Set custom titles for cards
- **Custom Styling**: Customize header colors and border colors
- **Reusable**: Use the same component for different card types
- **Image-Accurate Design**: Matches the exact styling from the reference image
- **New Card Types**: Ready to Dispatch, Dispatch, and Fixing Team Info cards

## New Card Designs

### Ready to Dispatch Card
- **Fields**: MMS Number (dropdown), Pre-Quality Report (document), Start Time, End Time
- **Header Color**: Green (`bg-[#059669]`)
- **Purpose**: Shows items ready for dispatch with quality report

### Dispatch Card
- **Fields**: Dispatch Number, Bill Number, Dispatch File (document), Start Time, End Time
- **Header Color**: Green (`bg-[#059669]`)
- **Purpose**: Shows dispatch information and timing

### Fixing Team Info Card
- **Fields**: Dispatch Number, Name of Installer, Fixing Start Date, Target Date, Start Time, End Time
- **Header Color**: Green (`bg-[#059669]`)
- **Purpose**: Shows team assignment and scheduling information

## Field Types

### Supported Field Types
- **`dropdown`**: Shows value with a dropdown arrow (like MMS Number)
- **`document`**: Shows view and download icons
- **`time`**: Shows with light green label styling (Start Time, End Time)
- **`date`**: Standard date field styling
- **`text`**: Standard text field styling

## Props

### Required Props
- `title`: The main title of the card
- `fields`: Array of field configurations with `key`, `label`, `show`, and `type` properties
- `currentDetails`: Object containing the data to display

### Optional Boolean Props (Field Visibility)
- `showMMSNumber`: Control MMS Number field visibility
- `showDate`: Control Date field visibility
- `showDocument`: Control Document field visibility
- `showStartTime`: Control Start Time field visibility
- `showEndTime`: Control End Time field visibility
- `showPreQualityReport`: Control Pre Quality Report field visibility
- `showDispatchNumber`: Control Dispatch Number field visibility
- `showNameOfInstaller`: Control Name of Installer field visibility
- `showFixingStartDate`: Control Fixing Start Date field visibility
- `showTargetDate`: Control Target Date field visibility
- `showCompletionDate`: Control Completion Date field visibility
- `showManpowerUsed`: Control Manpower Used field visibility
- `showPhrFile`: Control PHR File field visibility
- `showChrFile`: Control CHR File field visibility

### Optional Styling Props
- `customTitle`: Custom title to display (overrides the main title)
- `customHeaderColor`: Custom header background color (default: `bg-[#274699]`)
- `customBorderColor`: Custom border color (default: `border-gray-200`)

## Usage Examples

### Ready to Dispatch Card
```tsx
<MMSCard
  title="Ready to Dispatch"
  fields={readyToDispatchFields}
  currentDetails={data}
  showMMSNumber={true}
  showDate={false}
  showDocument={false}
  showStartTime={true}
  showEndTime={true}
  showPreQualityReport={true}
  showDispatchNumber={false}
  showNameOfInstaller={false}
  showFixingStartDate={false}
  showTargetDate={false}
  showCompletionDate={false}
  showManpowerUsed={false}
  showPhrFile={false}
  showChrFile={false}
  customTitle="Ready to Dispatch"
  customHeaderColor="bg-[#059669]"
/>
```

### Dispatch Card
```tsx
<MMSCard
  title="Dispatch"
  fields={dispatchFields}
  currentDetails={data}
  showMMSNumber={false}
  showDate={false}
  showDocument={false}
  showStartTime={true}
  showEndTime={true}
  showPreQualityReport={false}
  showDispatchNumber={true}
  showNameOfInstaller={false}
  showFixingStartDate={false}
  showTargetDate={false}
  showCompletionDate={false}
  showManpowerUsed={false}
  showPhrFile={false}
  showChrFile={false}
  customTitle="Dispatch"
  customHeaderColor="bg-[#059669]"
/>
```

### Fixing Team Info Card
```tsx
<MMSCard
  title="Fixing Team Info"
  fields={fixingTeamInfoFields}
  currentDetails={data}
  showMMSNumber={false}
  showDate={false}
  showDocument={false}
  showStartTime={true}
  showEndTime={true}
  showPreQualityReport={false}
  showDispatchNumber={true}
  showNameOfInstaller={true}
  showFixingStartDate={true}
  showTargetDate={true}
  showCompletionDate={false}
  showManpowerUsed={false}
  showPhrFile={false}
  showChrFile={false}
  customTitle="Fixing Team Info"
  customHeaderColor="bg-[#059669]"
/>
```

### Legacy MMS Card (Full Fields)
```tsx
<MMSCard
  title="MMS"
  fields={mmsFields}
  currentDetails={data}
  showMMSNumber={true}
  showDate={true}
  showDocument={true}
  showStartTime={true}
  showEndTime={true}
  showPreQualityReport={true}
  showDispatchNumber={true}
  showNameOfInstaller={true}
  showFixingStartDate={true}
  showTargetDate={true}
  showCompletionDate={true}
  showManpowerUsed={true}
  showPhrFile={true}
  showChrFile={true}
  customTitle="MMS"
  customHeaderColor="bg-[#274699]"
/>
```

## Field Configuration Structure
```tsx
const readyToDispatchFields = [
  { key: "mmsNumber", label: "MMS Number", show: true, type: "dropdown" },
  { key: "preQualityReport", label: "Pre-Quality Report", show: true, type: "document" },
  { key: "startTime", label: "Start Time", show: true, type: "time" },
  { key: "endTime", label: "End Time", show: true, type: "time" },
];

const dispatchFields = [
  { key: "dispatchNumber", label: "Dispatch Number", show: true, type: "text" },
  { key: "billNumber", label: "Bill Number", show: true, type: "text" },
  { key: "dispatchFile", label: "Dispatch File", show: true, type: "document" },
  { key: "startTime", label: "Start Time", show: true, type: "time" },
  { key: "endTime", label: "End Time", show: true, type: "time" },
];

const fixingTeamInfoFields = [
  { key: "dispatchNumber", label: "Dispatch Number", show: true, type: "text" },
  { key: "nameOfInstaller", label: "Name of Installer", show: true, type: "text" },
  { key: "fixingStartDate", label: "Fixing Start Date", show: true, type: "date" },
  { key: "targetDate", label: "Target Date", show: true, type: "date" },
  { key: "startTime", label: "Start Time", show: true, type: "time" },
  { key: "endTime", label: "End Time", show: true, type: "time" },
];
```

## Data Structure
The `currentDetails` object should contain properties that match the field keys:
```tsx
const data = {
  mmsNumber: "K-098483",
  date: "12-08-2025",
  document: "Project_Doc.pdf",
  startTime: "9.00 PM",
  endTime: "4.00 PM",
  preQualityReport: "Quality_Report.pdf",
  dispatchNumber: "988904509",
  billNumber: "1224",
  dispatchFile: "Dispatch_File.pdf",
  nameOfInstaller: "Ragul Prakash",
  fixingStartDate: "10-08-2025",
  targetDate: "30-12-2025",
  // ... more data
};
```

## Styling Features

### Field Type Styling
- **Dropdown fields**: Show value with gray dropdown arrow
- **Document fields**: Show green eye icon (view) and orange download icon
- **Time fields**: Labels are styled in light green (`text-green-600`)
- **Standard fields**: Labels use default gray styling (`text-gray-600`)

### Header Styling
- **MMS Card**: Dark blue header (`bg-[#274699]`)
- **New Cards**: Green header (`bg-[#059669]`)
- **Customizable**: Override with `customHeaderColor` prop

## Benefits
1. **Image-Accurate**: Matches the exact design from the reference image
2. **Flexibility**: Control exactly which fields are displayed
3. **Reusability**: Use the same component for different card types
4. **Customization**: Easy to customize titles and styling
5. **Maintainability**: Centralized field configuration
6. **Consistency**: Maintains the same visual style across different configurations
7. **New Card Types**: Support for Ready to Dispatch, Dispatch, and Fixing Team Info

## Migration from Old Version
If you were using the old MMS card component:
1. Update your field configuration to use the new structure with `type` property
2. Add boolean props to control field visibility
3. Update the component props to match the new interface
4. Test the field visibility controls and styling
5. Add new card types as needed

## Example Component
See `MMSCardExample.tsx` for a complete working example that matches the new image design exactly.

## Reference Image Features Implemented
- ✅ Ready to Dispatch card with MMS Number, Pre-Quality Report, Start Time, End Time
- ✅ Dispatch card with Dispatch Number, Bill Number, Dispatch File, Start Time, End Time
- ✅ Fixing Team Info card with Dispatch Number, Name of Installer, Fixing Start Date, Target Date, Start Time, End Time
- ✅ MMS Number field with dropdown arrow
- ✅ Document fields with view/download icons
- ✅ Start Time and End Time with light green labels
- ✅ Consistent card styling and layout
- ✅ Proper field visibility control for different card types
- ✅ Green headers for new card types

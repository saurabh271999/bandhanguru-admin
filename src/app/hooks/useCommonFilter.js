import { useState } from "react";

const useCommonFilter = (data, columns) => {
  // Now: selectedColumn is array, selectedColumnValue is object
  const [selectedColumn, setSelectedColumn] = useState([]); // array of column keys
  const [selectedColumnValue, setSelectedColumnValue] = useState({}); // { column: [values] }

  const filterData = (dataToFilter) => {
    // If no columns selected or all selected columns have no values, return all data
    if (
      !selectedColumn ||
      selectedColumn.length === 0 ||
      Object.values(selectedColumnValue).every(
        (arr) => !arr || arr.length === 0
      )
    ) {
      return dataToFilter;
    }

    // For each row, check all selected columns
    return dataToFilter.filter((item) => {
      return selectedColumn.every((col) => {
        const column = columns.find((c) => c.field === col);
        let cellValue;

        if (column?.renderCell) {
          try {
            const rendered = column.renderCell({ row: item });
            if (typeof rendered === "string" || typeof rendered === "number") {
              cellValue = rendered.toString();
            } else if (rendered?.props?.children) {
              cellValue = rendered.props.children.toString();
            } else {
              cellValue = item[col]?.toString() || "";
            }
          } catch {
            cellValue = item[col]?.toString() || "";
          }
        } else {
          cellValue = item[col]?.toString() || "";
        }

        // If no value selected for this column, ignore this column
        if (
          !selectedColumnValue[col] ||
          selectedColumnValue[col].length === 0
        ) {
          return true;
        }

        // Check if cellValue is in selected values for this column
        return selectedColumnValue[col].includes(cellValue);
      });
    });
  };

  const resetFilters = () => {
    setSelectedColumn([]);
    setSelectedColumnValue({});
  };

  return {
    selectedColumn,
    selectedColumnValue,
    setSelectedColumn,
    setSelectedColumnValue,
    filterData,
    resetFilters,
  };
};

export default useCommonFilter;

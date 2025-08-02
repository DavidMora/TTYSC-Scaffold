import { TableDataRow, TableDataRowPrimitive } from "@/lib/types/datatable";

/**
 * Helper function to get value by accessor path from a table row.
 * Supports nested object access using dot notation (e.g., "user.profile.name").
 *
 * @param obj - The table row object to extract the value from
 * @param accessor - The accessor path (supports dot notation for nested objects)
 * @returns The value at the specified path, or undefined if not found
 */
export function getValueByAccessor(
  obj: TableDataRow,
  accessor: string
): unknown {
  return accessor
    .split(".")
    .reduce(
      (acc: unknown, key) =>
        acc && typeof acc === "object" && acc !== null && key in acc
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    );
}

/**
 * Helper function to get a formatted string value by accessor path from a table row.
 * This is specifically for display purposes in UI components.
 *
 * @param obj - The table row object to extract the value from
 * @param accessor - The accessor path (supports dot notation for nested objects)
 * @returns A formatted string representation of the value, or empty string if not found
 */
export function getFormattedValueByAccessor(
  obj: TableDataRow,
  accessor: string
): string {
  const value = getValueByAccessor(obj, accessor) as
    | TableDataRowPrimitive
    | undefined;

  if (value === null || value === undefined) {
    return "";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}

export const EMPLOYEE_STATUSES = ["active", "on_leave", "terminated"] as const;
export type EmployeeStatus = typeof EMPLOYEE_STATUSES[number];
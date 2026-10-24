export const ROLES = ["Admin", "HR Manager", "Manager", "Auditor"] as const;
export type Role = typeof ROLES[number];

export interface User {
    "id": number,
    "name": string,
    "email": string,
    "email_verified_at": string,
    "password_changed_at": string,
    "role": Role,
    "employee_id": number,
    "created_at": string,
    "updated_at": string
}
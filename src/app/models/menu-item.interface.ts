export interface MenuItem {
  label: string;
  icon: string;   // e.g., 'people' for Material Icon
  route: string;  // The URL path
  roles?: string[]; // Optional: Which roles can see this?
  children?: MenuItem[]; // Optional: Submenu items
}
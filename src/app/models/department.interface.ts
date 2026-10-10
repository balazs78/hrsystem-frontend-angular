

export interface Department {
  id: number;
  name: string;
  costCenterCode: string;
  stats?: {
    headcount: number;
  };
  manager: {
    id: number;
    fullName: string;
  } | null;
  createdAt: string;
}
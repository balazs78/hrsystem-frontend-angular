export interface SummaryWidget {
  title: string;
  value: number;
}
export interface OnboardingEmployee {
  fullName: string;
}
export interface ExpiringContract {
  fullName: string;
  contractExpireDate: Date;
}

export interface EmployeeTypeChartData {
  employeeCount: number;
  contractorCount: number;
}

export interface EmployeePerDepartmentChartData {
  name: string;
  count: number;
}

export interface ManagerVsEmployeeChartData {
  managerCount: number;
  individualContributorCount: number;
}

export interface YearlyTrendData {
    'month_label': string;
    'total_headcount': number;
}

export interface SummaryReport {
  summary: Array<SummaryWidget>;
  onboardingEmployees: Array<OnboardingEmployee>;
  expiringContracts: Array<ExpiringContract>;
  employeeTypeChartData: EmployeeTypeChartData;
  managerVsEmployeeChartData: ManagerVsEmployeeChartData;
}
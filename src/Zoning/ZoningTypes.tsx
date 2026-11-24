export type ZoningCheckStatus = "compliant" | "violation" | "not-evaluated";

export interface ZoningCheckResult {
  ruleId: string;
  kind: string;
  status: ZoningCheckStatus;
  message: string;
  actual?: number;
  limit?: number;
}

export interface ZoningValidationResult {
  compliant: boolean;
  checks: ZoningCheckResult[];
}

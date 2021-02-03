export interface Terms {
  id: string;  // Use same id than right & terms
  // Start Query //
  titleId: string;
  orgId: string;
  territories: string[];
  media: string[];
  exclusive: boolean;
  duration: { from: Date, to: Date };
  // End Query //
  // Vanity information
  languages: Record<string, { subtitle: boolean }>;
  criteria: any[];

}

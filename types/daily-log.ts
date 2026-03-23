// ============================================
// Daily Log Types
// ============================================

/**
 * Serialized daily log for client-side use
 * Dates are serialized to strings for JSON transfer
 */
export interface SerializedDailyLog {
  id: string;
  date: string;
  problemsSolved: number;
  topics: string[];
  notes: string | null;
}

/**
 * Props for the DailyLogForm component
 */
export interface DailyLogFormProps {
  log?: SerializedDailyLog | null;
  onSuccess?: () => void;
}

/**
 * Props for the DailyLogList component
 */
export interface DailyLogListProps {
  logs: SerializedDailyLog[];
  onDelete?: (id: string) => Promise<void>;
}

/**
 * Form data structure for daily log submissions
 */
export interface DailyLogFormData {
  date: string;
  problemsSolved: number;
  topics: string[];
  notes?: string;
}

/**
 * Filter options for daily log lists
 */
export type DailyLogFilter = "ALL" | "TODAY" | "WEEK" | "MONTH";

/**
 * State for daily log operations
 */
export interface DailyLogState {
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

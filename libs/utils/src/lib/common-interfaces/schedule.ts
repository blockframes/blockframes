import { ScheduledDateRaw, createScheduledDate } from "./terms";
import { PaymentStatus } from "./price";
export interface ScheduleRaw<D> {
  percentage: number;
  date?: D | ScheduledDateRaw<D>;
  label: string;
}

export interface PaymentScheduleRaw<D> extends ScheduleRaw<D> {
  date: ScheduledDateRaw<D>;
  invoiceId?: string;
  status: PaymentStatus;
}

export interface PaymentSchedule extends PaymentScheduleRaw<Date> {
}

export function createPaymentSchedule(params: Partial<PaymentSchedule> = {}): PaymentSchedule {
  return {
    percentage: 0,
    date: createScheduledDate(params && params.date),
    label: '',
    status: PaymentStatus.unknown,
    ...params,
  }
}
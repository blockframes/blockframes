export interface ScheduleRaw<D> {
  percentage: number;
  date?: D | string;
  label: string;
}


export interface PaymentScheduleRaw<D> extends ScheduleRaw<D>{
  invoiceId ? : string;
}


export interface PaymentSchedule extends PaymentScheduleRaw<Date> {
}


export function createPaymentSchedule(params: Partial<PaymentSchedule> = {}): PaymentSchedule {
  return {
    percentage: 0,
    label: '',
    ...params,
  }
}
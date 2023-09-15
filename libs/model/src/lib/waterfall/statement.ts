import { DocumentMeta } from '../meta';
import { MovieCurrency } from '../static';
import { Duration, createDuration } from '../terms';

interface IncomeStatement {
  rights: Record<number, string>; // Ordered rights to apply for a specific income
  incomeId: string;
}

export interface Payment {
  id: string;
  type: 'external' | 'internal';
  price: number;
  currency: MovieCurrency;
  date: Date;
  status: 'pending' | 'processed';
  to: string;
}

/**
 * "External" payment to the licensor (money that the current righholder did not take for his rights)
 * Once processed, will take money available in Org.revenu.actual and assign it to licensor's Org, incrementing org actual revenu and turnover
 */
interface ExternalPayment extends Payment {
  type: 'external';
  to: string; // rightholderId referenced as licensor in the contract
}

/**
 * "Internal" payment (com, expense, MG etc)
 * Once processed, will assign money available in Org.revenu.actual to correct rights, incrementing right actual revenu and turnover
 */
interface InternalPayment extends Payment {
  type: 'internal'
  to: string; // rightId
}

export interface Statement {
  _meta?: DocumentMeta;
  id: string;
  waterfallId: string;
  rightholderId: string;
  duration: Duration;
  contractId: string; // rightholderId is licensee of this contract
  incomes: IncomeStatement[];
  expenseIds: string[];
  payments: {
    external?: ExternalPayment,
    internal: InternalPayment[]
  };
  additional: {
    quantitySold?: number;
    salesContractId?: string; // rightholderId is licensor of this contract
  }
}

export type DistributorStatement = Statement;

export function createStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
  return {
    id: '',
    waterfallId: '',
    rightholderId: '',
    contractId: '',
    incomes: [],
    expenseIds: [],
    payments: {
      internal: []
    },
    additional: {},
    ...params,
    duration: createDuration(params?.duration),
  };
}

export function createDistributorStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
  return createStatement(params);
}

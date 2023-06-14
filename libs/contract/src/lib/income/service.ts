import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Income } from '@blockframes/model';
import { QueryConstraint, where } from 'firebase/firestore';

export const incomeQuery = (contractIds: string | string[]): QueryConstraint[] => [
  where('contractId', Array.isArray(contractIds) ? 'in' : '==', contractIds)
];

@Injectable({ providedIn: 'root' })
export class IncomeService extends BlockframesCollection<Income> {
  readonly path = 'incomes';
}

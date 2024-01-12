import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Income } from '@blockframes/model';
import { QueryConstraint, where } from 'firebase/firestore';
import { map } from 'rxjs';

export const incomeQuery = (contractIds: string | string[]): QueryConstraint[] => [
  where('contractId', Array.isArray(contractIds) ? 'in' : '==', contractIds)
];

function convertIncomesTo(incomes: Income[], versionId: string) {
  if (!versionId) return incomes;
  return incomes.map(i => {
    const price = (i.version && i.version[versionId] !== undefined) ? i.version[versionId].price : i.price;
    return { ...i, price };
  });
}

@Injectable({ providedIn: 'root' })
export class IncomeService extends BlockframesCollection<Income> {
  readonly path = 'incomes';

  public incomesChanges(waterfallId: string, versionId: string) {
    return this.valueChanges([where('titleId', '==', waterfallId)]).pipe(
      map(incomes => convertIncomesTo(incomes, versionId))
    );
  }

  public async incomes(waterfallId: string, ids: string[] = [], versionId?: string) {
    const incomes = ids.length ? await this.getValue(ids) : await this.getValue([where('titleId', '==', waterfallId)]);
    return convertIncomesTo(incomes, versionId);
  }
}

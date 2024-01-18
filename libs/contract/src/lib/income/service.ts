import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Income, Waterfall, convertIncomesTo, waterfallSources } from '@blockframes/model';
import { QueryConstraint, where } from 'firebase/firestore';
import { map } from 'rxjs';

export const incomeQuery = (contractIds: string | string[]): QueryConstraint[] => [
  where('contractId', Array.isArray(contractIds) ? 'in' : '==', contractIds)
];

@Injectable({ providedIn: 'root' })
export class IncomeService extends BlockframesCollection<Income> {
  readonly path = 'incomes';

  public incomesChanges(waterfall: Waterfall, versionId: string) {
    const sources = waterfallSources(waterfall, versionId);
    return this.valueChanges([where('titleId', '==', waterfall.id)]).pipe(
      map(incomes => convertIncomesTo(incomes, versionId, sources))
    );
  }

  public async incomes(waterfall: Waterfall, ids: string[], versionId?: string) {
    const sources = waterfallSources(waterfall, versionId);
    const incomes = Array.isArray(ids) ? await this.getValue(ids) : await this.getValue([where('titleId', '==', waterfall.id)]);
    return convertIncomesTo(incomes, versionId, sources);
  }
}

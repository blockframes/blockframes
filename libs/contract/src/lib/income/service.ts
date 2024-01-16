import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Income, Waterfall, WaterfallSource, waterfallSources } from '@blockframes/model';
import { QueryConstraint, where } from 'firebase/firestore';
import { map } from 'rxjs';

export const incomeQuery = (contractIds: string | string[]): QueryConstraint[] => [
  where('contractId', Array.isArray(contractIds) ? 'in' : '==', contractIds)
];

function convertIncomesTo(incomes: Income[], versionId: string, sources: WaterfallSource[]) {
  if (!versionId) return incomes;
  return incomes.map(i => {
    const price = (i.version && i.version[versionId] !== undefined) ? i.version[versionId].price : i.price;
    return { ...i, price };
  }).filter(i => sources.find(s => s.id === i.sourceId));
}

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

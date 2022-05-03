import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { ActiveState, EntityState } from '@datorama/akita';
import { Income } from '@blockframes/model';

interface IncomeState extends EntityState<Income>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'incomes' })
export class IncomeService extends CollectionService<IncomeState> {
  useMemorization = false;
}

import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { QueryFn } from '@angular/fire/firestore';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Holdback, Sale } from '@blockframes/shared/model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'getTitleHoldbacks' })
export class GetTitleHoldbacksPipe implements PipeTransform {
  constructor(private service: ContractService) {}

  transform(titleId: string, excludedOrg: string): Observable<Holdback[]> {
    if (!titleId) return of(undefined);
    const query: QueryFn = ref =>
      ref
        .where('titleId', '==', titleId)
        .where('status', '==', 'accepted')
        .where('type', '==', 'sale')
        .where('buyerId', '!=', excludedOrg);
    return this.service.valueChanges(query).pipe(map((sales: Sale[]) => sales.map(sale => sale.holdbacks).flat()));
  }
}

@NgModule({
  declarations: [GetTitleHoldbacksPipe],
  exports: [GetTitleHoldbacksPipe],
})
export class GetTitleHoldbacksPipeModule {}

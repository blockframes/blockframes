import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService, Holdback, Sale } from '@blockframes/contract/contract/+state';
import { where } from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'getTitleHoldbacks' })
export class GetTitleHoldbacksPipe implements PipeTransform {
  constructor(
    private service: ContractService
  ) { }

  transform(titleId: string, excludedOrg: string,): Observable<Holdback[]> {
    if (!titleId) return of(undefined);
    const query = [
      where('titleId', '==', titleId),
      where('status', '==', 'accepted'),
      where('type', '==', 'sale'),
      where('buyerId', '!=', excludedOrg)
    ];
    return this.service.valueChanges(query).pipe(
      map((sales: Sale[]) => sales.map(sale => sale.holdbacks).flat())
    );
  }
}

@NgModule({
  declarations: [GetTitleHoldbacksPipe],
  exports: [GetTitleHoldbacksPipe]
})
export class GetTitleHoldbacksPipeModule { }

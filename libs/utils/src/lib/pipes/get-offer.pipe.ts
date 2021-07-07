import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { OfferService } from '@blockframes/contract/offer/+state';

@Pipe({ name: 'getOffer' })
export class GetOfferPipe implements PipeTransform {
  constructor(
    private service: OfferService
  ) { }
  transform(offerId: string) {
    return this.service.valueChanges(offerId);
  }

}

@NgModule({
  exports: [GetOfferPipe],
  declarations: [GetOfferPipe]
})
export class GetOfferPipeModule { }

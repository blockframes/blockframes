import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { OfferService } from './+state/offer.service';

@Pipe({ name: 'getOffer' })
export class GetOfferPipe implements PipeTransform {
  constructor(private offerService: OfferService) { }
  transform(offerId: string) {
    return this.offerService.valueChanges(offerId);
  }

}

@NgModule({
  exports: [GetOfferPipe],
  declarations: [GetOfferPipe]
})
export class OfferPipeModule { }

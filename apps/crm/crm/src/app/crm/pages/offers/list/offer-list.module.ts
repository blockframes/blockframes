import { NgModule } from '@angular/core';
import { OffersListComponent } from './offer-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OfferListModule } from '@blockframes/contract/offer/list/list.module';

@NgModule({
  declarations: [
    OffersListComponent,
  ],
  imports: [
    CommonModule,
    OfferListModule,
    //Router
    RouterModule.forChild([{ path: '', component: OffersListComponent }])
  ],
})
export class CrmOfferListModule { }

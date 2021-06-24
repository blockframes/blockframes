import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferViewComponent } from './offer-view.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [OfferViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: OfferViewComponent }]),
  ]
})
export class OfferViewModule { }

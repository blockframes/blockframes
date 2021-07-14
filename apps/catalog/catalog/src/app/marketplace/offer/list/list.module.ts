import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListComponent } from './list.component';
import { OfferListModule } from '@blockframes/contract/offer/list/list.module';

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    OfferListModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class ListModule { }

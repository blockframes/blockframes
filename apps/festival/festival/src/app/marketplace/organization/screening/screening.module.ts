import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreeningComponent } from './screening.component';
import { RouterModule } from '@angular/router';
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';

@NgModule({
  declarations: [ScreeningComponent],
  imports: [
    CommonModule,
    EventListModule,
    ScreeningItemModule,
    RouterModule.forChild([{ path: '', component: ScreeningComponent }])
  ]
})
export class ScreeningModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { RouterModule } from '@angular/router';
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { EventEmptyModule } from '@blockframes/event/components/empty/empty.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    EventListModule,
    EventEmptyModule,
    ScreeningItemModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class ListModule { }

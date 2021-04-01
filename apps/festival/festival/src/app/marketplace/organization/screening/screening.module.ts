import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreeningComponent } from './screening.component';
import { RouterModule } from '@angular/router';
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { EventEmptyModule } from '@blockframes/event/components/empty/empty.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ScreeningComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventListModule,
    EventEmptyModule,
    ScreeningItemModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: ScreeningComponent }])
  ]
})
export class ScreeningModule { }

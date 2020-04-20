import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [EventViewComponent],
  imports: [
    CommonModule,
    EventRangeModule,
    GuestListModule,
    TableFilterModule,
    ImgAssetModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: EventViewComponent }])
  ]
})
export class EventViewModule { }

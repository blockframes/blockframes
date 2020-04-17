import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventViewComponent } from './view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BackgroundAssetModule } from '@blockframes/ui/theme/background-asset.module';
import { EventRangeModule } from '../../pipes/event-range.pipe';


import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [EventViewComponent],
  exports: [EventViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BackgroundAssetModule,
    EventRangeModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class EventViewModule { }

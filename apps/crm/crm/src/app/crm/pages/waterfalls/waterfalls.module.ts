import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { WaterfallsComponent } from './waterfalls.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TableModule,
    ImageModule,
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    RouterModule.forChild([{ path: '', component: WaterfallsComponent }])
  ]
})
export class WaterfallListModule { }

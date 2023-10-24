import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ListComponent } from './list.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TableModule,
    ImageModule,
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class ListModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemComponent } from './item.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ItemComponent],
  exports: [ItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class NotificationItemModule { }

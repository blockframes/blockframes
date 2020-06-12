import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemComponent } from './item.component';
import { InvitationActionModule } from '../action/action.module';
import { EventLinkModule } from '../../pipes/event-link.pipe';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ItemComponent],
  exports: [ItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    InvitationActionModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    EventLinkModule,
    RouterModule
  ]
})
export class InvitationItemModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemComponent } from './item.component';
import { InvitationActionModule } from '../action/action.module';
import { EventLinkModule } from '../../pipes/event-link.pipe';
import { ImgModule } from '@blockframes/ui/media/img/img.module';

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
    ImgModule,
    InvitationActionModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    EventLinkModule,
    RouterModule
  ]
})
export class InvitationItemModule { }

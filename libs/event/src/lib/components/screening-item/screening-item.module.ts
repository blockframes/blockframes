import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScreeningItemComponent } from './screening-item.component';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { ImageReferenceModule } from '@blockframes/ui/media';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { InvitationActionModule } from '@blockframes/invitation/components/action/action.module';
// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ScreeningItemComponent],
  exports: [ScreeningItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    EventRangeModule,
    InvitationActionModule,
    OrgChipModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ScreeningItemModule { }

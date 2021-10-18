import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScreeningItemComponent } from './screening-item.component';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { InvitationActionModule } from '@blockframes/invitation/components/action/action.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [ScreeningItemComponent],
  exports: [ScreeningItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    EventRangeModule,
    InvitationActionModule,
    OrgChipModule,
    GetTitlePipeModule,
    GetOrgPipeModule,
    OngoingButtonModule,
    EventTimeModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ]
})
export class ScreeningItemModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationComponent } from './invitation.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { InvitationListModule } from '@blockframes/invitation/components/list/list.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    InvitationListModule,
    FlexLayoutModule,
    ImageReferenceModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }])
  ]
})
export class InvitationModule { }

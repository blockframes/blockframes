import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationComponent } from './invitation.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { InvitationListModule } from '@blockframes/invitation/components/list/list.module';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    InvitationListModule,
    ImageReferenceModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }])
  ]
})
export class InvitationModule { }

// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { InvitationComponent } from './invitation.component';
import { InvitationListModule } from '@blockframes/invitation/components/list/list.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    InvitationListModule,
    ImageReferenceModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }]),

    // Material
    MatIconModule,
    MatButtonModule,
  ]
})
export class InvitationModule { }

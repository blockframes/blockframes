import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Components
import { InvitationListComponent } from './invitation-list.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [InvitationListComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ReverseModule,
    ImageReferenceModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatIconModule,
  ],
  exports: [InvitationListComponent]
})
export class InvitationListModule {}

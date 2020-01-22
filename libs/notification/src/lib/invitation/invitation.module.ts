import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Components
import { InvitationListComponent } from './invitation-list/invitation-list.component';
import { InvitationItemComponent } from './invitation-item/invitation-item.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    InvitationListComponent,
    InvitationItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ReverseModule,
    ImageReferenceModule,

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule,
    MatCardModule
  ],
  exports: [InvitationListComponent, InvitationItemComponent]
})
export class InvitationModule {}

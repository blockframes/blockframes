import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';
import { AssetsThemeModule } from '@blockframes/ui';

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

@NgModule({
  declarations: [
    InvitationListComponent,
    InvitationItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    AvatarListModule,
    AssetsThemeModule,

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule
  ],
  exports: [InvitationListComponent, InvitationItemComponent]
})
export class InvitationModule {}

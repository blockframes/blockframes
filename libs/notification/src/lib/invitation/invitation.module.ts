import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

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

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule
  ],
  exports: [InvitationListComponent]
})
export class InvitationModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { InvitationsComponent } from './invitations.component';

// Modules
import { InvitationListModule } from '../../components/invitation-list/invitation-list.module';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    InvitationListModule,
    BreadCrumbModule
  ],
  declarations: [
    InvitationsComponent,
  ]
})
export class InvitationsModule { }

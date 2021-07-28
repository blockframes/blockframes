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
import { GuestTableModule } from '../../components/guest-table/guest-table.module';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    GuestTableModule,
    BreadCrumbModule
  ],
  declarations: [
    InvitationsComponent,
  ]
})
export class InvitationsModule { }

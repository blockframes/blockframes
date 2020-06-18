import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Materials
import { MatCardModule } from '@angular/material/card';

// Components
import { InvitationsComponent } from './invitations.component';

// Modules
import { GuestTableModule } from '../../components/guest-table/guest-table.module';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    GuestTableModule,
  ],
  declarations: [
    InvitationsComponent,
  ]
})
export class InvitationsModule { }

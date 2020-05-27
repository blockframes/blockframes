import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvitationHasActionPipeModule } from './has-action.pipe';



@NgModule({
  declarations: [ActionComponent],
  exports: [ActionComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    InvitationHasActionPipeModule
  ]
})
export class InvitationActionModule { }

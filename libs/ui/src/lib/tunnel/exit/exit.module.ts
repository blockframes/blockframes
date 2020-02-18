import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExitComponent } from './exit.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ExitComponent],
  exports: [ExitComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TunnelExitModule { }

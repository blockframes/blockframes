import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ShellComponent } from './shell.component';

import { TagModule } from '@blockframes/ui/tag/tag.module';
import { ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ShellComponent
  ],
  imports: [
    CommonModule,
    ToLabelModule,
    TotalPipeModule,
    TagModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{
      path: '',
      component: ShellComponent,
      children: []
    }])
  ]
})
export class ShellModule { }

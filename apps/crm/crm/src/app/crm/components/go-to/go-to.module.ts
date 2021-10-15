import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

// Modules 
import { GoToAppModule } from '@blockframes/admin/crm/pipes/go-to.pipe';

// Components 
import { GoToComponent } from './go-to.component';

@NgModule({
  declarations: [
    GoToComponent
  ],
  exports: [
    GoToComponent,
    GoToAppModule
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    GoToAppModule,
    MatMenuModule,
  ]
})
export class GoToModule { }

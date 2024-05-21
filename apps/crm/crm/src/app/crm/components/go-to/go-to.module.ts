import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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

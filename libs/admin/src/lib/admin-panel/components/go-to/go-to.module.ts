import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

// Modules 
import { GoToAppModule } from '../../pipes/go-to.pipe';

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
    GoToAppModule,
    MatListModule,
    MatMenuModule,
  ]
})
export class GoToModule { }

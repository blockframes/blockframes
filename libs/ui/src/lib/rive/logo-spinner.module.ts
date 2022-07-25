import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogoSpinnerComponent } from './logo-spinner.component';

import { RiveModule } from 'ng-rive';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [LogoSpinnerComponent],
  exports: [LogoSpinnerComponent],
  imports: [
    CommonModule,
    RiveModule,
    
    // Material
    MatProgressSpinnerModule
  ]
})
export class LogoSpinnerModule { }

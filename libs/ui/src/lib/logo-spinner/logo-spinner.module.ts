import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogoSpinnerComponent } from './logo-spinner.component';

import { RiveModule, RIVE_VERSION } from 'ng-rive';

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
  ],
  providers: [{
    provide: RIVE_VERSION,
    useValue: '1.1.6',
  }]

})
export class LogoSpinnerModule { }

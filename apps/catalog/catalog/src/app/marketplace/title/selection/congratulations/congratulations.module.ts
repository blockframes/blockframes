import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatButtonModule } from '@angular/material/button';

import { CongratulationsComponent } from './congratulations.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,

    MatButtonModule,

    RouterModule.forChild([
      {
        path: '',
        component: CongratulationsComponent
      }
    ]),
  ],
  exports: [CongratulationsComponent],
  declarations: [CongratulationsComponent]
})
export class CongratulationsModule { }

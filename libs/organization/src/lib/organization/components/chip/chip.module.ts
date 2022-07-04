import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChipComponent } from './chip.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [ChipComponent],
  exports: [ChipComponent],
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    MatRippleModule
  ]
})
export class OrgChipModule { }

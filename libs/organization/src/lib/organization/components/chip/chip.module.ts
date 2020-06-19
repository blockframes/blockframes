import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChipComponent } from './chip.component';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [ChipComponent],
  exports: [ChipComponent],
  imports: [
    CommonModule,
    RouterModule,
    ImgModule,
    OrgNameModule,
    MatRippleModule
  ]
})
export class OrgChipModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChipComponent } from './chip.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [ChipComponent],
  exports: [ChipComponent],
  imports: [
    CommonModule,
    RouterModule,
    ImageReferenceModule,
    OrgNameModule,
    MatRippleModule
  ]
})
export class OrgChipModule { }

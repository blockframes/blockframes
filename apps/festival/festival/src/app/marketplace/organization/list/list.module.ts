import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
// Material
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
    MatCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
  ]
})
export class OrganizationListModule { }

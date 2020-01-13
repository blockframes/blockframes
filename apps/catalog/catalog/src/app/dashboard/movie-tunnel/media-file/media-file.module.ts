import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MediaFileComponent } from './media-file.component';
// Material
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [MediaFileComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    // Material
    MatCardModule,
    RouterModule.forChild([{ path: '', component: MediaFileComponent }])
  ],
  exports: [MediaFileComponent]
})
export class MediaFileModule { }

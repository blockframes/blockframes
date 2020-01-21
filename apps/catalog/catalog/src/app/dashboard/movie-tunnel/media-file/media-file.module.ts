import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { PromotionalLinksModule } from '@blockframes/movie/movie/form/promotional-elements/promotional-links/promotional-links.module';
import { UploadModule } from '@blockframes/ui/upload/upload.module';
import { MediaFileComponent } from './media-file.component';
// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [MediaFileComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    PromotionalLinksModule,
    UploadModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MediaFileComponent }])
  ],
  exports: [MediaFileComponent]
})
export class MediaFileModule { }

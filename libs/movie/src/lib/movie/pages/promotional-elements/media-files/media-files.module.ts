import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { PromotionalLinksModule } from '@blockframes/movie/form/promotional-elements/promotional-links/promotional-links.module';
import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { MovieFormMediaFilesComponent } from './media-files.component';
// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [MovieFormMediaFilesComponent],
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
    RouterModule.forChild([{ path: '', component: MovieFormMediaFilesComponent }])
  ],
  exports: [MovieFormMediaFilesComponent]
})
export class MovieFormMediaFilesModule { }

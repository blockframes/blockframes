import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Blockframes Movie
import { PromotionalLinksModule } from '@blockframes/movie/form/links/promotional-links.module';

// Blockframes Media
import { UploadModule } from '@blockframes/media/components/upload/upload.module';

import { MovieFormMediaFilesComponent } from './media-files.component';


@NgModule({
  declarations: [MovieFormMediaFilesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    PromotionalLinksModule,
    UploadModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MovieFormMediaFilesComponent }])
  ],
  exports: [MovieFormMediaFilesComponent]
})
export class MovieFormMediaFilesModule { }

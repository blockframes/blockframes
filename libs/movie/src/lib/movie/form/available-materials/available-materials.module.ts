// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieFormAvailableMaterialsComponent } from './available-materials.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Material
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

@NgModule({
  imports: [
    CommonModule,
    TunnelPageModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FileUploaderModule,
    RouterModule.forChild([{ path: '', component: MovieFormAvailableMaterialsComponent }]),

    // Material
    MatInputModule,
    MatButtonModule,
    MatIconModule,

  ],
  declarations: [MovieFormAvailableMaterialsComponent],
})
export class MovieFormAvailableMaterialsModule { }

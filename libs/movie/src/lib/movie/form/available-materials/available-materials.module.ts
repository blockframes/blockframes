// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes

// Components
import { MovieFormAvailableMaterialsComponent } from './available-materials.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LanguagesFormModule } from '../languages/languages.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

@NgModule({
  imports: [
    CommonModule,
    TunnelPageModule,
    ReactiveFormsModule,
    FlexLayoutModule,
        LanguagesFormModule,
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

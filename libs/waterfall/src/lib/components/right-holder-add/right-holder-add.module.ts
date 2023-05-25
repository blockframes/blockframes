import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightHolderAddComponent } from './right-holder-add.component';

// Blockframes
import { AlgoliaChipsAutocompleteModule } from '@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    RightHolderAddComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlgoliaChipsAutocompleteModule,
    DeepKeyPipeModule,
    DisplayUserModule,
    StorageFileModule,
    ImageModule,
    StaticSelectModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,

  ],
  exports: [
    RightHolderAddComponent
  ]
})
export class RightHolderAddModule { }

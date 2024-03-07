import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { OrganizationInviteComponent } from './organization-invite.component';

// Blockframes
import { AlgoliaChipsAutocompleteModule } from '@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';
import { RightholderSelectModule } from '../../rightholder/rightholder-select/rightholder-select.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    OrganizationInviteComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlgoliaChipsAutocompleteModule,
    DeepKeyPipeModule,
    DisplayUserModule,
    StorageFileModule,
    ImageModule,
    RightholderSelectModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,

  ],
  exports: [
    OrganizationInviteComponent
  ]
})
export class OrganizationInviteModule { }

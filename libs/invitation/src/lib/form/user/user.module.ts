import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserComponent } from './user.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { AlgoliaChipsAutocompleteModule } from '@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { UserNameModule } from '@blockframes/utils/pipes/user-name.pipe';

// Material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [UserComponent],
  exports: [UserComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Blockframes
    ImageReferenceModule,
    AlgoliaChipsAutocompleteModule,
    DisplayNameModule,
    DeepKeyPipeModule,
    UserNameModule,
    // Material
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class InvitationFormUserModule { }

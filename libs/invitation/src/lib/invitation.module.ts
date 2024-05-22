// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { InvitationComponent } from './invitation.component';
import { InvitationListModule } from './components/list/list.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    InvitationListModule,
    ImageModule,
    ReactiveFormsModule,
    StaticSelectModule,
    LogoSpinnerModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }]),

    // Material
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule
  ]
})
export class InvitationModule { }

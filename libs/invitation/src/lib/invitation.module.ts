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
import { LogoSpinnerModule } from '@blockframes/ui/rive/logo-spinner.module'

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

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

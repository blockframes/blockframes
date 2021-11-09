import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventIdenityComponent } from './identity.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

@NgModule({
  declarations: [EventIdenityComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ImageModule,
    AppLogoModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: EventIdenityComponent }]),
  ]
})
export class IdentityModule { }

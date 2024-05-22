// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

// Pages
import { ContactComponent } from './contact.component';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [ContactComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    GoogleMapsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ContactComponent
      }
    ])
  ]
})
export class ContactModule {}

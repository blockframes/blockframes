// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ImdbImportComponent } from './imdb-import.component';

// Material 
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

const routes = [{
  path: '',
  component: ImdbImportComponent,
}];

@NgModule({
  declarations: [ImdbImportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatButtonModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,

    // Routes
    RouterModule.forChild(routes)
  ]
})
export class ImdbImportModule { }

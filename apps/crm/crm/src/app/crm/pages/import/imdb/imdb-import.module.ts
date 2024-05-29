// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ImdbImportComponent } from './imdb-import.component';

// Material 
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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

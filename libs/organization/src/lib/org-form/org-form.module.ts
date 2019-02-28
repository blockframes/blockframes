import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// Components
// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { OrgFormComponent } from './org-form.component';
import { MatButtonModule, MatCardModule, MatDividerModule, MatToolbarModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [OrgFormComponent],
  exports: [OrgFormComponent]
})
export class OrgFormModule {
}

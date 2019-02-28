import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule } from '@angular/material';

@NgModule({
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule
  ]
})
export class OrganizationModule {
}

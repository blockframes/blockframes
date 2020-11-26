import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectFormModule } from '../select';
import { TextFormModule } from '../text';
import { FirestoreComponent } from './firestore.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FirestoreComponent],
  exports: [FirestoreComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectFormModule,
    TextFormModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class FirestoreFormModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormFactoryModule } from 'ng-form-factory';

// Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { EditTitleComponent } from './edit-title.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FormFactoryModule.forRoot({
      text: () => import('./../../forms/text-form').then(c => c.TextFormComponent),
      entity: () => import('./../../entity').then(c => c.EntityComponent)
    })
  ],
  declarations: [
    EditTitleComponent,
  ],
  exports: [
    EditTitleComponent
  ]
})
export class EditTitleModule { }

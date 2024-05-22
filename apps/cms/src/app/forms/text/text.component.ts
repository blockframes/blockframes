import { Component, NgModule, ChangeDetectionStrategy, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormField, FormOutlet } from 'ng-form-factory';
import { MatTextSchema } from './text.schema';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';


@Component({
  selector: 'form-text',
  templateUrl: './text.component.html',
  styles: ['mat-form-field { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFormComponent implements FormOutlet {
  @Input() form: FormField<any>;
  
  get schema(): MatTextSchema {
    return this.form.schema as MatTextSchema;
  }
  
  getErrorMsg() {
    for (const error in this.schema.errors) {
      if (this.form.hasError(error)) return this.schema.errors[error];
    }
    return '';
  }
}

@NgModule({
  declarations: [TextFormComponent],
  exports: [TextFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class TextFormModule { }
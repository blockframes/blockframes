import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateComponent } from './template.component';
import { FormFactoryModule } from 'ng-form-factory';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
  declarations: [TemplateComponent],
  exports: [TemplateComponent],
  imports: [
    CommonModule,
    FormFactoryModule,
    MatSidenavModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    DragDropModule,
    MatSelectModule, // Required for lazy components
    MatAutocompleteModule, // Required for lazy components
    MatChipsModule, // Required for lazy components
    RouterModule.forChild([{ path: '', component: TemplateComponent }])
  ]
})
export class TemplateModule { }

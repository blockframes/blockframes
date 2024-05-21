import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateComponent } from './template.component';
import { FormFactoryModule } from 'ng-form-factory';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';


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

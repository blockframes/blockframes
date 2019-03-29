// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Components
import { TemplateViewComponent } from './template-view/template-view.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { AddTemplateComponent } from './template-list/add-template';
import { MaterialViewComponent } from '../material/material-view/material-view.component';
import { CategoryListComponent } from './category-list/category-list.component';
// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule
} from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MaterialFormComponent } from '../material/material-form/material-form.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TemplateViewComponent,
    TemplateListComponent,
    AddTemplateComponent,
    MaterialFormComponent,
    CategoryListComponent,
    MaterialViewComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: TemplateListComponent },
      { path: ':templateId', component: TemplateViewComponent }
    ])
  ],
  entryComponents: [AddTemplateComponent]
})
export class TemplateModule {}

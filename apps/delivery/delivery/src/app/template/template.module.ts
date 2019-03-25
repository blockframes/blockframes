// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { TemplateComponent } from './template/template.component';
import { TemplateListComponent, AddTemplateDialog } from './template-list/template-list.component';

// Material
import {MatCardModule} from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatIconModule, MatInputModule, MatMenuModule, MatSidenavModule, MatListModule } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import { TemplateFormComponent } from './template-form/template-form.component';
import { MaterialFormComponent } from '../material/material-form/material-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryListComponent } from './category-list/category-list.component';



@NgModule({
  declarations: [TemplateComponent, TemplateListComponent, AddTemplateDialog, TemplateFormComponent, MaterialFormComponent, CategoryListComponent],
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
      { path: '', component: TemplateComponent },
      { path: 'list', component: TemplateListComponent },
      { path: ':templateId', component: TemplateComponent},
    ])
  ],
  entryComponents: [AddTemplateDialog,],
})
export class TemplateModule { }

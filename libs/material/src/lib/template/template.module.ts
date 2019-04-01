// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Components
import { TemplateViewComponent } from './template-view/template-view.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { AddTemplateComponent } from './template-list/add-template';
import { TemplateGuard } from './guards/template.guard';
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
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryListComponent } from './category-list/category-list.component';
import { MaterialModule } from '../material/material.module';


@NgModule({
  declarations: [
    CategoryListComponent,
    TemplateViewComponent,
    TemplateListComponent,
    AddTemplateComponent,
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
    MaterialModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: TemplateListComponent },
      { path: ':templateId', component: TemplateViewComponent, canActivate: [TemplateGuard] }
    ])
  ],
  entryComponents: [AddTemplateComponent]
})
export class TemplateModule {}

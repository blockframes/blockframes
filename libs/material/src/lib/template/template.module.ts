// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// Components
import { TemplateFormComponent } from './template-form/template-form.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { AddTemplateComponent } from './template-list/add-template';
import { TemplateGuard } from './guards/template.guard';
import { TemplateItemComponent } from './template-item/template-item.component';
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
import { MaterialModule } from '../material/material.module';
import {MatExpansionModule} from '@angular/material/expansion';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: TemplateListComponent },
  { path: ':templateId', component: TemplateFormComponent, canActivate: [TemplateGuard] }
]

@NgModule({
  declarations: [
    TemplateFormComponent,
    TemplateListComponent,
    AddTemplateComponent,
    TemplateItemComponent,
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
    MatExpansionModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [AddTemplateComponent]
})
export class TemplateModule {}

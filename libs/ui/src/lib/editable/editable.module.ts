import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableComponent } from './editable.component';
import { ViewModeDirective } from './view-mode-directive';
import { EditModeDirective } from './edit-mode-directive';

@NgModule({
  declarations: [EditableComponent, ViewModeDirective, EditModeDirective],
  imports: [CommonModule],
  exports: [EditableComponent, ViewModeDirective, EditModeDirective]
})
export class EditableModule {}

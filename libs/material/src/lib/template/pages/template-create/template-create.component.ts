import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';

@Component({
  selector: 'template-create',
  templateUrl: './template-create.component.html',
  styleUrls: ['./template-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreateComponent {

  constructor(private dialog: MatDialog) { }

  public addTemplateDialog(): void {
    this.dialog.open(TemplateAddComponent, {
      width: '400px'
    });
  }

}

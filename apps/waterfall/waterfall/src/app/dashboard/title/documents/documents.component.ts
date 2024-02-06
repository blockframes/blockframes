
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WaterfallDocumentForm } from '@blockframes/waterfall/form/document.form';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';


@Component({
  selector: 'waterfall-title-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {

  documentForm = new WaterfallDocumentForm({ id: '' });

  constructor(
    public shell: DashboardWaterfallShellComponent,
  ) {}


}

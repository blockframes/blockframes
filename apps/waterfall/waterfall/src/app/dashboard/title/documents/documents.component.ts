
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WaterfallContractForm } from '@blockframes/waterfall/form/contract.form';

@Component({
  selector: 'waterfall-title-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {

  contractForm = new WaterfallContractForm({ id: '' });

}

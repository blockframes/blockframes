import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { Invoice } from '@blockframes/contract/invoice/+state/invoice.firestore';
import { createInvoice } from '@blockframes/contract/invoice/+state/invoice.model';


function createInvoiceAdminControls(entity: Partial<Invoice>) {
  const invoice = createInvoice(entity);
  return {
    status: new FormControl(invoice.status),
    // @todo #1832 buyerId
    contractId: new FormControl(invoice.contractId, [
      Validators.required
    ]),
  };
}

type InvoiceAdminControl = ReturnType<typeof createInvoiceAdminControls>;

export class InvoiceAdminForm extends FormEntity<InvoiceAdminControl> {
  constructor(data?: Invoice) {
    super(createInvoiceAdminControls(data));
  }
}

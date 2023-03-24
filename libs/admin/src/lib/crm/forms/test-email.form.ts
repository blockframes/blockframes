import { UntypedFormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createEmailRequest, EmailRequest } from '@blockframes/model';

function createTestEmailControls(entity: Partial<EmailRequest>) {
  const request = createEmailRequest(entity);
  const content = 'text' in request ? { text: new UntypedFormControl(request.text)} : { html: new UntypedFormControl(request.html) };

  return {
    from: new UntypedFormControl(''),
    to: new UntypedFormControl(request.to),
    subject: new UntypedFormControl(request.subject),
    ...content
  };
}

type TestEmailControl = ReturnType<typeof createTestEmailControls>;

export class TestEmailForm extends FormEntity<TestEmailControl> {
  constructor(data?: EmailRequest) {
    super(createTestEmailControls(data));
  }
}

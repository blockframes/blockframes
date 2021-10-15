import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createEmailRequest, EmailRequest } from '@blockframes/utils/emails/utils';

function createTestEmailControls(entity: Partial<EmailRequest>) {
  const request = createEmailRequest(entity);
  const content = 'text' in request ? { text: new FormControl(request.text)} : { html: new FormControl(request.html) };

  return {
    from: new FormControl(''),
    to: new FormControl(request.to),
    subject: new FormControl(request.subject),
    ...content
  };
}

type TestEmailControl = ReturnType<typeof createTestEmailControls>;

export class TestEmailForm extends FormEntity<TestEmailControl> {
  constructor(data?: EmailRequest) {
    super(createTestEmailControls(data));
  }
}

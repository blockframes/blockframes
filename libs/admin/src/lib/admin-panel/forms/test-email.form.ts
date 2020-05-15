import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { createEmailRequest, EmailRequest } from '@blockframes/utils/emails';

function createTestEmailControls(entity: Partial<EmailRequest>) {
  const request = createEmailRequest(entity);
  return {
    to: new FormControl(request.to),
    subject: new FormControl(request.subject),
    text: new FormControl(request.text),
  };
}

type TestEmailControl = ReturnType<typeof createTestEmailControls>;

export class TestEmailForm extends FormEntity<TestEmailControl> {
  constructor(data?: EmailRequest) {
    super(createTestEmailControls(data));
  }
}

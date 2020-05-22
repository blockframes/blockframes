import { ImgRef, createImgRef } from '@blockframes/utils/media/media.firestore'
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { urlValidators } from '@blockframes/utils/form';

function createImgRefControl(reference: ImgRef) {
  const { ref, urls } = createImgRef(reference);
  return {
    ref: new FormControl(ref),
    urls: new FormGroup({
      original: new FormControl(urls.original, urlValidators),
      xs: new FormControl(urls.xs),
      md: new FormControl(urls.md),
      lg: new FormControl(urls.lg)
    }),
  }
}

export type ImgRefControl = ReturnType<typeof createImgRefControl>;

export class ImgRefForm extends FormEntity<ImgRefControl> {
  constructor(reference: Partial<ImgRef> = {}) {
    const imgRef = createImgRef(reference);
    const control = createImgRefControl(imgRef);
    super(control);
  }

  get ref() { return this.get('ref') }
  get urls() { return this.get('urls') }
}

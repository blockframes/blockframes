import { ImgRef, createImgRef } from '../../+state//media.firestore'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { HostedMediaForm } from '../media/media.form';

function createImgRefControl(reference: ImgRef) {
  const imgRef = createImgRef(reference);
  return {
    original: new HostedMediaForm(imgRef.original),
    fallback: new HostedMediaForm(imgRef.fallback),
    xs: new HostedMediaForm(imgRef.xs),
    md: new HostedMediaForm(imgRef.md),
    lg: new HostedMediaForm(imgRef.lg),
  }
}

export type ImgRefControl = ReturnType<typeof createImgRefControl>;

export class ImgRefForm extends FormEntity<ImgRefControl> {
  constructor(reference: Partial<ImgRef> = {}) {
    const imgRef = createImgRef(reference);
    const control = createImgRefControl(imgRef);
    super(control);
  }

  get original() { return this.get('original') }
  get fallback() { return this.get('fallback') }
  get xs() { return this.get('xs') }
  get md() { return this.get('md') }
  get lg() { return this.get('lg') }
}

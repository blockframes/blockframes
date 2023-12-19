
import { WaterfallSource } from '@blockframes/model';
import { FormControl, FormGroup } from '@angular/forms';
import { FormStaticValueArray } from '@blockframes/utils/form';


export type SourceForm = FormGroup<{
  medias: FormStaticValueArray<'medias'>;
  territories: FormStaticValueArray<'territories'>;
  name: FormControl<string>;
}>;

export function createSourceForm(source?: Partial<WaterfallSource>): SourceForm {
  return new FormGroup({
    medias: new FormStaticValueArray<'medias'>(source?.medias ?? [], 'medias'),
    territories: new FormStaticValueArray<'territories'>(source?.territories ?? [], 'territories'),
    name: new FormControl(source?.name ?? ''),
  });
}

export function setSourceFormValue(form: SourceForm, right: Partial<WaterfallSource>) {
  form.controls.medias.setValue(right.medias ?? []);
  form.controls.territories.setValue(right.territories ?? []);
  form.controls.name.setValue(right.name ?? '');
}
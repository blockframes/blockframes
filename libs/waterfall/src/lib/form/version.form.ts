
import { FormControl } from '@angular/forms';
import { Version } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';

function createVersionFormControl(version: Partial<Version>, rightholderIds: string[]) {
  const controls = {
    id: new FormControl<string>(version.id ?? ''),
    default: new FormControl<boolean>(version.default ?? false),
    standalone: new FormControl<boolean>(version.standalone ?? false),
    name: new FormControl<string>(version.name ?? ''),
    description: new FormControl<string>(version.description ?? ''),
    blockIds: new FormControl<string[]>(version.blockIds ?? []),
    rightholderIds: new FormControl<string[]>(rightholderIds),
  };
  return controls;
}

type VersionFormControl = ReturnType<typeof createVersionFormControl>;

export class VersionForm extends FormEntity<VersionFormControl> {
  constructor(version: Partial<Version>, rightholderIds: string[]) {
    super(createVersionFormControl(version, rightholderIds));
  }
}
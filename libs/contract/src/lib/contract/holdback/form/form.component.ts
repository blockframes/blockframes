import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormList } from '@blockframes/utils/form';
import { Holdback } from '../../+state/contract.model';
import { HoldbackForm } from '../form';

@Component({
  selector: 'holdback-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolbackFormComponent {
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media',
    languages: 'Version',
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public form: FormList<Holdback, HoldbackForm>,
  ) { }

}

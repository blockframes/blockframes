
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ImdbImportLogs, MyapimoviesService } from '@blockframes/utils/myapimovies/myapimovies.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'imdb-import',
  templateUrl: './imdb-import.component.html',
  styleUrls: ['./imdb-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImdbImportComponent {

  public form = new FormGroup({
    token: new FormControl('', [Validators.required]),
  });

  public logs$ = new BehaviorSubject<ImdbImportLogs>({
    error: [],
    succes: []
  });

  constructor(
    private myapimoviesService: MyapimoviesService,
    private snackbar: MatSnackBar,
  ) { }

  public importing = false;

  async import() {
    this.importing = true;
    const ref = this.snackbar.open(`Import in progress, please wait..`);

    const ids = [
      /*'tt3675748',
      'tt4029998',
      'tt4062536',
      'tt5041296',
      'tt4016934',
      'tt5462326',
      'tt6266218',
      'tt1974419',
      'tt7715270',
      'tt6958212',
      'tt2396489',
      */'tt7082742',
      /*'tt6869538',
      'tt8368406',
      'tt12715472',
      'tt7160176',
      'tt4547194',
      'tt6301712',
      'tt2315596',
      'tt7087210',
      'tt7334342',
      'tt6820256',
      'tt6751668',
      'tt8351520',
      'tt8639136',
      'tt7329642',*/
      /*'tt7852002',
      'tt4397342',
      'tt6043142',
      'tt8781414',
      'tt7294150',
      'tt6921496',
      'tt8368294',
      'tt10919074',
      'tt0118694',*/
      //'tt10469804',
      //'tt13845758',
      //'tt11358398',
      /*'tt9812474',
      'tt8550054',
      'tt14757872',
      'tt5918982',
      /*'tt12519030',
      'tt13274576',
      'tt13109952',
      'tt0161292',
      'tt0040536',
      'tt0040558',*/
      /* 'tt0040766',
       'tt0047478',
       'tt0067541',
       'tt0059792',*/
    ]

    this.myapimoviesService.token = this.form.get('token').value;

    for (const id of ids) {
      await this.myapimoviesService.createTitle(id);
    }

    ref.dismiss();
    this.importing = false;
    this.logs$.next(this.myapimoviesService.logs);
  }

}

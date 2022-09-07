
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
    imdbIds: new FormControl('', [Validators.required]),
    orgId: new FormControl('', [Validators.required]),
  });

  public logs$ = new BehaviorSubject<ImdbImportLogs>({
    error: [],
    succes: []
  });

  public importing = false;

  constructor(
    private myapimoviesService: MyapimoviesService,
    private snackbar: MatSnackBar,
  ) { }

  async import() {
    this.importing = true;
    const ref = this.snackbar.open('Import in progress, please wait..');

    const { token, imdbIds, orgId } = this.form.value;

    this.myapimoviesService.token = token;

    const ids = imdbIds.split(',').map(id => id.trim()).filter(id => id);

    for (const id of ids) {
      await this.myapimoviesService.createTitle(id, orgId);
    }

    ref.dismiss();
    this.importing = false;
    this.logs$.next(this.myapimoviesService.logs);
  }

}

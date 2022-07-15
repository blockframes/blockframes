
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';

import { ImdbImportLogs, MyapimoviesService } from '@blockframes/utils/myapimovies/myapimovies.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'imdb-import',
  templateUrl: './imdb-import.component.html',
  styleUrls: ['./imdb-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImdbImportComponent implements OnInit {

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
    private orgService: OrganizationService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.form.get('orgId').setValue(this.orgService.org.id);
  }

  async import() {
    this.importing = true;
    const ref = this.snackbar.open(`Import in progress, please wait..`);

    this.myapimoviesService.token = this.form.get('token').value;

    const ids = this.form.get('imdbIds').value.split(',').map(id => id.trim());
    const orgId = this.form.get('orgId').value;

    for (const id of ids) {
      await this.myapimoviesService.createTitle(id, orgId);
    }

    ref.dismiss();
    this.importing = false;
    this.logs$.next(this.myapimoviesService.logs);
  }

}

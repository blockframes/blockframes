import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnalyticsService } from '@blockframes/analytics/service';
import { AuthService } from '@blockframes/auth/service';
import { MovieService } from '@blockframes/movie/service';
import { FormStaticValueArray } from '@blockframes/utils/form';
import { CallableFunctions } from 'ngfire';
import { App, RequestAskingPriceData, smartJoin, toGroupLabel } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'movie-request-asking-price',
  templateUrl: './request-asking-price.component.html',
  styleUrls: ['./request-asking-price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestAskingPriceComponent {

  form: UntypedFormGroup;
  sending = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialogRef<RequestAskingPriceComponent>,
    private functions: CallableFunctions,
    private snackbar: MatSnackBar,
    private analytics: AnalyticsService,
    private titleService: MovieService,
    @Inject(APP) private app: App,
    @Inject(MAT_DIALOG_DATA) public data: { movieId: string, enhanced?: boolean }
  ) {

    this.form = new UntypedFormGroup({
      territories: new FormStaticValueArray<'territories'>([], 'territories', [Validators.required]),
      message: new UntypedFormControl()
    });

    if (data.enhanced) {
      this.form = new UntypedFormGroup({
        territories: new FormStaticValueArray<'territories'>([], 'territories', [Validators.required]),
        medias: new FormStaticValueArray<'medias'>([], 'medias', [Validators.required]),
        exclusive: new UntypedFormControl(true, Validators.required),
      });
    }
  }

  async send() {
    try {
      this.sending = true;
      this.form.disable();

      const groupedTerritories = toGroupLabel(this.form.get('territories').value, 'territories', 'World');
      const territories = smartJoin(groupedTerritories, ', ', ' and ');

      const requestData: RequestAskingPriceData = {
        movieId: this.data.movieId,
        uid: this.authService.uid,
        territories,
        app: this.app
      }

      if (this.hasControl('message')) {
        requestData.message = this.form.get('message').value ?? 'No message provided.';
      }

      if (this.hasControl('medias')) {
        const groupedMedias = toGroupLabel(this.form.get('medias').value, 'medias', 'All Rights');
        requestData.medias = smartJoin(groupedMedias, ', ', ' and ');
      }

      if (this.hasControl('exclusive')) {
        requestData.exclusive = !!this.form.get('medias').value;
      }

      await this.functions.call<RequestAskingPriceData, unknown>('requestAskingPrice', requestData);

      const title = await this.titleService.load(this.data.movieId);
      this.analytics.addTitle('askingPriceRequested', title);
      this.snackbar.open('Asking price request successfully sent.', '', { duration: 3000 });
      this.dialog.close(true);
    } catch (err) {
      this.form.enable();
      this.sending = false;
      console.error(err);
    }
  }

  close() {
    this.dialog.close(false);
  }

  public hasControl(key: string) {
    return !!this.form.controls[key];
  }
}
import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthQuery } from "@blockframes/auth/+state";
import { FireAnalytics } from "@blockframes/utils/analytics/app-analytics";
import { FormStaticValueArray } from "@blockframes/utils/form";
import { toLabel } from "@blockframes/utils/pipes/to-label.pipe";

@Component({
  selector: 'movie-request-asking-price',
  templateUrl: './request-asking-price.component.html',
  styleUrls: ['./request-asking-price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestAskingPriceComponent {

  form = new FormGroup({
    territories: new FormStaticValueArray<'territories'>([], 'territories', [Validators.required]),
    message: new FormControl()
  });

  constructor(
    private authQuery: AuthQuery,
    private dialog: MatDialogRef<RequestAskingPriceComponent>,
    private functions: AngularFireFunctions,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    @Inject(MAT_DIALOG_DATA) public data: { movieId: string }
  ) {}

  async send() {
    try {
      this.form.disable();
      const territories = toLabel(this.form.get('territories').value, 'territories', ', ', ' and ');
      const message = this.form.get('message').value ?? 'No message provided.';
      const f = this.functions.httpsCallable('requestAskingPrice');
      await f({
        movieId: this.data.movieId,
        uid: this.authQuery.userId,
        territories,
        message
      }).toPromise();
      this.analytics.event('askingPriceRequested', {
        movieId: this.data.movieId,
        territories
      });
      this.snackbar.open('Asking price request successfully sent.', '', { duration: 3000 });
      this.dialog.close(true);
    } catch (err) {
      this.form.enable();
      console.error(err);
    }
  }

  close() {
    this.dialog.close(false);
  }
}
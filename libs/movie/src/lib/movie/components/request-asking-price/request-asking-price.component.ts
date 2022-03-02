import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AnalyticsService } from "@blockframes/analytics/+state/analytics.service";
import { AuthService } from "@blockframes/auth/+state";
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
    private authService: AuthService,
    private dialog: MatDialogRef<RequestAskingPriceComponent>,
    private functions: AngularFireFunctions,
    private snackbar: MatSnackBar,
    private analytics: AnalyticsService,
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
        uid: this.authService.uid,
        territories,
        message
      }).toPromise();
      this.analytics.addTitleEvent('askingPriceRequested', this.data.movieId);
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
import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { Functions, httpsCallable } from "@angular/fire/functions";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AnalyticsService } from "@blockframes/analytics/+state/analytics.service";
import { AuthService } from "@blockframes/auth/+state";
import { MovieService } from "@blockframes/movie/+state/movie.service";
import { FormStaticValueArray } from "@blockframes/utils/form";
import { toGroupLabel } from "@blockframes/utils/pipes";
import { smartJoin } from "@blockframes/utils/utils";
import { take } from "rxjs";

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
  sending = false;
  constructor(
    private authService: AuthService,
    private dialog: MatDialogRef<RequestAskingPriceComponent>,
    private functions: Functions,
    private snackbar: MatSnackBar,
    private analytics: AnalyticsService,
    private titleService: MovieService,
    @Inject(MAT_DIALOG_DATA) public data: { movieId: string }
  ) { }

  async send() {
    try {
      this.sending = true;
      this.form.disable();
      const groupedTerritories = toGroupLabel(this.form.get('territories').value, 'territories', 'World');
      const territories = smartJoin(groupedTerritories, ', ', ' and ');
      const message = this.form.get('message').value ?? 'No message provided.';
      const f = httpsCallable<{ movieId: string, uid: string, territories: string, message: string }>(this.functions, 'requestAskingPrice');
      await f({
        movieId: this.data.movieId,
        uid: this.authService.uid,
        territories,
        message
      });
      const title = await this.titleService.valueChanges(this.data.movieId).pipe(take(1)).toPromise();
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
}
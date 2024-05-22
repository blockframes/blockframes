import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatLegacySnackBarRef as MatSnackBarRef, MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'snackbar-error',
  templateUrl: './snackbar-error.component.html',
  styleUrls: ['./snackbar-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarErrorComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public message: string
  ) { }

  refresh() {
    window.location.reload();
  }
}

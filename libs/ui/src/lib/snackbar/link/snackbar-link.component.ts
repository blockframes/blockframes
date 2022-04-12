import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'snackbar-link',
  templateUrl: './snackbar-link.component.html',
  styleUrls: ['./snackbar-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarLinkComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarLinkComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, link: string[], linkName: string },
  ) { }
}

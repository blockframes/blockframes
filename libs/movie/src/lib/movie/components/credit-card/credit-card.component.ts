import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Credit, Filmography } from '@blockframes/utils/common-interfaces';

@Component({
  selector: 'title-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditCardComponent {
  @Input() credit: Credit;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;

  constructor(private dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(this.dialogRef, { maxWidth: 400 });
  }

}


@Pipe({ name: 'filmography' })
export class FilmographyPipe implements PipeTransform {
  transform(filmography?: Filmography) {
    return filmography
      ? `${filmography.title} (${filmography.year})`
      : '-'
  }
}
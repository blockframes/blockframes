import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Credit, Director, Filmography } from '@blockframes/shared/model';

@Component({
  selector: 'title-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditCardComponent {
  icon = 'check';
  @Input() credit: Credit | Director;
  @Input() type: 'director' | 'crew' | 'cast';
  @ViewChild('dialogRef') dialogRef: TemplateRef<any>;

  constructor(private dialog: MatDialog) {}

  openDialog() {
    if (this.credit.description.length >= 125) {
      this.dialog.open(this.dialogRef, { maxWidth: 400, maxHeight: '80vh' });
    }
  }
}

@Pipe({ name: 'statusIcon' })
export class StatusIconPipe implements PipeTransform {
  transform(role?: Credit['role']) {
    switch (role) {
      case 'confirmed':
        return 'check_circle';
      case 'target':
        return 'estimated';
      case 'looselyAttached':
        return 'unpublished';
      default:
        return '';
    }
  }
}

@Pipe({ name: 'emptyImg' })
export class EmptyImgPipe implements PipeTransform {
  transform(type: 'director' | 'crew' | 'cast') {
    switch (type) {
      case 'director':
        return 'empty_director_description.svg';
      case 'crew':
        return 'empty_crew_description.svg';
      case 'cast':
        return 'empty_cast_description.svg';
    }
  }
}

// there are always 3 films so we need to verify if at lease one has a title
@Pipe({ name: 'hasFilmography' })
export class HasFilmographyPipe implements PipeTransform {
  transform(filmography: Filmography[]) {
    return filmography.some(film => film.title);
  }
}

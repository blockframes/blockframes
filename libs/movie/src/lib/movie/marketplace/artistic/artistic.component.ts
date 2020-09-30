import { Component, ChangeDetectionStrategy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MovieNote } from '@blockframes/movie/+state/movie.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisticComponent implements OnInit {

  public movie$ = this.shell.movie$;

  constructor(
    private shell: TitleMarketplaceShellComponent,
    private dynTitle: DynamicTitleService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Artistic Info');
  }
}

@Pipe({ name: 'noteName' })
export class NoteNamePipe implements PipeTransform {
  transform(note: MovieNote) {
    const role = note.role ? `(${note.role})` : '';
    return [note.firstName, note.lastName, role].filter(v => !!v).join(' ');
  }
}


import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FileMetaData } from '@blockframes/media/+state/media.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { MovieFormShellComponent } from '../shell/shell.component';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'movie-form-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFilesComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');

  movieId = this.route.snapshot.params.movieId;

  storagePaths: Record<string, string> = {
    presentationDeck: `public/movies/${this.movieId}/presentationDeck`,
  };

  metadatas: Record<string, BehaviorSubject<FileMetaData>> = {
    presentationDeck: new BehaviorSubject({
      privacy: 'public',
      collection: 'movies',
      docId: this.movieId,
      field: 'promotional.presentation_deck',
      uid: '',
    }),
  };

  extradatas: Record<string, any> = {
    presentationDeck: new FormEntity({
      misc: new FormControl(this.form.promotional.get('presentation_deck').get('misc').value),
    }),
  };

  private sub: Subscription;
  private sub0: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Files');
  }

  ngOnInit() {
    this.sub = this.extradatas.presentationDeck.valueChanges.subscribe(v => {
      console.log(v); // TODO REMOVE DEBUG LOG

      const newMeta = this.metadatas.presentationDeck.getValue();
      newMeta.misc = v.misc;
      this.metadatas.presentationDeck.next(newMeta);


      // update parent form only if file already exists,
      // i.e. we don't want to update extra data on a non-existing file
      const storagePath = this.form.promotional.get('presentation_deck').get('storagePath').value;
      if (!!storagePath) {
        console.log('should update parent form', storagePath, this.form.promotional.get('presentation_deck'));
        this.form.promotional.get('presentation_deck').get('misc')
          .setValue(this.extradatas.presentationDeck.get('misc').value);
      }
    });

    this.sub0 = this.form.valueChanges.subscribe(v => console.log('parent', v));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.sub0?.unsubscribe();
  }

  public getPath(filePath: 'presentation_deck' | 'scenario' | 'moodboard') {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.${filePath}/`;
  }

}

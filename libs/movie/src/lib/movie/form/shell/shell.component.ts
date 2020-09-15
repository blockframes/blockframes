// Angular
import { Component, ChangeDetectionStrategy, OnInit, Input, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

// Blockframes
import { MovieService, MovieQuery, Movie } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { TunnelRoot, TunnelConfirmComponent, TunnelStep } from '@blockframes/ui/tunnel';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { MediaService } from '@blockframes/media/+state/media.service';
import { mergeDeep } from '@blockframes/utils/helpers';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { switchMap, map } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

function getSteps(status: FormControl): TunnelStep[] {
  return [{
    title: 'First Step',
    icon: 'home',
    time: 2,
    routes: [{ path: 'title-status', label: 'First Step' }],
  },
  {
    title: 'Title Information',
    icon: 'document',
    time: 15,
    routes: [{
      path: 'main',
      label: 'Main Information'
    }, {
      path: 'story-elements',
      label: 'Storyline Elements'
    }, {
      path: 'production',
      label: 'Production Information'
    }, {
      path: 'artistic',
      label: 'Artistic Team'
    }, {
      path: 'reviews',
      label: 'Selection & Reviews'
    }, {
      path: 'additional-information',
      label: 'Additional Information'
    }, {
      path: 'technical-info',
      label: 'Technical Information'
    }, {
      path: 'available-materials',
      label: 'Available Materials',
      shouldDisplay: status.valueChanges.pipe(map(prodStatus => prodStatus === 'financing')),
    }]
  }, {
    title: 'Promotional Elements',
    icon: 'import',
    time: 10,
    routes: [
      {
        path: 'media-files',
        label: 'Files'
      }, {
        path: 'media-images',
        label: 'Images'
      }, {
        path: 'media-videos',
        label: 'Videos'
      }
    ]
  }, {
    title: 'Summary',
    icon: 'send',
    time: 3,
    routes: [{
      path: 'summary',
      label: 'Summary & Submission'
    }]
  }]
}

@Component({
  selector: 'movie-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShellComponent implements TunnelRoot, OnInit, AfterViewInit, OnDestroy {
  @Input() form = new MovieForm(this.query.getActive());
  @Input() steps: TunnelStep[];

  public exitRoute: string;
  private sub: Subscription;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private service: MovieService,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private mediaService: MediaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.exitRoute = `../../../title/${this.query.getActiveId()}`;
    this.steps = getSteps(this.form.get('productionStatus'));
  }

  ngAfterViewInit() {
    this.sub = this.route.fragment.subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);
      el?.scrollIntoView(
        {
          behavior: 'smooth',
          block: 'center',
          inline: 'start',
        }
      );
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private checkIfElementIsReady(id: string) {
    return new Promise<HTMLElement>((resolve, _) => {
      const el = this.doc.getElementById(id);
      if (el) {
        resolve(el);
      }
      new MutationObserver((_, observer) => {
        resolve(this.doc.getElementById(id));
      }).observe(this.doc.documentElement, {childList: true, subtree: true});
    })
  }

  // Should save movie
  public async save() {

    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);

    const movie: Movie = mergeDeep(this.query.getActive(), documentToUpdate);

    await this.service.update(movie.id, movie);
    this.mediaService.uploadOrDeleteMedia(mediasToUpload);

    this.form.markAsPristine();
    await this.snackBar.open('Title saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    if (this.form.pristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => shouldSave ? this.save() : of(false))
    );
  }
}

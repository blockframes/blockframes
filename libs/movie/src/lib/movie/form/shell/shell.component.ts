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
import { switchMap, map, startWith, filter } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ProductionStatus, staticConsts } from '@blockframes/utils/static-model';

function getSteps(statusCtrl: FormControl, appSteps: TunnelStep[] = []): TunnelStep[] {
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
      path: 'shooting-information',
      label: 'Shooting Information'
    }, {
      path: 'technical-spec',
      label: 'Technical Specification'
    }, {
      path: 'available-materials',
      label: 'Available Materials',
      shouldDisplay: isStatus(statusCtrl, ['development'])
    }]
  }, {
    title: 'Promotional Elements',
    icon: 'import',
    time: 10,
    routes: [
      {
        path: 'sales-pitch',
        label: 'Sales Pitch'
      }, {
        path: 'media-files',
        label: 'Files'
      }, {
        path: 'media-notes',
        label: 'Notes & Statements',
        shouldDisplay: isStatus(statusCtrl, ['post_production', 'finished', 'released'])
      },
      {
        path: 'media-images',
        label: 'Images'
      }, {
        path: 'media-videos',
        label: 'Videos'
      }
    ]
  },
  ...appSteps,
  {
    title: 'Summary',
    icon: 'send',
    time: 3,
    routes: [{
      path: 'summary',
      label: 'Summary & Submission'
    }]
  }]
}

function isStatus(prodStatusCtrl: FormControl, acceptableStatus: ProductionStatus[]) {
  return prodStatusCtrl.valueChanges.pipe(
    startWith(prodStatusCtrl.value),
    map(prodStatus => acceptableStatus.includes(prodStatus))
  )
}

const valueByProdStatus: Record<keyof typeof staticConsts['productionStatus'], Record<string, string>> = {
  development: {
    'release.status': '',
    "runningTime.status": ''
  },
  shooting: {
    'release.status': '',
    "runningTime.status": ''
  },
  post_production: {
    'release.status': '',
    "runningTime.status": ''
  },
  finished: {
    'release.status': 'confirmed',
    "runningTime.status": 'confirmed'
  },
  released: {
    'release.status': 'confirmed',
    "runningTime.status": 'confirmed'
  }
}

@Component({
  selector: 'movie-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShellComponent implements TunnelRoot, OnInit, AfterViewInit, OnDestroy {
  form = new MovieForm(this.query.getActive());
  steps: TunnelStep[];

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
  ) { }

  ngOnInit() {
    this.exitRoute = `../../../title/${this.query.getActiveId()}`;
    const appSteps = this.route.snapshot.data.appSteps;
    this.steps = getSteps(this.form.get('productionStatus'),appSteps);
    this.sub = this.form.productionStatus.valueChanges.pipe(startWith(this.form.productionStatus.value),
      filter(status => !!status)).subscribe(status => {
        const pathToUpdate = Object.keys(valueByProdStatus[status]);
        pathToUpdate.forEach(path => this.form.get(path as any).setValue(valueByProdStatus[status][path]));
      })
  }

  ngAfterViewInit() {
    const routerSub = this.route.fragment.subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);
      el?.scrollIntoView(
        {
          behavior: 'smooth',
          block: 'center',
          inline: 'start',
        }
      );
    });
    this.sub.add(routerSub);
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
      }).observe(this.doc.documentElement, { childList: true, subtree: true });
    })
  }

  // Should save movie
  public async save() {
    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.form);
    const movie: Movie = mergeDeep(this.query.getActive(), documentToUpdate);
    await this.service.update(movie.id, movie);
    this.mediaService.uploadMedias(mediasToUpload);
    console.log(movie)
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
      switchMap(shouldSave => {
        /* Undefined means, user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false)
        }
        return shouldSave ? this.save() : of(true)
      })
    );
  }
}

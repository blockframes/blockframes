import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { GetKeys, Movie, Territory } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { combineLatest, Observable, map } from 'rxjs';
import { orderBy, where } from 'firebase/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { EntityControl, FormEntity, FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { MovieSearch, Versions } from '@blockframes/movie/form/search.form';

interface LanguageVersion {
  languages: GetKeys<'languages'>[],
  versions: Versions
}

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;
  private searchForm = new FormGroup({
    festivals: new FormStaticValueArray<'festival'>([], 'festival'),
    genres: FormList.factory<GetKeys<'genres'>>([]),
    languages: new FormEntity<EntityControl<LanguageVersion>, LanguageVersion>({
      languages: FormList.factory<GetKeys<'languages'>>([]),
      versions: new FormEntity<EntityControl<Versions>, Versions>({
        original: new FormControl(false),
        dubbed: new FormControl(false),
        subtitle: new FormControl(false),
        caption: new FormControl(false)
      })
    }),
    minBudget: new FormControl(0),
    minReleaseYear: new FormControl(0),
    originCountries: FormList.factory<Territory>([]),
    productionStatus: new FormStaticValueArray<'productionStatus'>([], 'productionStatus'),
    certifications: new FormStaticValueArray<'certifications'>([], 'certifications')
  });
  private searchForm$ = this.searchForm.valueChanges;
  private searchInitialValues = {
    festivals: [],
    genres: [],
    languages: {
      languages: [],
      versions: {
        original: false,
        dubbed: false,
        subtitle: false,
        caption: false
      }
    },
    minBudget: 0,
    minReleaseYear: 0,
    originCountries: [],
    productionStatus: [],
    certifications: []
  }
  public festivals = this.searchForm.controls.festivals;
  public genres = this.searchForm.controls.genres;
  public languages = this.searchForm.controls.languages;
  public minBudget = this.searchForm.controls.minBudget;
  public minReleaseYear = this.searchForm.controls.minReleaseYear;
  public originCountries = this.searchForm.controls.originCountries;
  public productionStatus = this.searchForm.controls.productionStatus;
  public certifications = this.searchForm.controls.certifications;

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    const titles$ = this.parent.org$.pipe(
      switchMap((org) => {
        return this.service.valueChanges([
          where('orgIds', 'array-contains', org.id),
          where('app.festival.status', '==', 'accepted'),
          where('app.festival.access', '==', true),
          orderBy('_meta.createdAt', 'desc')
        ]);
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    const searchForm$ = this.searchForm$.pipe(
      startWith(this.searchInitialValues),
      distinctUntilChanged(),
      debounceTime(500)
    );

    this.titles$ = combineLatest([titles$, searchForm$]).pipe(
      map(([movies, search]: [Movie[], MovieSearch]) => movies.filter(movie => {
        const haveFestivals = search.festivals.every(festival => movie.prizes.map(p => p.name).includes(festival));
        const haveGenres = search.genres.every(genre => movie.genres.includes(genre));
        const haveLanguages = search.languages.languages.every(lang => {
          let bool = false;
          for (const version in search.languages.versions) {
            if (search.languages.versions[version]) {
              if (
                version !== "original" &&
                search.languages.versions[version] === movie.languages[lang][version]
              ) bool = true;
              else if (
                version === "original" &&
                search.languages.languages.every(lang => movie.originalLanguages.includes(lang))
              ) bool = true;
            }
          }
          return bool;
        });
        const haveMinBudget = search.minBudget <= (movie.estimatedBudget || 0);
        const haveMinReleaseYear = search.minReleaseYear <= (movie.release.year || 0);
        const haveOriginCountries = search.originCountries.every(country => movie.originCountries.includes(country));
        const haveProductionStatus = () => {
          if (search.productionStatus.length) {
            return search.productionStatus.some(status => movie.productionStatus === status);
          }
          return true;
        }
        const haveCertifications = search.certifications.every(certification => movie.certifications.includes(certification));

        return haveFestivals && haveGenres && haveLanguages && haveMinBudget && haveMinReleaseYear && haveOriginCountries && haveProductionStatus() && haveCertifications;
      }))
    );
  }

  clear() {
    this.searchForm.reset(this.searchInitialValues);
  }
}

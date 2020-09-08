import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExtractCode, getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie, MovieStakeholders } from '@blockframes/movie/+state/movie.model';

const promoLinks = [
  'promo_reel_link', 'scenario', 'screener_link', 'teaser_link', 'presentation_deck', 'trailer_link'
]
@Component({
  selector: 'catalog-movie-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieMainComponent {
  public movie$ = this.movieQuery.selectActive();
  public loading$ = this.movieQuery.selectLoading();
  promoLinks = promoLinks;
  constructor(private movieQuery: MovieQuery) { }

  public hasLink({ promotional }: Movie): boolean {
    return this.promoLinks.some(link => !!promotional[link]);
  }

  public getLink(movie: Movie, link: ExtractCode<'PROMOTIONAL_ELEMENT_TYPES'>) {
    if(!!movie.promotional[link]) {
      const isDownload = link === 'scenario' || link === 'presentation_deck';
      const isAccent = link === 'scenario' || link === 'promo_reel_link'
      return {
        url: movie.promotional[link],
        icon: isDownload ? 'download' : 'play',
        label: isDownload ? `Download ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}` : `Watch ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`,
        color: isAccent ? 'accent' : 'primary'
      }
    }
  }

  public hasStory({ synopsis, keywords, keyAssets }: Movie): boolean {
    return !!(synopsis || keywords.length > 0 || keyAssets)
  }

  public getPrize(prize) {
    const festivalInfo = `${prize.name}  ${prize.year}`;
    const premiere = `${prize.premiere} Premiere`;
    return [festivalInfo, prize.prize , prize.premiere ? premiere : null].filter(value => !!value).join(' | ');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: keyof MovieStakeholders) {
    return movie.stakeholders[role].map(stakeholder => {
      return (stakeholder.countries && !!stakeholder.countries.length)
        ? `${stakeholder.displayName} (${stakeholder.countries.map(country => getLabelBySlug('TERRITORIES', country))})`
        :  stakeholder.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string) {
    return movie.cast[role].map(cast => {
      return (cast.role && !! cast.role.length)
      ? `${cast.firstName} ${cast.lastName} (${cast.role})`
      : `${cast.firstName} ${cast.lastName}`
    })
  }

  public hasBudget({ boxOffice, rating, certifications, review}: Movie): boolean {
    return !!(
      boxOffice.length ||
      certifications.length ||
      rating.length ||
      review.length
    )
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

}

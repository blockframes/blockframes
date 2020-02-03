import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { ExtractCode, getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

const promo_links = [
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
  promo_links = promo_links;
  constructor(private movieQuery: MovieQuery) { }

  public hasLink({ promotionalElements }: Movie): boolean {
    return this.promo_links.some(link => {
      if(promotionalElements[link].media.url) {
        return true;
      }
    })
  }

  public getLink(movie: Movie, link: ExtractCode<'PROMOTIONAL_ELEMENT_TYPES'>) {
    if(movie.promotionalElements[link].media.url) {
      if(link === 'scenario' || link === 'presentation_deck' ) {
        return { 
          url: movie.promotionalElements[link].media.url, 
          icon: 'download',
          label: getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)
        }
      }
      return { 
        url: movie.promotionalElements[link].media.url, 
        icon: 'play',
        label: getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)
      }
    }
    return;
  }

  public hasStory({ story, promotionalDescription }: Movie): boolean {
    return !!(story.synopsis || promotionalDescription.keywords.length > 0 || promotionalDescription.keyAssets)
  }

  public getPrize(prize) {
    return [`${prize.name}  ${prize.year}`, prize.prize,prize.premiere].join(' | ');
  }
  
  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getStakeholder(movie: Movie, role: string) {
    return movie.main.stakeholders[role].map(stakeholder => {
      return (stakeholder.countries && !!stakeholder.countries.length)
        ? `${stakeholder.displayName} (${stakeholder.countries})`
        :  stakeholder.displayName;
    }).join(', ');
  }

  public getSalesCast(movie: Movie, role: string) {
    return movie.salesCast[role].map(cast => {
      return (cast.role && !! cast.role.length)
      ? `${cast.firstName} ${cast.lastName} (${cast.role})`
      : `${cast.firstName} ${cast.lastName}`
    })
  }

  public hasBudget({ budget, salesInfo, movieReview}: Movie): boolean {
    return !!(budget.estimatedBudget ||
       budget.boxOffice.length > 0 ||
       salesInfo.certifications.length > 0||
       salesInfo.rating.length > 0||
       movieReview.length > 0)
  }

  public budgetRange({ from, to }) {
    return (from && to) ? `$ ${from} - ${to}` : '';
  }

}

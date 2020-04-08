import { algolia } from '@env';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { AlgoliaAutocompleteModule } from './algolia-autocomplete.module';

export default {
  title: 'Algolia Autocomplete'
};

export const algoliaAutocomplete = () => ({
  moduleMetadata: { imports: [AlgoliaAutocompleteModule, ToolkitModule] },
  name: 'Algolia Autocomplete',
  template: `
    <storybook-toolkit>
      <h1 title>Algolia Autocomplete</h1>
       <algolia-autocomplete [indexName]="indexName" pathToValue="movie.title.international"
       displayWithPath="movie.title.original" [icons]="['cross', 'magnifying_glasses']">
        <ng-template let-result>
          {{ result.title.international }}
        </ng-template>
       </algolia-autocomplete>
    </storybook-toolkit>
  `,
  props: {
    indexName: algolia.indexNameMovies
  }
});

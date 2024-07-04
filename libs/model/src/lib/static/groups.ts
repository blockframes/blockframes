import { SupportedLanguages } from '../utils';
import { GetKeys, staticModel } from './static-model';
import { staticModeli18n } from './static-model-i18n';
import { MediaGroup, MediaGroupValue, TerritoryGroup, TerritoryGroupValue } from './types';

export type GroupScope = keyof typeof staticGroups;

export interface StaticGroup<S extends GroupScope = any> {
  key: MediaGroup | TerritoryGroup;
  label: MediaGroupValue | TerritoryGroupValue;
  items: Extract<GetKeys<S>, string>[];
}

export const mediasGroup: StaticGroup<'medias'>[] = [{
  key: 'tv',
  label: 'TV',
  items: ['payTv', 'freeTv', 'payPerView'],
}, {
  key: 'vod',
  label: 'VOD',
  items: ['est', 'nVod', 'aVod', 'fVod', 'sVod', 'tVod']
}, {
  key: 'ancillary',
  label: 'Ancillary Rights',
  items: ['boats', 'inflight', 'hotels', 'educational']
}, {
  key: 'homeVideo',
  label: 'Video (DVD, Blu-Ray)',
  items: ['rental', 'through', 'otherVideo']
}, {
  key: 'festivals',
  label: 'Festivals',
  items: ['festival']
}, {
  key: 'theatrical',
  label: 'Theatrical Rights',
  items: ['theatrical', 'nonTheatrical', 'otherTheatrical']
}, {
  key: 'derivative',
  label: 'Derivative Rights',
  items: ['merchandising', 'music', 'remake', 'multimedia', 'multimediaExtract', 'tvExtract']
}];

export const waterfallMediaGroups: MediaGroup[] = ['theatrical', 'derivative'];

export const territoriesGroup: StaticGroup<'territories'>[] = [
  {
    key: 'africa',
    label: "Africa",
    items: [
      "algeria",
      "angola",
      "benin",
      "botswana",
      "british-indian-ocean-territory",
      "burkina",
      "burundi",
      "cabo-verde",
      "cameroon",
      "central-african-republic",
      "chad",
      "comoros",
      "congo",
      "congo-democratic-republic",
      "djibouti",
      "equatorial-guinea",
      "eritrea",
      "eswatini",
      "ethiopia",
      "french-southern-territories",
      "gabon",
      "gambia",
      "ghana",
      "guinea",
      "guinea-bissau",
      "ivory-coast-cote-d-ivoire",
      "kenya",
      "lesotho",
      "liberia",
      "libya",
      "madagascar",
      "malawi",
      "mali",
      "mauritania",
      "mauritius",
      "morocco",
      "mozambique",
      "namibia",
      "niger",
      "nigeria",
      "rwanda",
      "saint-helena-ascension-and-tristan-da-cunha",
      "sao-tome-and-principe",
      "senegal",
      "seychelles",
      "sierra-leone",
      "somalia",
      "somaliland",
      "south-africa",
      "tanzania",
      "togo",
      "tunisia",
      "uganda",
      "western-sahara",
      "zambia",
      "zimbabwe",
    ],
  },

  {
    key: 'asia',
    label: "Asia",
    items: [
      "afghanistan",
      "bangladesh",
      "bhutan",
      "brunei",
      "cambodia",
      "china",
      "cyprus",
      "georgia",
      "hong-kong",
      "india",
      "indonesia",
      "japan",
      "north-korea",
      "south-korea",
      "laos",
      "macao",
      "malaysia",
      "maldives",
      "myanmar",
      "nepal",
      "northern-cyprus",
      "pakistan",
      "philippines",
      "singapore",
      "sri-lanka",
      "taiwan",
      "thailand",
      "timor-leste",
      "vietnam",
    ]
  },

  {
    key: 'caribbean',
    label: "Caribbean",
    items: [
      "aruba",
      "anguilla-&-barbuda",
      "antigua-and-barbuda",
      "bahamas",
      "barbados",
      "bouvet-island",
      "cayman-islands",
      "cuba",
      "curacao",
      "dominica",
      "dominican-republic",
      "falkland-islands",
      "grenada",
      "haiti",
      "jamaica",
      "martinique",
      "montserrat",
      "puerto-rico",
      "saint-barthelemy",
      "saint-kitts-and-nevis",
      "saint-lucia",
      "saint-martin-french",
      "saint-vincent-and-the-grenadines",
      "saint-martin-dutch",
      "south-georgia",
      "trinidad-and-tobago",
      "turks-and-caicos-islands",
      "virgin-islands-uk",
      "virgin-islands-us",
    ],
  },

  {
    key: 'cis',
    label: "CIS",
    items: [
      "armenia",
      "azerbaijan",
      "belarus",
      "kazakhstan",
      "kyrgyzstan",
      "moldova",
      "mongolia",
      "russia",
      "tajikistan",
      "turkmenistan",
      "uzbekistan",
    ],
  },

  {
    key: 'europe',
    label: "Europe",
    items: [
      "aland-islands",
      "albania",
      "andorra",
      "austria",
      "belgium",
      "bosnia-and-herzegovina",
      "bulgaria",
      "croatia",
      "czech",
      "denmark",
      "estonia",
      "faroe-islands",
      "finland",
      "france",
      "germany",
      "greece",
      "guernsey",
      "vatican",
      "holy-see",
      "hungary",
      "iceland",
      "ireland",
      "isle-of-man",
      "italy",
      "jersey",
      "kosovo",
      "latvia",
      "liechtenstein",
      "lithuania",
      "luxembourg",
      "malta",
      "monaco",
      "montenegro",
      "netherlands",
      "north-macedonia",
      "norway",
      "poland",
      "portugal",
      "romania",
      "san-marino",
      "serbia",
      "slovakia",
      "slovenia",
      "spain",
      "sweden",
      "switzerland",
      "ukraine",
      "united-kingdom",
    ],
  },

  {
    key: 'latinAmerica',
    label: "Latin America",
    items: [
      "argentina",
      "belize",
      "bolivia",
      "brazil",
      "chile",
      "colombia",
      "costa-rica",
      "ecuador",
      "el-salvador",
      "guatemala",
      "guyana",
      "honduras",
      "mexico",
      "nicaragua",
      "panama",
      "paraguay",
      "peru",
      "suriname",
      "uruguay",
      "venezuela",
    ],
  },

  {
    key: 'middleEast',
    label: "Middle East",
    items: [
      "bahrain",
      "egypt",
      "iran",
      "iraq",
      "israel",
      "jordan",
      "kuwait",
      "lebanon",
      "oman",
      "palestine",
      "qatar",
      "saudi-arabia",
      "south-sudan",
      "sudan",
      "syria",
      "turkey",
      "united-arab-emirates",
      "yemen",
    ],
  },

  {
    key: 'northAmerica',
    label: "North America",
    items: [
      "bermuda",
      "canada",
      "greenland",
      "saint-pierre-and-miquelon",
      "united-states-of-america",
    ],
  },

  {
    key: 'oceania',
    label: "Oceania",
    items: [
      "american-samoa",
      "australia",
      "cook-islands",
      "fiji",
      "french-polynesia",
      "guam",
      "heard-island-and-mcdonald-islands",
      "kiribati",
      "marshall",
      "micronesia",
      "midway-islands",
      "nauru",
      "new-caledonia",
      "new-zealand",
      "niue",
      "norfolk-island",
      "northern-mariana-islands",
      "palau",
      "papua",
      "pitcairn",
      "samoa",
      "solomon-islands",
      "tonga",
      "vanuatu",
      "wallis-and-futuna",
    ],
  }
]

export const staticGroups = {
  medias: mediasGroup,
  territories: territoriesGroup
}

export function getStaticGroups(scope: GroupScope, lang?: SupportedLanguages): StaticGroup[] {
  const group = staticGroups[scope];
  const scopeLabels = scope === 'medias' ? 'mediaGroup' : 'territoryGroup';
  const labels = (lang && staticModeli18n[lang] && staticModeli18n[lang][scopeLabels]) ? staticModeli18n[lang][scopeLabels] : undefined;

  return group.map(g => ({ ...g, label: labels ? labels[g.key] : g.label }));
}

export function toGroupLabel(value: string[], scope: GroupScope, all?: string, lang?: SupportedLanguages) {

  const groups: StaticGroup[] = getStaticGroups(scope, lang);

  const allItems = groups.reduce((items, group) => items.concat(group.items), []);

  if (allItems.length === value.length) return [all];

  return groups.map(group => {
    const items = [];
    for (const item of group.items) {
      if (value.includes(item)) {
        const value = (lang && staticModeli18n[lang] && staticModeli18n[lang][scope]) ? staticModeli18n[lang][scope][item] : staticModel[scope][item];
        items.push(value);
      }
    }
    return items.length === group.items.length
      ? group.label
      : items;
  })
    .sort((a) => typeof a === 'string' ? -1 : 1)
    .flat()
    .filter(v => !!v);
}
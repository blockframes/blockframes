import { GetKeys, MediaGroup, TerritoryGroup, staticModel } from './static-model';

export type GroupScope = keyof typeof staticGroups;

export interface StaticGroup<S extends GroupScope = any> {
  label: MediaGroup | TerritoryGroup;
  items: Extract<GetKeys<S>, string>[];
}

export type StaticGroupMap = Partial<{
  [key in GroupScope]: StaticGroup<key>[]
}>;


export const mediaGroup: StaticGroup<'medias'>[] = [{
  label: 'TV',
  items: ['payTv', 'freeTv', 'payPerView'],
}, {
  label: 'VOD',
  items: ['est', 'nVod', 'aVod', 'fVod', 'sVod', 'tVod']
}, {
  label: 'Ancillary Rights',
  items: ['boats', 'inflight', 'hotels', 'educational']
}, {
  label: 'Video (DVD, Blu-Ray)',
  items: ['rental', 'through']
}, {
  label: 'Festivals',
  items: ['festival']
}];

export const territoriesGroup: StaticGroup<'territories'>[] = [
  {
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
  medias: mediaGroup,
  territories: territoriesGroup
}

export function toGroupLabel(value: string[], scope: GroupScope, all?: string) {

  const groups: StaticGroup[] = staticGroups[scope];

  const allItems = groups.reduce((items, group) => items.concat(group.items), []);

  if (allItems.length === value.length) return [all];

  return groups.map(group => {
    const items = [];
    for (const item of group.items) {
      if (value.includes(item)) items.push(staticModel[scope][item]);
    }
    return items.length === group.items.length
      ? group.label
      : items;
  })
    .sort((a) => typeof a === 'string' ? -1 : 1)
    .flat()
    .filter(v => !!v);
}
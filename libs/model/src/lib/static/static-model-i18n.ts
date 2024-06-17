import { TimeFrame } from './static-model';

//----------------------------------
// FR translations
//----------------------------------

const rightholderRolesFR = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur principal',
  localDistributor: 'Distributeur local',
  sale: 'Diffuseur',
  producer: 'Producteur',
  author: 'Auteur',
  agent: 'Agent',
  coProducer: 'Co-producteur',
  financier: 'Financier',
  institution: 'Institution',
  performer: 'Cast',
  other: 'Autre'
} as const

const rightTypesFR = {
  commission: 'Commission',
  expenses: 'Récupération des frais',
  mg: 'Récupération MG',
  horizontal: 'Groupe horizontal',
  vertical: 'Groupe vertical',
  rnpp: 'RNPP',
  investments: 'Récupération de l\'investissement',
  residuals: 'Residuals',
  royalties: 'Royalties',
  unknown: 'Autre'
} as const

const statementPartyFR = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Bénéficiaire',
  directSales: 'Ventes directes',
} as const;

const amortizationStatusFR = {
  draft: 'Brouillon',
  applied: 'Appliqué',
} as const;

const periodsFR = {
  days: 'Jours',
  weeks: 'Semaines',
  months: 'Mois',
  years: 'Années',
} as const;

const statementTypeFR = {
  salesAgent: 'Agent de vente',
  mainDistributor: 'Distributeur',
  producer: 'Sortant',
  directSales: 'Ventes directes',
} as const;

const statementStatusFR = {
  draft: 'Brouillon',
  pending: 'En attente',
  reported: 'Reporté',
  rejected: 'Rejeté'
} as const;

const documentPathsFR = {
  documents: 'Documents',
  contracts: 'Contrats',
  financingPlan: 'Plan de financement',
  budget: 'Budget'
} as const;

const statementSectionFR = {
  grossReceipts: 'Recettes Brutes',
  netReceipts: 'Recettes Nettes',
} as const;

const invitationTypeFR = {
  attendEvent: 'Participer à l\'événement',
  joinOrganization: 'Rejoindre la société',
  joinWaterfall: 'Rejoindre le Waterfall',
} as const

const invitationStatusFR = {
  accepted: 'Accepté',
  declined: 'Decliné',
  pending: 'En attente'
} as const

const descTimeFramesFR: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: `Aujourd'hui`, way: 'desc' },
  { type: 'days', from: -1, to: 0, label: 'Hier', way: 'desc' },
  { type: 'days', from: -2, to: -1, way: 'desc' },
  { type: 'days', from: -3, to: -2, way: 'desc' },
  { type: 'days', from: -4, to: -3, way: 'desc' },
  { type: 'days', from: -5, to: -4, way: 'desc' },
  { type: 'days', from: -6, to: -5, way: 'desc' },
  { type: 'days', from: -7, to: -6, way: 'desc' },
  { type: 'weeks', from: -2, to: -1, label: 'La semaine passée', way: 'desc' },
  { type: 'weeks', from: -3, to: -2, way: 'desc' },
  { type: 'weeks', from: -4, to: -3, way: 'desc' },
  { type: 'months', from: -2, to: -1, label: 'Le mois dernier', way: 'desc' },
  { type: 'months', from: -4, to: -2, label: 'Plus que deux mois', way: 'desc' },
];

const ascTimeFramesFR: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: `Aujourd'hui`, way: 'asc' },
  { type: 'days', from: 1, to: 2, label: 'Demain', way: 'asc' },
  { type: 'days', from: 2, to: 3, way: 'asc' },
  { type: 'days', from: 3, to: 4, way: 'asc' },
  { type: 'days', from: 4, to: 5, way: 'asc' },
  { type: 'days', from: 5, to: 6, way: 'asc' },
  { type: 'days', from: 6, to: 7, way: 'asc' },
  { type: 'weeks', from: 1, to: 2, label: 'La semaine prochaine', way: 'asc' },
  { type: 'weeks', from: 2, to: 3, way: 'asc' },
  { type: 'weeks', from: 3, to: 4, way: 'asc' },
  { type: 'months', from: 1, to: 2, label: 'Le mois prochain', way: 'asc' },
  { type: 'months', from: 2, to: 3, way: 'asc' },
  { type: 'months', from: 3, to: 4, way: 'asc' },
];

const timeFramesFR = {
  asc: ascTimeFramesFR,
  desc: descTimeFramesFR,
}

const territoriesFR = {
  world: 'Monde',
  "aland-islands": "Îles Åland",
  afghanistan: "Afghanistan",
  albania: "Albanie",
  algeria: "Algérie",
  "american-samoa": "Samoa américaines",
  andorra: "Andorre",
  angola: "Angola",
  "anguilla-&-barbuda": "Anguilla",
  "antigua-and-barbuda": "Antigua-et-Barbuda",
  argentina: "Argentine",
  armenia: "Arménie",
  aruba: "Aruba",
  australia: "Australie",
  austria: "Autriche",
  azerbaijan: "Azerbaïdjan",
  bahamas: "Bahamas",
  bahrain: "Bahreïn",
  bangladesh: "Bangladesh",
  barbados: "Barbade",
  belarus: "Biélorussie",
  belgium: "Belgique",
  belize: "Belize",
  benin: "Bénin",
  bermuda: "Bermudes",
  bhutan: "Bhoutan",
  bolivia: "Bolivie",
  "bosnia-and-herzegovina": "Bosnie-Herzégovine",
  botswana: "Botswana",
  "bouvet-island": "Île Bouvet",
  brazil: "Brésil",
  "british-indian-ocean-territory": "Territoire britannique de l'océan Indien",
  brunei: "Brunéi",
  bulgaria: "Bulgarie",
  burkina: "Burkina Faso",
  burundi: "Burundi",
  "cabo-verde": "Cap-Vert",
  cambodia: "Cambodge",
  cameroon: "Cameroun",
  canada: "Canada",
  "cayman-islands": "Îles Caïmans",
  "central-african-republic": "République centrafricaine",
  chad: "Tchad",
  chile: "Chili",
  china: "Chine",
  colombia: "Colombie",
  comoros: "Comores",
  "congo-democratic-republic": "République démocratique du Congo",
  congo: "Congo (Congo-Brazzaville)",
  "cook-islands": "Îles Cook",
  "costa-rica": "Costa Rica",
  croatia: "Croatie",
  cuba: "Cuba",
  curacao: "Curaçao",
  cyprus: "Chypre",
  "northern-cyprus": "Chypre du Nord",
  czech: "République tchèque (Tchéquie)",
  denmark: "Danemark",
  djibouti: "Djibouti",
  dominica: "Dominique",
  "dominican-republic": "République dominicaine",
  ecuador: "Équateur",
  egypt: "Égypte",
  "el-salvador": "Salvador",
  "equatorial-guinea": "Guinée équatoriale",
  eritrea: "Érythrée",
  estonia: "Estonie",
  eswatini: "Eswatini (anciennement Swaziland)",
  ethiopia: "Éthiopie",
  "falkland-islands": "Îles Falkland",
  "faroe-islands": "Îles Féroé",
  fiji: "Fidji",
  finland: "Finlande",
  france: "France",
  "french-polynesia": "Polynésie française",
  "french-southern-territories": "Terres australes françaises",
  gabon: "Gabon",
  gambia: "Gambie",
  georgia: "Géorgie",
  germany: "Allemagne",
  ghana: "Ghana",
  greece: "Grèce",
  greenland: "Groenland",
  grenada: "Grenade",
  guam: "Guam",
  guatemala: "Guatemala",
  guernsey: "Guernesey",
  guinea: "Guinée",
  "guinea-bissau": "Guinée-Bissau",
  guyana: "Guyana",
  haiti: "Haïti",
  "heard-island-and-mcdonald-islands": "Îles Heard-et-MacDonald",
  "holy-see": "Saint-Siège",
  "honduras": "Honduras",
  "hong-kong": "Hong Kong",
  hungary: "Hongrie",
  "iceland": "Islande",
  "india": "Inde",
  "indonesia": "Indonésie",
  iran: "Iran",
  iraq: "Irak",
  ireland: "Irlande",
  "isle-of-man": "Île de Man",
  israel: "Israël",
  italy: "Italie",
  "ivory-coast-cote-d-ivoire": "Côte d'Ivoire",
  jamaica: "Jamaïque",
  japan: "Japon",
  jersey: "Jersey",
  jordan: "Jordanie",
  kazakhstan: "Kazakhstan",
  kenya: "Kenya",
  kiribati: "Kiribati",
  "north-korea": "Corée du Nord",
  "south-korea": "Corée du Sud",
  kosovo: "République du Kosovo",
  kuwait: "Koweït",
  kyrgyzstan: "Kirghizistan",
  laos: "Laos",
  latvia: "Lettonie",
  lebanon: "Liban",
  lesotho: "Lesotho",
  liberia: "Libéria",
  libya: "Libye",
  liechtenstein: "Liechtenstein",
  lithuania: "Lituanie",
  luxembourg: "Luxembourg",
  macao: "Macao",
  madagascar: "Madagascar",
  malawi: "Malawi",
  malaysia: "Malaisie",
  maldives: "Maldives",
  mali: "Mali",
  malta: "Malte",
  marshall: "Îles Marshall",
  martinique: "Martinique",
  mauritania: "Mauritanie",
  mauritius: "Maurice",
  mexico: "Mexique",
  micronesia: "Micronésie",
  "midway-islands": "Îles Midway",
  moldova: "Moldavie",
  monaco: "Monaco",
  mongolia: "Mongolie",
  montenegro: "Monténégro",
  montserrat: "Montserrat",
  morocco: "Maroc",
  mozambique: "Mozambique",
  myanmar: "Myanmar",
  namibia: "Namibie",
  nauru: "Nauru",
  nepal: "Népal",
  netherlands: "Pays-Bas",
  "new-caledonia": "Nouvelle-Calédonie",
  "new-zealand": "Nouvelle-Zélande",
  nicaragua: "Nicaragua",
  niger: "Niger",
  nigeria: "Nigéria",
  niue: "Niue",
  "norfolk-island": "Île Norfolk",
  "north-macedonia": "Macédoine du Nord",
  "northern-mariana-islands": "Îles Mariannes du Nord",
  norway: "Norvège",
  oman: "Oman",
  pakistan: "Pakistan",
  palau: "Palaos",
  palestine: "Palestine",
  panama: "Panama",
  papua: "Papouasie-Nouvelle-Guinée",
  paraguay: "Paraguay",
  peru: "Pérou",
  philippines: "Philippines",
  pitcairn: "Îles Pitcairn",
  poland: "Pologne",
  portugal: "Portugal",
  "puerto-rico": "Porto Rico",
  qatar: "Qatar",
  romania: "Roumanie",
  russia: "Russie",
  rwanda: "Rwanda",
  "saint-barthelemy": "Saint-Barthélemy",
  "saint-helena-ascension-and-tristan-da-cunha": "Sainte-Hélène, Ascension et Tristan da Cunha",
  "saint-kitts-and-nevis": "Saint-Christophe-et-Niévès",
  "saint-lucia": "Sainte-Lucie",
  "saint-martin-french": "Saint-Martin (partie française)",
  "saint-pierre-and-miquelon": "Saint-Pierre-et-Miquelon",
  "saint-vincent-and-the-grenadines": "Saint-Vincent-et-les-Grenadines",
  samoa: "Samoa",
  "san-marino": "Saint-Marin",
  "sao-tome-and-principe": "Sao Tomé-et-Principe",
  "saudi-arabia": "Arabie saoudite",
  senegal: "Sénégal",
  serbia: "Serbie",
  seychelles: "Seychelles",
  "sierra-leone": "Sierra Leone",
  singapore: "Singapour",
  "saint-martin-dutch": "Saint-Martin (partie néerlandaise)",
  slovakia: "Slovaquie",
  slovenia: "Slovénie",
  "solomon-islands": "Îles Salomon",
  somalia: "Somalie",
  somaliland: "République du Somaliland",
  "south-africa": "Afrique du Sud",
  "south-georgia": "Géorgie du Sud-et-les Îles Sandwich du Sud",
  "south-sudan": "Soudan du Sud",
  spain: "Espagne",
  "sri-lanka": "Sri Lanka",
  sudan: "Soudan",
  suriname: "Suriname",
  sweden: "Suède",
  switzerland: "Suisse",
  syria: "Syrie",
  taiwan: "Taïwan",
  tajikistan: "Tadjikistan",
  tanzania: "Tanzanie",
  thailand: "Thaïlande",
  "timor-leste": "Timor-Leste (Timor oriental)",
  togo: "Togo",
  tonga: "Tonga",
  "trinidad-and-tobago": "Trinité-et-Tobago",
  tunisia: "Tunisie",
  turkey: "Turquie",
  turkmenistan: "Turkménistan",
  "turks-and-caicos-islands": "Îles Turques-et-Caïques",
  uganda: "Ouganda",
  ukraine: "Ukraine",
  "united-arab-emirates": "Émirats arabes unis",
  "united-kingdom": "Royaume-Uni",
  "united-states-of-america": "États-Unis d'Amérique",
  uruguay: "Uruguay",
  uzbekistan: "Ouzbékistan",
  vanuatu: "Vanuatu",
  vatican: "Vatican",
  venezuela: "Venezuela",
  vietnam: "Vietnam",
  "virgin-islands-uk": "Îles Vierges britanniques",
  "virgin-islands-us": "Îles Vierges des États-Unis",
  "wallis-and-futuna": "Wallis-et-Futuna",
  "western-sahara": "Sahara occidental",
  yemen: "Yémen",
  zambia: "Zambie",
  zimbabwe: "Zimbabwe",
} as const

const mediasFR = {
  payTv: 'Télévision payante',
  freeTv: 'Télévision gratuite',
  payPerView: 'À la carte',
  est: 'EST',
  nVod: 'NVOD',
  aVod: 'AVOD',
  fVod: 'FVOD',
  sVod: 'SVOD',
  tVod: 'TVOD',
  inflight: 'À bord des avions',
  boats: 'À bord des bateaux',
  hotels: 'Hôtels',
  educational: 'Éducatif',
  festival: 'Festival',
  rental: 'Location',
  theatrical: 'Salles',
  nonTheatrical: 'Hors salles',
  through: 'Vente directe',
  merchandising: 'Produits dérivés',
  music: 'Musique',
  remake: 'Remake, Préquelle, Suite',
  multimedia: 'Multimédia',
  multimediaExtract: 'Extrait multimédia',
  tvExtract: 'Extrait TV',
} as const

const mediaGroupFR = {
  tv: 'TV',
  vod: 'VOD',
  ancillary: 'Droits secondaires',
  homeVideo: 'Vidéo (DVD, Blu-Ray)',
  festivals: 'Festivals',
  theatrical: 'Droits salles',
  derivative: 'Droits dérivés'
} as const;

const territoryGroupFR = {
  africa: 'Afrique',
  asia: 'Asie',
  caribbean: 'Caraïbes',
  cis: 'CEI',
  europe: 'Europe',
  latinAmerica: 'Amérique latine',
  middleEast: 'Moyen-Orient',
  northAmerica: 'Amérique du Nord',
  oceania: 'Océanie'
} as const;

//----------------------------------
// ES translations
//----------------------------------

const rightholderRolesES = {
  salesAgent: 'Agente de ventas',
  mainDistributor: 'Distribuidor principal',
  localDistributor: 'Distribuidor local',
  sale: 'Difusor',
  producer: 'Productor',
  author: 'Autor',
  agent: 'Agente',
  coProducer: 'Co-productor',
  financier: 'Financista',
  institution: 'Institución',
  performer: 'Elenco',
  other: 'Otro'
} as const

const rightTypesES = {
  commission: 'Comisión',
  expenses: 'Recuperación de gastos',
  mg: 'Recuperación de MG',
  horizontal: 'Grupo horizontal',
  vertical: 'Grupo vertical',
  rnpp: 'RNPP',
  investments: 'Recuperación de la inversión',
  residuals: 'Residuos',
  royalties: 'Regalías',
  unknown: 'Otro'
} as const

const statementPartyES = {
  salesAgent: 'Agente de ventas',
  mainDistributor: 'Distribuidor principal',
  producer: 'Beneficiario',
  directSales: 'Ventas directas',
} as const;

const amortizationStatusES = {
  draft: 'Borrador',
  applied: 'Aplicado',
} as const;

const periodsES = {
  days: 'Días',
  weeks: 'Semanas',
  months: 'Meses',
  years: 'Años',
} as const;

const statementTypeES = {
  salesAgent: 'Agente de ventas',
  mainDistributor: 'Distribuidor',
  producer: 'Emisor',
  directSales: 'Ventas directas',
} as const;

const statementStatusES = {
  draft: 'Borrador',
  pending: 'Pendiente',
  reported: 'Reportado',
  rejected: 'Rechazado'
} as const;

const documentPathsES = {
  documents: 'Documentos',
  contracts: 'Contratos',
  financingPlan: 'Plan de financiamiento',
  budget: 'Presupuesto'
} as const;

const statementSectionES = {
  grossReceipts: 'Ingresos Brutos',
  netReceipts: 'Ingresos Netos',
} as const;

const invitationTypeES = {
  attendEvent: 'Asistir al Evento',
  joinOrganization: 'Unirse a la Organización',
  joinWaterfall: 'Unirse a Waterfall',
} as const;

const invitationStatusES = {
  accepted: 'Aceptado',
  declined: 'Rechazado',
  pending: 'Pendiente'
} as const;

const descTimeFramesES: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Hoy', way: 'desc' },
  { type: 'days', from: -1, to: 0, label: 'Ayer', way: 'desc' },
  { type: 'days', from: -2, to: -1, way: 'desc' },
  { type: 'days', from: -3, to: -2, way: 'desc' },
  { type: 'days', from: -4, to: -3, way: 'desc' },
  { type: 'days', from: -5, to: -4, way: 'desc' },
  { type: 'days', from: -6, to: -5, way: 'desc' },
  { type: 'days', from: -7, to: -6, way: 'desc' },
  { type: 'weeks', from: -2, to: -1, label: 'Semana pasada', way: 'desc' },
  { type: 'weeks', from: -3, to: -2, way: 'desc' },
  { type: 'weeks', from: -4, to: -3, way: 'desc' },
  { type: 'months', from: -2, to: -1, label: 'Mes pasado', way: 'desc' },
  { type: 'months', from: -4, to: -2, label: 'Hace más de dos meses', way: 'desc' },
];

const ascTimeFramesES: TimeFrame[] = [
  { type: 'days', from: 0, to: 1, label: 'Hoy', way: 'asc' },
  { type: 'days', from: 1, to: 2, label: 'Mañana', way: 'asc' },
  { type: 'days', from: 2, to: 3, way: 'asc' },
  { type: 'days', from: 3, to: 4, way: 'asc' },
  { type: 'days', from: 4, to: 5, way: 'asc' },
  { type: 'days', from: 5, to: 6, way: 'asc' },
  { type: 'days', from: 6, to: 7, way: 'asc' },
  { type: 'weeks', from: 1, to: 2, label: 'Próxima semana', way: 'asc' },
  { type: 'weeks', from: 2, to: 3, way: 'asc' },
  { type: 'weeks', from: 3, to: 4, way: 'asc' },
  { type: 'months', from: 1, to: 2, label: 'Próximo mes', way: 'asc' },
  { type: 'months', from: 2, to: 3, way: 'asc' },
  { type: 'months', from: 3, to: 4, way: 'asc' },
];

const timeFramesES = {
  asc: ascTimeFramesES,
  desc: descTimeFramesES,
}

const territoriesES = {
  world: 'Mundo',
  "aland-islands": "Islas Åland",
  afghanistan: "Afganistán",
  albania: "Albania",
  algeria: "Argelia",
  "american-samoa": "Samoa Americana",
  andorra: "Andorra",
  angola: "Angola",
  "anguilla-&-barbuda": "Anguila",
  "antigua-and-barbuda": "Antigua y Barbuda",
  argentina: "Argentina",
  armenia: "Armenia",
  aruba: "Aruba",
  australia: "Australia",
  austria: "Austria",
  azerbaijan: "Azerbaiyán",
  bahamas: "Bahamas",
  bahrain: "Baréin",
  bangladesh: "Bangladés",
  barbados: "Barbados",
  belarus: "Bielorrusia",
  belgium: "Bélgica",
  belize: "Belice",
  benin: "Benín",
  bermuda: "Bermudas",
  bhutan: "Bután",
  bolivia: "Bolivia",
  "bosnia-and-herzegovina": "Bosnia y Herzegovina",
  botswana: "Botsuana",
  "bouvet-island": "Isla Bouvet",
  brazil: "Brasil",
  "british-indian-ocean-territory": "Territorio Británico del Océano Índico",
  brunei: "Brunéi",
  bulgaria: "Bulgaria",
  burkina: "Burkina Faso",
  burundi: "Burundi",
  "cabo-verde": "Cabo Verde",
  cambodia: "Camboya",
  cameroon: "Camerún",
  canada: "Canadá",
  "cayman-islands": "Islas Caimán",
  "central-african-republic": "República Centroafricana",
  chad: "Chad",
  chile: "Chile",
  china: "China",
  colombia: "Colombia",
  comoros: "Comoras",
  "congo-democratic-republic": "República Democrática del Congo",
  congo: "Congo (Congo-Brazzaville)",
  "cook-islands": "Islas Cook",
  "costa-rica": "Costa Rica",
  croatia: "Croacia",
  cuba: "Cuba",
  curacao: "Curazao",
  cyprus: "Chipre",
  "northern-cyprus": "Chipre del Norte",
  czech: "República Checa",
  denmark: "Dinamarca",
  djibouti: "Yibuti",
  dominica: "Dominica",
  "dominican-republic": "República Dominicana",
  ecuador: "Ecuador",
  egypt: "Egipto",
  "el-salvador": "El Salvador",
  "equatorial-guinea": "Guinea Ecuatorial",
  eritrea: "Eritrea",
  estonia: "Estonia",
  eswatini: "Esuatini (antes Suazilandia)",
  ethiopia: "Etiopía",
  "falkland-islands": "Islas Malvinas",
  "faroe-islands": "Islas Feroe",
  fiji: "Fiyi",
  finland: "Finlandia",
  france: "Francia",
  "french-polynesia": "Polinesia Francesa",
  "french-southern-territories": "Territorios Australes Franceses",
  gabon: "Gabón",
  gambia: "Gambia",
  georgia: "Georgia",
  germany: "Alemania",
  ghana: "Ghana",
  greece: "Grecia",
  greenland: "Groenlandia",
  grenada: "Granada",
  guam: "Guam",
  guatemala: "Guatemala",
  guernsey: "Guernsey",
  guinea: "Guinea",
  "guinea-bissau": "Guinea-Bisáu",
  guyana: "Guyana",
  haiti: "Haití",
  "heard-island-and-mcdonald-islands": "Islas Heard y McDonald",
  "holy-see": "Santa Sede",
  "honduras": "Honduras",
  "hong-kong": "Hong Kong",
  hungary: "Hungría",
  "iceland": "Islandia",
  india: "India",
  indonesia: "Indonesia",
  iran: "Irán",
  iraq: "Irak",
  ireland: "Irlanda",
  "isle-of-man": "Isla de Man",
  israel: "Israel",
  italy: "Italia",
  "ivory-coast-cote-d-ivoire": "Costa de Marfil (Côte d'Ivoire)",
  jamaica: "Jamaica",
  japan: "Japón",
  jersey: "Jersey",
  jordan: "Jordania",
  kazakhstan: "Kazajistán",
  kenya: "Kenia",
  kiribati: "Kiribati",
  "north-korea": "Corea del Norte",
  "south-korea": "Corea del Sur",
  kosovo: "República de Kosovo",
  kuwait: "Kuwait",
  kyrgyzstan: "Kirguistán",
  laos: "Laos",
  latvia: "Letonia",
  lebanon: "Líbano",
  lesotho: "Lesoto",
  liberia: "Liberia",
  libya: "Libia",
  liechtenstein: "Liechtenstein",
  lithuania: "Lituania",
  luxembourg: "Luxemburgo",
  macao: "Macao",
  madagascar: "Madagascar",
  malawi: "Malaui",
  malaysia: "Malasia",
  maldives: "Maldivas",
  mali: "Malí",
  malta: "Malta",
  marshall: "Islas Marshall",
  martinique: "Martinica",
  mauritania: "Mauritania",
  mauritius: "Mauricio",
  mexico: "México",
  micronesia: "Micronesia",
  "midway-islands": "Islas Midway",
  moldova: "Moldavia",
  monaco: "Mónaco",
  mongolia: "Mongolia",
  montenegro: "Montenegro",
  montserrat: "Montserrat",
  morocco: "Marruecos",
  mozambique: "Mozambique",
  myanmar: "Birmania",
  namibia: "Namibia",
  nauru: "Nauru",
  nepal: "Nepal",
  netherlands: "Países Bajos",
  "new-caledonia": "Nueva Caledonia",
  "new-zealand": "Nueva Zelanda",
  nicaragua: "Nicaragua",
  niger: "Níger",
  nigeria: "Nigeria",
  niue: "Niue",
  "norfolk-island": "Isla Norfolk",
  "north-macedonia": "Macedonia del Norte",
  "northern-mariana-islands": "Islas Marianas del Norte",
  norway: "Noruega",
  oman: "Omán",
  pakistan: "Pakistán",
  palau: "Palaos",
  palestine: "Palestina",
  panama: "Panamá",
  papua: "Papúa Nueva Guinea",
  paraguay: "Paraguay",
  peru: "Perú",
  philippines: "Filipinas",
  pitcairn: "Islas Pitcairn",
  poland: "Polonia",
  portugal: "Portugal",
  "puerto-rico": "Puerto Rico",
  qatar: "Catar",
  romania: "Rumania",
  russia: "Rusia",
  rwanda: "Ruanda",
  "saint-barthelemy": "San Bartolomé",
  "saint-helena-ascension-and-tristan-da-cunha": "Santa Elena, Ascensión y Tristán de Acuña",
  "saint-kitts-and-nevis": "San Cristóbal y Nieves",
  "saint-lucia": "Santa Lucía",
  "saint-martin-french": "San Martín (parte francesa)",
  "saint-pierre-and-miquelon": "San Pedro y Miquelón",
  "saint-vincent-and-the-grenadines": "San Vicente y las Granadinas",
  samoa: "Samoa",
  "san-marino": "San Marino",
  "sao-tome-and-principe": "Santo Tomé y Príncipe",
  "saudi-arabia": "Arabia Saudita",
  senegal: "Senegal",
  serbia: "Serbia",
  seychelles: "Seychelles",
  "sierra-leone": "Sierra Leona",
  singapore: "Singapur",
  "saint-martin-dutch": "Sint Maarten (parte holandesa)",
  slovakia: "Eslovaquia",
  slovenia: "Eslovenia",
  "solomon-islands": "Islas Salomón",
  somalia: "Somalia",
  somaliland: "República de Somalilandia",
  "south-africa": "Sudáfrica",
  "south-georgia": "Islas Georgias del Sur y Sandwich del Sur",
  "south-sudan": "Sudán del Sur",
  spain: "España",
  "sri-lanka": "Sri Lanka",
  sudan: "Sudán",
  suriname: "Surinam",
  sweden: "Suecia",
  switzerland: "Suiza",
  syria: "Siria",
  taiwan: "Taiwán",
  tajikistan: "Tayikistán",
  tanzania: "Tanzania",
  thailand: "Tailandia",
  "timor-leste": "Timor-Leste (Timor Oriental)",
  togo: "Togo",
  tonga: "Tonga",
  "trinidad-and-tobago": "Trinidad y Tobago",
  tunisia: "Túnez",
  turkey: "Turquía",
  turkmenistan: "Turkmenistán",
  "turks-and-caicos-islands": "Islas Turcas y Caicos",
  uganda: "Uganda",
  ukraine: "Ucrania",
  "united-arab-emirates": "Emiratos Árabes Unidos",
  "united-kingdom": "Reino Unido",
  "united-states-of-america": "Estados Unidos de América",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistán",
  vanuatu: "Vanuatu",
  vatican: "Ciudad del Vaticano",
  venezuela: "Venezuela",
  vietnam: "Vietnam",
  "virgin-islands-uk": "Islas Vírgenes Británicas",
  "virgin-islands-us": "Islas Vírgenes de los Estados Unidos",
  "wallis-and-futuna": "Wallis y Futuna",
  "western-sahara": "Sahara Occidental",
  yemen: "Yemen",
  zambia: "Zambia",
  zimbabwe: "Zimbabue",
} as const

const mediasES = {
  payTv: 'Televisión de Pago',
  freeTv: 'Televisión Abierta',
  payPerView: 'Pago Por Ver',
  est: 'EST',
  nVod: 'NVOD',
  aVod: 'AVOD',
  fVod: 'FVOD',
  sVod: 'SVOD',
  tVod: 'TVOD',
  inflight: 'En Vuelo',
  boats: 'Barcos',
  hotels: 'Hoteles',
  educational: 'Educativo',
  festival: 'Festival',
  rental: 'Alquiler',
  theatrical: 'Cine',
  nonTheatrical: 'No teatral',
  through: 'Venta Directa',
  merchandising: 'Merchandising',
  music: 'Música',
  remake: 'Remake, Precuelas, Secuelas',
  multimedia: 'Multimedia',
  multimediaExtract: 'Extracto Multimedia',
  tvExtract: 'Extracto TV',
} as const;

const mediaGroupES = {
  tv: 'Televisión',
  vod: 'VOD',
  ancillary: 'Derechos Auxiliares',
  homeVideo: 'Video (DVD, Blu-Ray)',
  festivals: 'Festivales',
  theatrical: 'Derechos Cinematográficos',
  derivative: 'Derechos Derivados'
} as const;

const territoryGroupES = {
  africa: 'África',
  asia: 'Asia',
  caribbean: 'Caribe',
  cis: 'CIS',
  europe: 'Europa',
  latinAmerica: 'América Latina',
  middleEast: 'Medio Oriente',
  northAmerica: 'América del Norte',
  oceania: 'Oceanía'
} as const;

//----------------------------------
// Mapping
//----------------------------------

export const staticModeli18n = {
  fr: {
    rightholderRoles: rightholderRolesFR,
    rightTypes: rightTypesFR,
    statementParty: statementPartyFR,
    amortizationStatus: amortizationStatusFR,
    periods: periodsFR,
    statementType: statementTypeFR,
    statementStatus: statementStatusFR,
    documentPaths: documentPathsFR,
    statementSection: statementSectionFR,
    invitationType: invitationTypeFR,
    invitationStatus: invitationStatusFR,
    territories: territoriesFR,
    medias: mediasFR,
    mediaGroup: mediaGroupFR,
    territoryGroup: territoryGroupFR
  },
  es: {
    rightholderRoles: rightholderRolesES,
    rightTypes: rightTypesES,
    statementParty: statementPartyES,
    amortizationStatus: amortizationStatusES,
    periods: periodsES,
    statementType: statementTypeES,
    statementStatus: statementStatusES,
    documentPaths: documentPathsES,
    statementSection: statementSectionES,
    invitationType: invitationTypeES,
    invitationStatus: invitationStatusES,
    territories: territoriesES,
    medias: mediasES,
    mediaGroup: mediaGroupES,
    territoryGroup: territoryGroupES
  }
};

export const timeFramesi18n = {
  fr: timeFramesFR,
  es: timeFramesES
}

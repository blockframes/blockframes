import { GetKeys, Scope } from './static-model';

export interface StaticGroup<S extends Scope = any> {
  label: string;
  items: Extract<GetKeys<S>, string>[];
}

export type StaticGroupMap = Partial<{
  [key in Scope]: StaticGroup<key>[]
}>;

export const mediaGroup: StaticGroup<'medias'>[] = [{
  label: 'TV',
  items: ['payTv', 'freeTv', 'payPerView'],
}, {
  label: 'VOD',
  items: ['est', 'nVod', 'aVod', 'fVod', 'sVod']
}, {
  label: 'Ancillary Rights',
  items: ['theatrical', 'video', 'planes', 'hotels', 'educational']
}, {
  label: 'DVD',
  items: ['rental', 'through']
}];


export const staticGroups: StaticGroupMap = {
  medias: mediaGroup,
}

export const territoryGroup: StaticGroup<'territories'>[] = [{
  label: 'Asia',
  items: [
    'afghanistan',
    'armenia',
    'azerbaijan',
    'bahrain',
    'bangladesh',
    'bhutan',
    'brunei',
    'cambodia',
    'china',
    'cyprus',
    'georgia',
    'hong-kong',
    'india',
    'indonesia',
    'iran',
    'iraq',
    'israel',
    'japan',
    'jordan',
    'kazakhstan',
    'north-korea',
    'south-korea',
    'kuwait',
    'kyrgyzstan',
    'laos',
    'lebanon',
    'macao',
    'malaysia',
    'maldives',
    'mongolia',
    'myanmar',
    'nepal',
    'oman',
    'pakistan',
    'palestine',
    'philippines',
    'qatar',
    'saudi-arabia',
    'singapore',
    'sri-lanka',
    'syria',
    'taiwan',
    'tajikistan',
    'thailand',
    'timor-leste',
    'turkey',
    'turkmenistan',
    'united-arab-emirates',
    'uzbekistan',
    'vietnam',
    'yemen'
  ]
}, {
  label: 'Europe',
  items: [
    'aland-islands',
    'albania',
    'andorra',
    'austria',
    'belarus',
    'belgium',
    'bosnia-and-herzegovina',
    'bulgaria',
    'croatia',
    'czech',
    'denmark',
    'estonia',
    'faroe-islands',
    'finland',
    'france',
    'germany',
    'gibraltar',
    'greece',
    'guernsey',
    'vatican',
    'hungary',
    'iceland',
    'ireland',
    'isle-of-man',
    'italy',
    'jersey',
    'latvia',
    'liechtenstein',
    'lithuania',
    'luxembourg',
    'malta',
    'moldova',
    'monaco',
    'montenegro',
    'netherlands',
    'north-macedonia',
    'norway',
    'poland',
    'portugal',
    'romania',
    'russia',
    'san-marino',
    'serbia',
    'slovakia',
    'slovenia',
    'spain',
    'svalbard-and-jan-mayen',
    'sweden',
    'switzerland',
    'ukraine',
    'united-kingdom'
  ]
}, {
  label: 'Africa',
  items: [
    'algeria',
    'angola',
    'benin',
    'botswana',
    'british-indian-ocean-territory',
    'burkina',
    'burundi',
    'cabo-verde',
    'cameroon',
    'central-african-republic',
    'chad',
    'comoros',
    'congo',
    'congo-democratic-republic',
    'ivory-coast-cote-d-ivoire',
    'djibouti',
    'egypt',
    'equatorial-guinea',
    'eritrea',
    'eswatini',
    'ethiopia',
    'french-southern-territories',
    'gabon',
    'gambia',
    'ghana',
    'guinea',
    'guinea-bissau',
    'kenya',
    'lesotho',
    'liberia',
    'libya',
    'madagascar',
    'malawi',
    'mali',
    'mauritania',
    'mauritius',
    'mayotte',
    'morocco',
    'mozambique',
    'namibia',
    'niger',
    'nigeria',
    'reunion',
    'rwanda',
    'saint-helena-ascension-and-tristan-da-cunha',
    'sao-tome-and-principe',
    'senegal',
    'seychelles',
    'sierra-leone',
    'somalia',
    'south-africa',
    'south-sudan',
    'sudan',
    'tanzania',
    'togo',
    'tunisia',
    'uganda',
    'western-sahara',
    'zambia',
    'zimbabwe'
  ]
}, {
  label: 'Oceania',
  items: [
    'american-samoa',
    'australia',
    'christmas-island',
    'cocos-islands',
    'cook-islands',
    'fiji',
    'french-polynesia',
    'guam',
    'heard-island-and-mcdonald-islands',
    'kiribati',
    'marshall',
    'micronesia',
    'nauru',
    'new-caledonia',
    'new-zealand',
    'niue',
    'norfolk-island',
    'northern-mariana-islands',
    'palau',
    'papua',
    'pitcairn',
    'samoa',
    'solomon-islands',
    'tokelau',
    'tonga',
    'tuvalu',
    'united-states-minor-outlying-islands',
    'vanuatu',
    'wallis-and-futuna'
  ]
}, {
  label: 'Americas',
  items: [
    'anguilla-&-barbuda',
    'antigua-and-barbuda',
    'argentina',
    'aruba',
    'bahamas',
    'barbados',
    'belize',
    'bermuda',
    'bolivia',
    'bonaire',
    'bouvet-island',
    'brazil',
    'canada',
    'cayman-islands',
    'chile',
    'colombia',
    'costa-rica',
    'cuba',
    'curacao',
    'dominica',
    'dominican-republic',
    'ecuador',
    'el-salvador',
    'falkland-islands',
    'french-guiana',
    'greenland',
    'grenada',
    'guadeloupe',
    'guatemala',
    'guyana',
    'haiti',
    'honduras',
    'jamaica',
    'martinique',
    'mexico',
    'montserrat',
    'nicaragua',
    'panama',
    'paraguay',
    'peru',
    'puerto-rico',
    'saint-barthelemy',
    'saint-kitts-and-nevis',
    'saint-lucia',
    'saint-martin-french',
    'saint-pierre-and-miquelon',
    'saint-vincent-and-the-grenadines',
    'saint-martin-dutch',
    'south-georgia',
    'suriname',
    'trinidad-and-tobago',
    'turks-and-caicos-islands',
    'united-states-of-america',
    'uruguay',
    'venezuela',
    'virgin-islands-uk',
    'virgin-islands-us'
  ]
}]
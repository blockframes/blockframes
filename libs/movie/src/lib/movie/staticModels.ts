const models = {
  'GENRES': [
    {
      'slug': 'action',
      'label': 'Action'
    },
    {
      'slug': 'horror',
      'label': 'Horror'
    },
    {
      'slug': 'science-fiction',
      'label': 'Science Fiction'
    },
    {
      'slug': 'thriller',
      'label': 'Thriller'
    },
    {
      'slug': 'drama',
      'label': 'Drama'
    },
    {
      'slug': 'coming-of-age',
      'label': 'Coming of Age'
    },
    {
      'slug': 'fantasy',
      'label': 'Fantasy'
    },
    {
      'slug': 'comedy',
      'label': 'Comedy'
    },
    {
      'slug': 'romance',
      'label': 'Romance'
    },
    {
      'slug': 'western',
      'label': 'Western'
    },
    {
      'slug': 'period-piece',
      'label': 'Period Piece'
    },
    {
      'slug': 'adventure',
      'label': 'Adventure'
    },
    {
      'slug': 'biography',
      'label': 'Biography'
    },
    {
      'slug': 'war',
      'label': 'War'
    },
    {
      'slug': 'fiction',
      'label': 'Fiction'
    },
    {
      'slug': 'documentary',
      'label': 'Documentary'
    },
    {
      'slug': 'tv-show',
      'label': 'TV Show'
    },
    {
      'slug': 'web-series',
      'label': 'Web Series'
    },
    {
      'slug': 'virtual-reality',
      'label': 'Virtual Reality'
    }
  ],
  'STAKEHOLDER_ROLES': [
    {
      'slug': 'executive-producer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'line-producer',
      'label': 'Line Producer'
    },
    {
      'slug': 'distributor',
      'label': 'Distributor'
    },
    {
      'slug': 'sales-agent',
      'label': 'Sales Agent'
    },
    {
      'slug': 'laboratory',
      'label': 'Laboratory'
    },
    {
      'slug': 'financier',
      'label': 'Financier'
    },
    {
      'slug': 'broadcaster-coproducer',
      'label': 'Broadcaster coproducer'
    }
  ],
  'STAKEHOLDER_DELIVERY_AUTHORIZATIONS': [
    {
      'slug': 'canValidateDelivery',
      'label': 'Can validate delivery'
    },
    {
      'slug': 'canModifyDelivery',
      'label': 'Can add, remove and edit materials'
    },
    {
      'slug': 'canDeliverMaterial',
      'label': 'Can deliver materials'
    },
    {
      'slug': 'canAcceptMaterial',
      'label': 'Can accept materials'
    },
    {
      'slug': 'canRefuseMaterial',
      'label': 'Can refuse materials'
    }
  ],
  'CREDIT_ROLES': [
    {
      'slug': 'writer',
      'label': 'Writer'
    },
    {
      'slug': 'director',
      'label': 'Director'
    },
    {
      'slug': 'actor',
      'label': 'Actor'
    },
    {
      'slug': 'exectuive-producer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'line-producer',
      'label': 'Line Producer'
    },
    {
      'slug': 'associate-producer',
      'label': 'Associate Producer'
    }
  ],
  'MOVIE_STATUS': [
    {
      'slug': 'financing',
      'label': 'Financing'
    },
    {
      'slug': 'shooting',
      'label': 'Shooting'
    },
    {
      'slug': 'post-production',
      'label': 'Post Production'
    },
    {
      'slug': 'finished',
      'label': 'Finished'
    }
  ],
  'LANGUAGES': [
    {
      'slug': 'arabic',
      'label': 'Arabic'
    },
    {
      'slug': 'bengali',
      'label': 'Bengali'
    },
    {
      'slug': 'burmese',
      'label': 'Burmese'
    },
    {
      'slug': 'english',
      'label': 'English'
    },
    {
      'slug': 'french',
      'label': 'French'
    },
    {
      'slug': 'german',
      'label': 'German'
    },
    {
      'slug': 'gujarati',
      'label': 'Gujarati'
    },
    {
      'slug': 'hindi',
      'label': 'Hindi'
    },
    {
      'slug': 'italian',
      'label': 'Italian'
    },
    {
      'slug': 'japanese',
      'label': 'Japanese'
    },
    {
      'slug': 'javanese',
      'label': 'Javanese'
    },
    {
      'slug': 'kannada',
      'label': 'Kannada'
    },
    {
      'slug': 'korean',
      'label': 'Korean'
    },
    {
      'slug': 'malayalam',
      'label': 'Malayalam'
    },
    {
      'slug': 'mandarin-chinese',
      'label': 'Mandarin Chinese'
    },
    {
      'slug': 'marathi',
      'label': 'Marathi'
    },
    {
      'slug': 'oriya',
      'label': 'Oriya'
    },
    {
      'slug': 'panjabi',
      'label': 'Panjabi'
    },
    {
      'slug': 'persian',
      'label': 'Persian'
    },
    {
      'slug': 'polish',
      'label': 'Polish'
    },
    {
      'slug': 'portuguese',
      'label': 'Portuguese'
    },
    {
      'slug': 'russian',
      'label': 'Russian'
    },
    {
      'slug': 'spanish',
      'label': 'Spanish'
    },
    {
      'slug': 'tamil',
      'label': 'Tamil'
    },
    {
      'slug': 'telugu',
      'label': 'Telugu'
    },
    {
      'slug': 'thai',
      'label': 'Thai'
    },
    {
      'slug': 'turkish',
      'label': 'Turkish'
    },
    {
      'slug': 'ukrainian',
      'label': 'Ukrainian'
    },
    {
      'slug': 'urdu',
      'label': 'Urdu'
    },
    {
      'slug': 'vietnamese',
      'label': 'Vietnamese'
    }
  ],
  'MOVIE_CURRENCIES': [
    {
      'slug': 'us-dollar',
      'label': 'US dollar'
    },
    {
      'slug': 'euro',
      'label': 'Euro'
    },
    {
      'slug': 'japanese-yen',
      'label': 'Japanese yen'
    },
    {
      'slug': 'pound-sterling',
      'label': 'Pound sterling'
    },
    {
      'slug': 'australian-dollar',
      'label': 'Australian Dollar'
    },
    {
      'slug': 'canadian-dollar',
      'label': 'Canadian Dollar'
    },
    {
      'slug': 'swiss-franc',
      'label': 'Swiss Franc'
    },
    {
      'slug': 'chinese-renminbi',
      'label': 'Chinese Renminbi'
    },
    {
      'slug': 'swedish-krona',
      'label': 'Swedish krona'
    },
    {
      'slug': 'new-zealand-dollar',
      'label': 'New Zealand dollar'
    }
  ],
  'SELECTION_CATEGORIES': [
    {
      'slug': 'prestige-directors',
      'label': 'Prestige Directors'
    },
    {
      'slug': 'producers-network',
      'label': 'Producers Network'
    },
    {
      'slug': 'festival-approved',
      'label': 'Festival Approved'
    },
    {
      'slug': 'our-critics-choice',
      'label': 'Our Critics Choice'
    },
    {
      'slug': 'logical-presents',
      'label': 'Logical Presents'
    },
    {
      'slug': 'vip-access',
      'label': 'VIP Access'
    }
  ],
  'COUNTRIES': [
    {
      'slug': 'afghanistan',
      'label': 'Afghanistan'
    },
    {
      'slug': 'albania',
      'label': 'Albania'
    },
    {
      'slug': 'algeria',
      'label': 'Algeria'
    },
    {
      'slug': 'andorra',
      'label': 'Andorra'
    },
    {
      'slug': 'angola',
      'label': 'Angola'
    },
    {
      'slug': 'antigua-&-barbuda',
      'label': 'Antigua & Barbuda'
    },
    {
      'slug': 'argentina',
      'label': 'Argentina'
    },
    {
      'slug': 'armenia',
      'label': 'Armenia'
    },
    {
      'slug': 'australia',
      'label': 'Australia'
    },
    {
      'slug': 'austria',
      'label': 'Austria'
    },
    {
      'slug': 'azerbaidjan',
      'label': 'Azerbaidjan'
    },
    {
      'slug': 'bahamas',
      'label': 'Bahamas'
    },
    {
      'slug': 'bahrain',
      'label': 'Bahrain'
    },
    {
      'slug': 'bangladesh',
      'label': 'Bangladesh'
    },
    {
      'slug': 'barbados',
      'label': 'Barbados'
    },
    {
      'slug': 'belarus',
      'label': 'Belarus'
    },
    {
      'slug': 'belgium',
      'label': 'Belgium'
    },
    {
      'slug': 'belize',
      'label': 'Belize'
    },
    {
      'slug': 'benin',
      'label': 'Benin'
    },
    {
      'slug': 'bhutan',
      'label': 'Bhutan'
    },
    {
      'slug': 'bolivia',
      'label': 'Bolivia'
    },
    {
      'slug': 'bosnia-&-herzegovina',
      'label': 'Bosnia & Herzegovina'
    },
    {
      'slug': 'botswana',
      'label': 'Botswana'
    },
    {
      'slug': 'brazil',
      'label': 'Brazil'
    },
    {
      'slug': 'brunei',
      'label': 'Brunei'
    },
    {
      'slug': 'bulgaria',
      'label': 'Bulgaria'
    },
    {
      'slug': 'burkina-faso',
      'label': 'Burkina Faso'
    },
    {
      'slug': 'burundi',
      'label': 'Burundi'
    },
    {
      'slug': 'cabo-verde',
      'label': 'Cabo Verde'
    },
    {
      'slug': 'cambodia',
      'label': 'Cambodia'
    },
    {
      'slug': 'cameroon',
      'label': 'Cameroon'
    },
    {
      'slug': 'canada',
      'label': 'Canada'
    },
    {
      'slug': 'central-african-republic',
      'label': 'Central African Republic'
    },
    {
      'slug': 'chad',
      'label': 'Chad'
    },
    {
      'slug': 'chile',
      'label': 'Chile'
    },
    {
      'slug': 'china',
      'label': 'China'
    },
    {
      'slug': 'colombia',
      'label': 'Colombia'
    },
    {
      'slug': 'comoros',
      'label': 'Comoros'
    },
    {
      'slug': 'conakry',
      'label': 'Conakry'
    },
    {
      'slug': 'congo-brazzaville',
      'label': 'Congo Brazzaville'
    },
    {
      'slug': 'congo-democratic-republic-of-the',
      'label': 'Congo Democratic Republic Of The'
    },
    {
      'slug': 'costa-rica',
      'label': 'Costa Rica'
    },
    {
      'slug': 'cote-d-ivoire',
      'label': 'Cote D\'ivoire'
    },
    {
      'slug': 'croatia',
      'label': 'Croatia'
    },
    {
      'slug': 'cuba',
      'label': 'Cuba'
    },
    {
      'slug': 'cyprus',
      'label': 'Cyprus'
    },
    {
      'slug': 'czech-republic',
      'label': 'Czech Republic'
    },
    {
      'slug': 'denmark',
      'label': 'Denmark'
    },
    {
      'slug': 'djibouti',
      'label': 'Djibouti'
    },
    {
      'slug': 'dominica',
      'label': 'Dominica'
    },
    {
      'slug': 'dominican-republic',
      'label': 'Dominican Republic'
    },
    {
      'slug': 'ecuador',
      'label': 'Ecuador'
    },
    {
      'slug': 'egypt',
      'label': 'El Salvador'
    },
    {
      'slug': 'el-salvador',
      'label': 'El Salvador'
    },
    {
      'slug': 'equatorial-guinea',
      'label': 'Equatorial Guinea'
    },
    {
      'slug': 'eritrea',
      'label': 'Eritrea'
    },
    {
      'slug': 'estonia',
      'label': 'Estonia'
    },
    {
      'slug': 'ethiopia',
      'label': 'Ethiopia'
    },
    {
      'slug': 'federated-states-of-micronesia',
      'label': 'Federated States Of Micronesia'
    },
    {
      'slug': 'fiji',
      'label': 'Fiji'
    },
    {
      'slug': 'finland',
      'label': 'Finland'
    },
    {
      'slug': 'france',
      'label': 'France'
    },
    {
      'slug': 'gabon',
      'label': 'Gabon'
    },
    {
      'slug': 'gambia',
      'label': 'Gambia'
    },
    {
      'slug': 'georgia',
      'label': 'Georgia'
    },
    {
      'slug': 'germany',
      'label': 'Germany'
    },
    {
      'slug': 'ghana',
      'label': 'Ghana'
    },
    {
      'slug': 'greece',
      'label': 'Greece'
    },
    {
      'slug': 'grenada',
      'label': 'Grenada'
    },
    {
      'slug': 'guatemala',
      'label': 'Guatemala'
    },
    {
      'slug': 'guinea',
      'label': 'Guinea'
    },
    {
      'slug': 'guinea-bissau',
      'label': 'Guinea-Bissau'
    },
    {
      'slug': 'guyana',
      'label': 'Guyana'
    },
    {
      'slug': 'haiti',
      'label': 'Haiti'
    },
    {
      'slug': 'honduras',
      'label': 'Honduras'
    },
    {
      'slug': 'hungary',
      'label': 'Hungary'
    },
    {
      'slug': 'iceland',
      'label': 'Iceland'
    },
    {
      'slug': 'ile-saint-helene',
      'label': 'Ile Saint Helene'
    },
    {
      'slug': 'india',
      'label': 'India'
    },
    {
      'slug': 'indonesia',
      'label': 'Indonesia'
    },
    {
      'slug': 'irak',
      'label': 'Irak'
    },
    {
      'slug': 'iran',
      'label': 'Iran'
    },
    {
      'slug': 'ireland',
      'label': 'Ireland'
    },
    {
      'slug': 'israel',
      'label': 'Israel'
    },
    {
      'slug': 'italy',
      'label': 'Italy'
    },
    {
      'slug': 'jamaica',
      'label': 'Jamaica'
    },
    {
      'slug': 'japan',
      'label': 'Japan'
    },
    {
      'slug': 'jordan',
      'label': 'Jordan'
    },
    {
      'slug': 'kazakhstan',
      'label': 'Kazakhstan'
    },
    {
      'slug': 'kenya',
      'label': 'Kenya'
    },
    {
      'slug': 'kiribati',
      'label': 'Kiribati'
    },
    {
      'slug': 'kosovo',
      'label': 'Kosovo'
    },
    {
      'slug': 'kuwait',
      'label': 'Kuwait'
    },
    {
      'slug': 'kyrgyzstan',
      'label': 'Kyrgyzstan'
    },
    {
      'slug': 'laos',
      'label': 'Laos'
    },
    {
      'slug': 'latvia',
      'label': 'Latvia'
    },
    {
      'slug': 'lebanon',
      'label': 'Lebanon'
    },
    {
      'slug': 'lesotho',
      'label': 'Lesotho'
    },
    {
      'slug': 'liberia',
      'label': 'Liberia'
    },
    {
      'slug': 'libya',
      'label': 'Libya'
    },
    {
      'slug': 'liechtenstein',
      'label': 'Liechtenstein'
    },
    {
      'slug': 'lithuania',
      'label': 'Lithuania'
    },
    {
      'slug': 'luxembourg',
      'label': 'Luxembourg'
    },
    {
      'slug': 'macedonia',
      'label': 'Macedonia'
    },
    {
      'slug': 'madagascar',
      'label': 'Madagascar'
    },
    {
      'slug': 'malawi',
      'label': 'Malawi'
    },
    {
      'slug': 'malaysia',
      'label': 'Malaysia'
    },
    {
      'slug': 'maldives',
      'label': 'Maldives'
    },
    {
      'slug': 'mali',
      'label': 'Mali'
    },
    {
      'slug': 'malta',
      'label': 'Malta'
    },
    {
      'slug': 'marshall-islands',
      'label': 'Marshall Islands'
    },
    {
      'slug': 'mauritania',
      'label': 'Mauritania'
    },
    {
      'slug': 'mauritius',
      'label': 'Mauritius'
    },
    {
      'slug': 'mexico',
      'label': 'Mexico'
    },
    {
      'slug': 'moldova',
      'label': 'Moldova'
    },
    {
      'slug': 'monaco',
      'label': 'Monaco'
    },
    {
      'slug': 'mongolia',
      'label': 'Mongolia'
    },
    {
      'slug': 'montenegro',
      'label': 'Montenegro'
    },
    {
      'slug': 'morocco',
      'label': 'Morocco'
    },
    {
      'slug': 'mozambique',
      'label': 'Mozambique'
    },
    {
      'slug': 'myanmar',
      'label': 'Myanmar'
    },
    {
      'slug': 'namibia',
      'label': 'Namibia'
    },
    {
      'slug': 'nauru',
      'label': 'Nauru'
    },
    {
      'slug': 'nepal',
      'label': 'Nepal'
    },
    {
      'slug': 'netherlands',
      'label': 'Netherlands'
    },
    {
      'slug': 'new-zealand',
      'label': 'New Zealand'
    },
    {
      'slug': 'nicaragua',
      'label': 'Nicaragua'
    },
    {
      'slug': 'niger',
      'label': 'Niger'
    },
    {
      'slug': 'nigeria',
      'label': 'Nigeria'
    },
    {
      'slug': 'north-korea',
      'label': 'North Korea'
    },
    {
      'slug': 'norway',
      'label': 'Norway'
    },
    {
      'slug': 'oman',
      'label': 'Oman'
    },
    {
      'slug': 'pakistan',
      'label': 'Pakistan'
    },
    {
      'slug': 'palau',
      'label': 'Palau'
    },
    {
      'slug': 'palestine',
      'label': 'Palestine'
    },
    {
      'slug': 'panama',
      'label': 'Panama'
    },
    {
      'slug': 'papua-new-guinea',
      'label': 'Papua New Guinea'
    },
    {
      'slug': 'paraguay',
      'label': 'Paraguay'
    },
    {
      'slug': 'peru',
      'label': 'Peru'
    },
    {
      'slug': 'philippines',
      'label': 'Philippines'
    },
    {
      'slug': 'poland',
      'label': 'Poland'
    },
    {
      'slug': 'portugal',
      'label': 'Portugal'
    },
    {
      'slug': 'qatar',
      'label': 'Qatar'
    },
    {
      'slug': 'romania',
      'label': 'Romania'
    },
    {
      'slug': 'russia',
      'label': 'Russia'
    },
    {
      'slug': 'rwanda',
      'label': 'Rwanda'
    },
    {
      'slug': 'sahara-occidental',
      'label': 'Sahara Occidental'
    },
    {
      'slug': 'saint-kitts-&-nevis',
      'label': 'Saint Kitts & Nevis'
    },
    {
      'slug': 'saint-lucia',
      'label': 'Saint Lucia'
    },
    {
      'slug': 'saint-vincent-&-the-grenadines',
      'label': 'Saint Vincent & The Grenadines'
    },
    {
      'slug': 'samoa',
      'label': 'Samoa'
    },
    {
      'slug': 'san-marino',
      'label': 'San Marino'
    },
    {
      'slug': 'sao-tome-&-principe',
      'label': 'Sao Tome & Principe'
    },
    {
      'slug': 'saudi-arabia',
      'label': 'Saudi Arabia'
    },
    {
      'slug': 'senegal',
      'label': 'Senegal'
    },
    {
      'slug': 'serbia',
      'label': 'Serbia'
    },
    {
      'slug': 'seychelles',
      'label': 'Seychelles'
    },
    {
      'slug': 'sierra-leone',
      'label': 'Sierra Leone'
    },
    {
      'slug': 'singapore',
      'label': 'Singapore'
    },
    {
      'slug': 'slovakia',
      'label': 'Slovakia'
    },
    {
      'slug': 'slovenia',
      'label': 'Slovenia'
    },
    {
      'slug': 'solomon-islands',
      'label': 'Solomon Islands'
    },
    {
      'slug': 'somalia',
      'label': 'Somalia'
    },
    {
      'slug': 'south-africa',
      'label': 'South Africa'
    },
    {
      'slug': 'south-korea',
      'label': 'South Korea'
    },
    {
      'slug': 'south-sudan',
      'label': 'South Sudan'
    },
    {
      'slug': 'spain',
      'label': 'Spain'
    },
    {
      'slug': 'sri-lanka',
      'label': 'Sri Lanka'
    },
    {
      'slug': 'sudan',
      'label': 'Sudan'
    },
    {
      'slug': 'suriname',
      'label': 'Suriname'
    },
    {
      'slug': 'swaziland',
      'label': 'Swaziland'
    },
    {
      'slug': 'sweden',
      'label': 'Sweden'
    },
    {
      'slug': 'switzerland',
      'label': 'Switzerland'
    },
    {
      'slug': 'syria',
      'label': 'Syria'
    },
    {
      'slug': 'tadjikistan',
      'label': 'Tadjikistan'
    },
    {
      'slug': 'tanzania',
      'label': 'Tanzania'
    },
    {
      'slug': 'thailand',
      'label': 'Thailand'
    },
    {
      'slug': 'timor-leste',
      'label': 'Timor-Leste'
    },
    {
      'slug': 'togo',
      'label': 'Togo'
    },
    {
      'slug': 'tonga',
      'label': 'Tonga'
    },
    {
      'slug': 'tunisia',
      'label': 'Tunisia'
    },
    {
      'slug': 'turkey',
      'label': 'Turkey'
    },
    {
      'slug': 'turkmenistan',
      'label': 'Turkmenistan'
    },
    {
      'slug': 'tuvalu',
      'label': 'Tuvalu'
    },
    {
      'slug': 'uganda',
      'label': 'Uganda'
    },
    {
      'slug': 'ukraine',
      'label': 'Ukraine'
    },
    {
      'slug': 'united-arab-emirates',
      'label': 'United Arab Emirates'
    },
    {
      'slug': 'united-kingdom',
      'label': 'United Kingdom'
    },
    {
      'slug': 'united-states',
      'label': 'United States'
    },
    {
      'slug': 'uruguay',
      'label': 'Uruguay'
    },
    {
      'slug': 'uzbekistan',
      'label': 'Uzbekistan'
    },
    {
      'slug': 'vanuatu',
      'label': 'Vanuatu'
    },
    {
      'slug': 'vatican-city',
      'label': 'Vatican City'
    },
    {
      'slug': 'venezuela',
      'label': 'Venezuela'
    },
    {
      'slug': 'vietnam',
      'label': 'Vietnam'
    },
    {
      'slug': 'yemen',
      'label': 'Yemen'
    },
    {
      'slug': 'zambia',
      'label': 'Zambia'
    },
    {
      'slug': 'zanzibar',
      'label': 'Zanzibar'
    },
    {
      'slug': 'zimbabwe',
      'label': 'Zimbabwe'
    }
  ]
};

export const getSlug = (scope: string, str: string) => {
  const item = models[scope].find(i => i.slug === str.trim().toLowerCase());
  return item !== undefined ? item.slug : false;
};

export const getLabelBySlug = (scope: string, slug: string) => {
  const item = models[scope].find(i => i.slug === slug);
  return item !== undefined ? item.label : '';
};

export default models;

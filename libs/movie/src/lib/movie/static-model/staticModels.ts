interface Model {
  GENRES: readonly SlugAndLabel[];
  PROMOTIONAL_ELEMENT_TYPES: readonly SlugAndLabel[];
  RESOURCE_SIZES: readonly SlugAndLabel[];
  RESOURCE_RATIOS: readonly SlugAndLabel[];
  STAKEHOLDER_ROLES: readonly SlugAndLabel[];
  STAKEHOLDER_DELIVERY_AUTHORIZATIONS: readonly SlugAndLabel[];
  CREDIT_ROLES: readonly SlugAndLabel[];
  MOVIE_STATUS: readonly SlugAndLabel[];
  LANGUAGES: readonly SlugAndLabel[];
  MOVIE_CURRENCIES: readonly CurrencyWithLabel[];
  SELECTION_CATEGORIES: readonly SlugAndLabel[];
  SCORING: readonly SlugAndLabel[];
  RATING: readonly SlugAndLabel[];
  COLORS: readonly SlugAndLabel[];
  CERTIFICATIONS: readonly SlugAndLabel[];
  TERRITORIES: readonly SlugAndLabel[];
  MEDIAS: readonly SlugAndLabel[];
  LEGAL_ROLES: readonly SlugAndLabel[];
  MOVIE_FORMAT: readonly SlugAndLabel[];
  MOVIE_FORMAT_QUALITY: readonly SlugAndLabel[],
  SOUND_FORMATS: readonly SlugAndLabel[]
}

export type Scope = keyof Model;

const models: Model = {
  'GENRES': [
    { 'slug': 'comedy', 'label': 'Comedy' },
    { 'slug': 'drama', 'label': 'Drama' },
    { 'slug': 'action', 'label': 'Action' },
    { 'slug': 'horror', 'label': 'Horror' },
    { 'slug': 'science-fiction', 'label': 'Science Fiction' },
    { 'slug': 'thriller', 'label': 'Thriller' },
    { 'slug': 'coming-of-age', 'label': 'Coming of Age' },
    { 'slug': 'fantasy', 'label': 'Fantasy' },
    { 'slug': 'romance', 'label': 'Romance' },
    { 'slug': 'western', 'label': 'Western' },
    { 'slug': 'period-piece', 'label': 'Period Piece' },
    { 'slug': 'adventure', 'label': 'Adventure' },
    { 'slug': 'biography', 'label': 'Biography' },
    { 'slug': 'war', 'label': 'War' },
    { 'slug': 'police', 'label': 'Police' },
    { 'slug': 'animation', 'label': 'Animation' },
    { 'slug': 'documentary', 'label': 'Documentary' },
    { 'slug': 'erotic', 'label': 'Erotic' },
    { 'slug': 'tv-show', 'label': 'TV Show' },
    { 'slug': 'web-series', 'label': 'Web Series' },
    { 'slug': 'virtual-reality', 'label': 'Virtual Reality' },
    { 'slug': 'family', 'label': 'Family' }
  ] as const,
  'PROMOTIONAL_ELEMENT_TYPES': [
    { 'slug': 'trailer', 'label': 'Trailer' },
    { 'slug': 'poster', 'label': 'Poster' },
    { 'slug': 'reel', 'label': 'Reel' },
    { 'slug': 'scenario', 'label': 'Scenario' },
    { 'slug': 'other', 'label': 'Other' },
    { 'slug': 'banner', 'label': 'Banner' },
    { 'slug': 'screener', 'label': 'Screener' },
    { 'slug': 'teaser', 'label': 'Teaser' },
  ] as const,
  'RESOURCE_SIZES': [
    { 'slug': 'medium', 'label': 'Medium' },
    { 'slug': 'small', 'label': 'Small' },
    { 'slug': 'large', 'label': 'Large' },
    { 'slug': 'thumbnail', 'label': 'Thumbnail' },
  ] as const,
  'RESOURCE_RATIOS': [
    { 'slug': '16/9', 'label': '16:9' },
    { 'slug': '4/3', 'label': '4:3' },
    { 'slug': 'round', 'label': 'Round' },
    { 'slug': 'square', 'label': 'Square' },
    { 'slug': 'rectangle', 'label': 'Rectangle' },
  ] as const,
  'STAKEHOLDER_ROLES': [
    {
      'slug': 'executive-producer',
      'label': 'Executive Producer'
    },
    {
      'slug': 'co-producer',
      'label': 'Co-Producer'
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
  ] as const,
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
    },
    {
      'slug': 'score-composer',
      'label': 'Score Composer'
    },
    {
      'slug': 'dialogue-writer',
      'label': 'Dialogue Writer'
    },
    {
      'slug': 'director-of-photography',
      'label': 'Director of Photography'
    },
    {
      'slug': 'editor',
      'label': 'Editor'
    },
    {
      'slug': 'casting-director',
      'label': 'Casting Director'
    },
    {
      'slug': 'artistic-director',
      'label': 'Artistic Director'
    },
    {
      'slug': 'production-manager',
      'label': 'Production Manager'
    },
    {
      'slug': 'costume-designer',
      'label': 'Costume Designer'
    },
    {
      'slug': 'make-up-artist',
      'label': 'Make-Up Artist'
    },
    {
      'slug': 'production-designer',
      'label': 'Production Designer'
    },
    {
      'slug': 'first-assistant-director',
      'label': '1st Assistant Director'
    },
    {
      'slug': 'second-assistant-director',
      'label': '2nd Assistant Director'
    },
    {
      'slug': 'post-production-director',
      'label': 'Post-Production Director'
    },
    {
      'slug': 'original-author',
      'label': 'Original Author'
    },
  ],
  'MOVIE_STATUS': [
    {
      'slug': 'financing',
      'label': 'Pre-production'
    },
    {
      'slug': 'shooting',
      'label': 'In Production'
    },
    {
      'slug': 'post-production',
      'label': 'Post-production'
    },
    {
      'slug': 'finished',
      'label': 'Completed'
    }
  ] as const,
  'LANGUAGES': [ // @TODO (#1388) transform to RFC-5646
    { 'slug': 'albanian', 'label': 'Albanian' },
    { 'slug': 'arabic', 'label': 'Arabic' },
    { 'slug': 'armenian', 'label': 'Armenian' },
    { 'slug': 'azerbaijani', 'label': 'Azerbaijani' },
    { 'slug': 'bambara', 'label': 'Bambara' },
    { 'slug': 'basque', 'label': 'Basque' },
    { 'slug': 'belarussian', 'label': 'Belarussian' },
    { 'slug': 'bengali', 'label': 'Bengali' },
    { 'slug': 'bosnian', 'label': 'Bosnian' },
    { 'slug': 'bulgarian', 'label': 'Bulgarian' },
    { 'slug': 'burmese', 'label': 'Burmese' },
    { 'slug': 'cantonese', 'label': 'Cantonese' },
    { 'slug': 'catalan', 'label': 'Catalan' },
    { 'slug': 'croatian', 'label': 'Croatian' },
    { 'slug': 'czech', 'label': 'Czech' },
    { 'slug': 'danish', 'label': 'Danish' },
    { 'slug': 'dutch', 'label': 'Dutch' },
    { 'slug': 'english', 'label': 'English' },
    { 'slug': 'estonian', 'label': 'Estonian' },
    { 'slug': 'filipino', 'label': 'Filipino' },
    { 'slug': 'finnish', 'label': 'Finnish' },
    { 'slug': 'flemish', 'label': 'Flemish' },
    { 'slug': 'french', 'label': 'French' },
    { 'slug': 'gaelic', 'label': 'Gaelic' },
    { 'slug': 'galician', 'label': 'Galician' },
    { 'slug': 'georgian', 'label': 'Georgian' },
    { 'slug': 'german', 'label': 'German' },
    { 'slug': 'greek', 'label': 'Greek' },
    { 'slug': 'gujarati', 'label': 'Gujarati' },
    { 'slug': 'hebrew', 'label': 'Hebrew' },
    { 'slug': 'hindi', 'label': 'Hindi' },
    { 'slug': 'hungarian', 'label': 'Hungarian' },
    { 'slug': 'icelandic', 'label': 'Icelandic' },
    { 'slug': 'indonesian', 'label': 'Indonesian' },
    { 'slug': 'italian', 'label': 'Italian' },
    { 'slug': 'japanese', 'label': 'Japanese' },
    { 'slug': 'javanese', 'label': 'Javanese' },
    { 'slug': 'kannada', 'label': 'Kannada' },
    { 'slug': 'kazakh', 'label': 'Kazakh' },
    { 'slug': 'khmer', 'label': 'Khmer' },
    { 'slug': 'korean', 'label': 'Korean' },
    { 'slug': 'kosovan', 'label': 'Kosovan' },
    { 'slug': 'kurdish', 'label': 'Kurdish' },
    { 'slug': 'kyrgyz', 'label': 'Kyrgyz' },
    { 'slug': 'laotian', 'label': 'Laotian' },
    { 'slug': 'latvian', 'label': 'Latvian' },
    { 'slug': 'lingala', 'label': 'Lingala' },
    { 'slug': 'lithuanian', 'label': 'Lithuanian' },
    { 'slug': 'macedonian', 'label': 'Macedonian' },
    { 'slug': 'malayalam', 'label': 'Malayalam' },
    { 'slug': 'maltese', 'label': 'Maltese' },
    { 'slug': 'mandarin-chinese', 'label': 'Mandarin Chinese' },
    { 'slug': 'marathi', 'label': 'Marathi' },
    { 'slug': 'moldavian', 'label': 'Moldavian' },
    { 'slug': 'montenegrin', 'label': 'Montenegrin' },
    { 'slug': 'norwegian', 'label': 'Norwegian' },
    { 'slug': 'oriya', 'label': 'Oriya' },
    { 'slug': 'panjabi', 'label': 'Panjabi' },
    { 'slug': 'persian', 'label': 'Persian' },
    { 'slug': 'polish', 'label': 'Polish' },
    { 'slug': 'portuguese', 'label': 'Portuguese' },
    { 'slug': 'romanian', 'label': 'Romanian' },
    { 'slug': 'russian', 'label': 'Russian' },
    { 'slug': 'serbian', 'label': 'Serbian' },
    { 'slug': 'slovak', 'label': 'Slovak' },
    { 'slug': 'slovene', 'label': 'Slovene' },
    { 'slug': 'spanish', 'label': 'Spanish' },
    { 'slug': 'swahili', 'label': 'Swahili' },
    { 'slug': 'swedish', 'label': 'Swedish' },
    { 'slug': 'tajiki', 'label': 'Tajiki' },
    { 'slug': 'tamil', 'label': 'Tamil' },
    { 'slug': 'telugu', 'label': 'Telugu' },
    { 'slug': 'tetum', 'label': 'Tetum' },
    { 'slug': 'thai', 'label': 'Thai' },
    { 'slug': 'turkish', 'label': 'Turkish' },
    { 'slug': 'turkmen', 'label': 'Turkmen' },
    { 'slug': 'ukrainian', 'label': 'Ukrainian' },
    { 'slug': 'urdu', 'label': 'Urdu' },
    { 'slug': 'uzbek', 'label': 'Uzbek' },
    { 'slug': 'valencian', 'label': 'Valencian' },
    { 'slug': 'vietnamese', 'label': 'Vietnamese' },
    { 'slug': 'welsh', 'label': 'Welsh' },
  ] as const,
  'MOVIE_CURRENCIES': [
    {
      'slug': 'us-dollar',
      'label': 'US dollar',
      'code': 'USD'
    },
    {
      'slug': 'euro',
      'label': 'Euro',
      'code': 'EUR'
    },
    {
      'slug': 'japanese-yen',
      'label': 'Japanese yen',
      'code': 'JPY'
    },
    {
      'slug': 'pound-sterling',
      'label': 'Pound sterling',
      'code': 'GBP'
    },
    {
      'slug': 'australian-dollar',
      'label': 'Australian Dollar',
      'code': 'AUD'
    },
    {
      'slug': 'canadian-dollar',
      'label': 'Canadian Dollar',
      'code': 'CAD'
    },
    {
      'slug': 'swiss-franc',
      'label': 'Swiss Franc',
      'code': 'CHF'
    },
    {
      'slug': 'chinese-renminbi',
      'label': 'Chinese Renminbi',
      'code': 'CNY'
    },
    {
      'slug': 'swedish-krona',
      'label': 'Swedish krona',
      'code': 'SEK'
    },
    {
      'slug': 'new-zealand-dollar',
      'label': 'New Zealand dollar',
      'code': 'NZD'
    }
  ] as const,
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
  ] as const,
  'SCORING': [
    {
      'slug': 'a',
      'label': 'A'
    },
    {
      'slug': 'b',
      'label': 'B'
    },
    {
      'slug': 'c',
      'label': 'C'
    },
    {
      'slug': 'd',
      'label': 'D'
    },
  ] as const,
  'RATING': [
    {
      'slug': 'pegi',
      'label': 'PEGI'
    },
    {
      'slug': 'csa',
      'label': 'CSA'
    },
    {
      'slug': 'cnc',
      'label': 'CNC'
    },
  ] as const,
  'COLORS': [
    {
      'slug': 'c',
      'label': 'Color'
    },
    {
      'slug': 'b',
      'label': 'Black & white'
    }
  ] as const,
  'CERTIFICATIONS': [
    {
      'slug': 'art-essai',
      'label': 'Art & Essai'
    },
    {
      'slug': 'eof',
      'label': 'EOF'
    },
    {
      'slug': 'media',
      'label': 'Media'
    },
    {
      'slug': 'awarded-film',
      'label': 'Awarded Film'
    },
    {
      'slug': 'a-list-cast',
      'label': 'A-list Cast'
    }
  ] as const,
  'TERRITORIES': [ // @TODO (#1388) transform to ISO-3166
    { 'slug': 'world', 'label': 'World' },
    { 'slug': 'afghanistan', 'label': 'Afghanistan' },
    { 'slug': 'albania', 'label': 'Albania' },
    { 'slug': 'algeria', 'label': 'Algeria' },
    { 'slug': 'american-samoa', 'label': 'American Samoa' },
    { 'slug': 'andaman-and-nicobar-islands-india', 'label': 'Andaman and Nicobar Islands (India)' },
    { 'slug': 'andorra', 'label': 'Andorra' },
    { 'slug': 'angola', 'label': 'Angola' },
    { 'slug': 'anguilla-uk', 'label': 'Anguilla (UK)' },
    { 'slug': 'antigua-barbuda', 'label': 'Antigua Barbuda' },
    { 'slug': 'argentina', 'label': 'Argentina' },
    { 'slug': 'armenia', 'label': 'Armenia' },
    { 'slug': 'aruba-netherlands', 'label': 'Aruba (Netherlands)' },
    { 'slug': 'ashmore-and-cartier-islands', 'label': 'Ashmore and Cartier Islands' },
    { 'slug': 'australia', 'label': 'Australia' },
    { 'slug': 'austria', 'label': 'Austria' },
    { 'slug': 'azerbaidjan', 'label': 'Azerbaidjan' },
    { 'slug': 'bahamas', 'label': 'Bahamas' },
    { 'slug': 'bahrain', 'label': 'Bahrain' },
    { 'slug': 'baker-island-usa', 'label': 'Baker Island (USA)' },
    { 'slug': 'bangladesh', 'label': 'Bangladesh' },
    { 'slug': 'barbados', 'label': 'Barbados' },
    { 'slug': 'belarus', 'label': 'Belarus' },
    { 'slug': 'belgium', 'label': 'Belgium' },
    { 'slug': 'belize', 'label': 'Belize' },
    { 'slug': 'benin', 'label': 'Benin' },
    { 'slug': 'bermuda', 'label': 'Bermuda' },
    { 'slug': 'bhutan', 'label': 'Bhutan' },
    { 'slug': 'bolivia', 'label': 'Bolivia' },
    { 'slug': 'bonaire', 'label': 'Bonaire' },
    { 'slug': 'bosnia-herzegovina', 'label': 'Bosnia Herzegovina' },
    { 'slug': 'botswana', 'label': 'Botswana' },
    { 'slug': 'brazil', 'label': 'Brazil' },
    { 'slug': 'british-virgin-islands', 'label': 'British Virgin Islands' },
    { 'slug': 'brunei', 'label': 'Brunei' },
    { 'slug': 'bulgaria', 'label': 'Bulgaria' },
    { 'slug': 'burkina-faso', 'label': 'Burkina Faso' },
    { 'slug': 'burundi', 'label': 'Burundi' },
    { 'slug': 'cabo-verde', 'label': 'Cabo Verde' },
    { 'slug': 'cambodia', 'label': 'Cambodia' },
    { 'slug': 'cameroon', 'label': 'Cameroon' },
    { 'slug': 'canada', 'label': 'Canada' },
    { 'slug': 'cayman-islands', 'label': 'Cayman Islands' },
    { 'slug': 'central-african-republic', 'label': 'Central African Republic' },
    { 'slug': 'chad', 'label': 'Chad' },
    { 'slug': 'channel-islands', 'label': 'Channel Islands' },
    { 'slug': 'chile', 'label': 'Chile' },
    { 'slug': 'china', 'label': 'China' },
    { 'slug': 'christmas-island-australia', 'label': 'Christmas Island (Australia)' },
    { 'slug': 'cocos-islands-australia', 'label': 'Cocos Islands (Australia)' },
    { 'slug': 'colombia', 'label': 'Colombia' },
    { 'slug': 'comoros', 'label': 'Comoros' },
    { 'slug': 'conakry', 'label': 'Conakry' },
    { 'slug': 'congo-brazzaville', 'label': 'Congo Brazzaville' },
    { 'slug': 'congo-democratic-republic-of-the', 'label': 'Congo Democratic Republic Of The' },
    { 'slug': 'cook-islands', 'label': 'Cook Islands' },
    { 'slug': 'corsica', 'label': 'Corsica' },
    { 'slug': 'costa-rica', 'label': 'Costa Rica' },
    { 'slug': 'cote-d-ivoire', 'label': 'Cote D\'ivoire' },
    { 'slug': 'croatia', 'label': 'Croatia' },
    { 'slug': 'cuba', 'label': 'Cuba' },
    { 'slug': 'cura-ao', 'label': 'Curaçao' },
    { 'slug': 'cyprus', 'label': 'Cyprus' },
    { 'slug': 'czech-republic', 'label': 'Czech Republic' },
    { 'slug': 'denmark', 'label': 'Denmark' },
    { 'slug': 'djibouti', 'label': 'Djibouti' },
    { 'slug': 'dominica', 'label': 'Dominica' },
    { 'slug': 'dominican-republic', 'label': 'Dominican Republic' },
    { 'slug': 'ecuador', 'label': 'Ecuador' },
    { 'slug': 'egypt', 'label': 'Egypt' },
    { 'slug': 'el-salvador', 'label': 'El Salvador' },
    { 'slug': 'equatorial-guinea', 'label': 'Equatorial Guinea' },
    { 'slug': 'eritrea', 'label': 'Eritrea' },
    { 'slug': 'estonia', 'label': 'Estonia' },
    { 'slug': 'ethiopia', 'label': 'Ethiopia' },
    { 'slug': 'falkland-islands', 'label': 'Falkland Islands' },
    { 'slug': 'federated-states-of-micronesia', 'label': 'Federated States Of Micronesia' },
    { 'slug': 'fiji', 'label': 'Fiji' },
    { 'slug': 'finland', 'label': 'Finland' },
    { 'slug': 'france', 'label': 'France' },
    { 'slug': 'french-guiana-french-drom', 'label': 'French Guiana (French DROM)' },
    { 'slug': 'french-polynesia-french-pom-com', 'label': 'French Polynesia (French POM COM)' },
    { 'slug': 'gabon', 'label': 'Gabon' },
    { 'slug': 'gambia', 'label': 'Gambia' },
    { 'slug': 'georgia', 'label': 'Georgia' },
    { 'slug': 'germany', 'label': 'Germany' },
    { 'slug': 'ghana', 'label': 'Ghana' },
    { 'slug': 'gibraltar', 'label': 'Gibraltar' },
    { 'slug': 'greece', 'label': 'Greece' },
    { 'slug': 'grenada', 'label': 'Grenada' },
    { 'slug': 'guadeloupe-french-drom', 'label': 'Guadeloupe (French DROM)' },
    { 'slug': 'guam-usa', 'label': 'Guam (USA)' },
    { 'slug': 'guatemala', 'label': 'Guatemala' },
    { 'slug': 'guinea-bissau', 'label': 'Guinea-Bissau' },
    { 'slug': 'guyana', 'label': 'Guyana' },
    { 'slug': 'haiti', 'label': 'Haiti' },
    { 'slug': 'honduras', 'label': 'Honduras' },
    { 'slug': 'hong-kong', 'label': 'Hong Kong' },
    { 'slug': 'hungary', 'label': 'Hungary' },
    { 'slug': 'iceland', 'label': 'Iceland' },
    { 'slug': 'india', 'label': 'India' },
    { 'slug': 'indonesia', 'label': 'Indonesia' },
    { 'slug': 'irak', 'label': 'Irak' },
    { 'slug': 'iran', 'label': 'Iran' },
    { 'slug': 'ireland', 'label': 'Ireland' },
    { 'slug': 'islands-of-the-saints-french-drom', 'label': 'Islands of the Saints (French DROM)' },
    { 'slug': 'isle-of-man-uk', 'label': 'Isle of Man (UK)' },
    { 'slug': 'israel', 'label': 'Israel' },
    { 'slug': 'italy', 'label': 'Italy' },
    { 'slug': 'jamaica', 'label': 'Jamaica' },
    { 'slug': 'japan', 'label': 'Japan' },
    { 'slug': 'jordan', 'label': 'Jordan' },
    { 'slug': 'kazakhstan', 'label': 'Kazakhstan' },
    { 'slug': 'kenya', 'label': 'Kenya' },
    { 'slug': 'kiribati', 'label': 'Kiribati' },
    { 'slug': 'koper', 'label': 'Koper' },
    { 'slug': 'kosovo', 'label': 'Kosovo' },
    { 'slug': 'kuwait', 'label': 'Kuwait' },
    { 'slug': 'kyrgyzstan', 'label': 'Kyrgyzstan' },
    { 'slug': 'la-d-sirade-french-drom', 'label': 'La Désirade (French DROM)' },
    { 'slug': 'laos', 'label': 'Laos' },
    { 'slug': 'latvia', 'label': 'Latvia' },
    { 'slug': 'lebanon', 'label': 'Lebanon' },
    { 'slug': 'leeward-islands', 'label': 'Leeward Islands' },
    { 'slug': 'lesotho', 'label': 'Lesotho' },
    { 'slug': 'liberia', 'label': 'Liberia' },
    { 'slug': 'libya', 'label': 'Libya' },
    { 'slug': 'liechtenstein', 'label': 'Liechtenstein' },
    { 'slug': 'lithuania', 'label': 'Lithuania' },
    { 'slug': 'luxembourg', 'label': 'Luxembourg' },
    { 'slug': 'macao', 'label': 'Macao' },
    { 'slug': 'macedonia', 'label': 'Macedonia' },
    { 'slug': 'madagascar', 'label': 'Madagascar' },
    { 'slug': 'malawi', 'label': 'Malawi' },
    { 'slug': 'malaysia', 'label': 'Malaysia' },
    { 'slug': 'maldives', 'label': 'Maldives' },
    { 'slug': 'mali', 'label': 'Mali' },
    { 'slug': 'malta', 'label': 'Malta' },
    { 'slug': 'mariana-islands', 'label': 'Mariana Islands' },
    { 'slug': 'marie-galante-french-drom', 'label': 'Marie-Galante (French DROM)' },
    { 'slug': 'marshall-islands', 'label': 'Marshall Islands' },
    { 'slug': 'martinique-french-drom', 'label': 'Martinique (French DROM)' },
    { 'slug': 'mauritania', 'label': 'Mauritania' },
    { 'slug': 'mauritius', 'label': 'Mauritius' },
    { 'slug': 'mayotte-french-drom', 'label': 'Mayotte (French DROM)' },
    { 'slug': 'mexico', 'label': 'Mexico' },
    { 'slug': 'millennium-island-usa', 'label': 'Millennium Island (USA)' },
    { 'slug': 'moldova', 'label': 'Moldova' },
    { 'slug': 'monaco', 'label': 'Monaco' },
    { 'slug': 'mongolia', 'label': 'Mongolia' },
    { 'slug': 'montenegro', 'label': 'Montenegro' },
    { 'slug': 'montserrat', 'label': 'Montserrat' },
    { 'slug': 'morocco', 'label': 'Morocco' },
    { 'slug': 'mozambique', 'label': 'Mozambique' },
    { 'slug': 'myanmar', 'label': 'Myanmar' },
    { 'slug': 'namibia', 'label': 'Namibia' },
    { 'slug': 'nauru', 'label': 'Nauru' },
    { 'slug': 'nepal', 'label': 'Nepal' },
    { 'slug': 'netherlands', 'label': 'Netherlands' },
    { 'slug': 'netherlands-antilles', 'label': 'Netherlands Antilles' },
    { 'slug': 'new-caledonia-french-pom', 'label': 'New Caledonia (French POM)' },
    { 'slug': 'new-zealand', 'label': 'New Zealand' },
    { 'slug': 'nicaragua', 'label': 'Nicaragua' },
    { 'slug': 'niger', 'label': 'Niger' },
    { 'slug': 'nigeria', 'label': 'Nigeria' },
    { 'slug': 'niue', 'label': 'Niue' },
    { 'slug': 'norfolk-island', 'label': 'Norfolk Island' },
    { 'slug': 'north-korea', 'label': 'North Korea' },
    { 'slug': 'norway', 'label': 'Norway' },
    { 'slug': 'oman', 'label': 'Oman' },
    { 'slug': 'pakistan', 'label': 'Pakistan' },
    { 'slug': 'palau', 'label': 'Palau' },
    { 'slug': 'palestine', 'label': 'Palestine' },
    { 'slug': 'panama', 'label': 'Panama' },
    { 'slug': 'papua-new-guinea', 'label': 'Papua New Guinea' },
    { 'slug': 'paraguay', 'label': 'Paraguay' },
    { 'slug': 'peru', 'label': 'Peru' },
    { 'slug': 'philippines', 'label': 'Philippines' },
    { 'slug': 'pitcairn-islands', 'label': 'Pitcairn Islands' },
    { 'slug': 'poland', 'label': 'Poland' },
    { 'slug': 'portugal', 'label': 'Portugal' },
    { 'slug': 'puerto-rico', 'label': 'Puerto Rico' },
    { 'slug': 'qatar', 'label': 'Qatar' },
    { 'slug': 'r-union-french-drom', 'label': 'Réunion (French DROM)' },
    { 'slug': 'romania', 'label': 'Romania' },
    { 'slug': 'russia', 'label': 'Russia' },
    { 'slug': 'rwanda', 'label': 'Rwanda' },
    { 'slug': 'saba-island', 'label': 'Saba Island' },
    { 'slug': 'sahara-occidental', 'label': 'Sahara Occidental' },
    { 'slug': 'saint-barth-lemy-french-com', 'label': 'Saint Barthélemy (French COM)' },
    { 'slug': 'saint-helena', 'label': 'Saint Helena' },
    { 'slug': 'saint-kitts-nevis', 'label': 'Saint Kitts Nevis' },
    { 'slug': 'saint-lucia', 'label': 'Saint Lucia' },
    { 'slug': 'saint-martin-dutch-part', 'label': 'Saint Martin (Dutch Part)' },
    { 'slug': 'saint-martin-french-com', 'label': 'Saint Martin (French COM)' },
    { 'slug': 'saint-pierre-and-miquelon-french-com', 'label': 'Saint Pierre and Miquelon (French COM)' },
    { 'slug': 'saint-vincent-the-grenadines', 'label': 'Saint Vincent The Grenadines' },
    { 'slug': 'samoa', 'label': 'Samoa' },
    { 'slug': 'san-marino', 'label': 'San Marino' },
    { 'slug': 'sao-tome-principe', 'label': 'Sao Tome Principe' },
    { 'slug': 'saudi-arabia', 'label': 'Saudi Arabia' },
    { 'slug': 'senegal', 'label': 'Senegal' },
    { 'slug': 'serbia', 'label': 'Serbia' },
    { 'slug': 'seychelles', 'label': 'Seychelles' },
    { 'slug': 'sierra-leone', 'label': 'Sierra Leone' },
    { 'slug': 'singapore', 'label': 'Singapore' },
    { 'slug': 'sint-eustatius', 'label': 'Sint Eustatius' },
    { 'slug': 'slovakia', 'label': 'Slovakia' },
    { 'slug': 'slovenia', 'label': 'Slovenia' },
    { 'slug': 'solomon-islands', 'label': 'Solomon Islands' },
    { 'slug': 'somalia', 'label': 'Somalia' },
    { 'slug': 'south-africa', 'label': 'South Africa' },
    { 'slug': 'south-korea', 'label': 'South Korea' },
    { 'slug': 'south-sudan', 'label': 'South Sudan' },
    { 'slug': 'spain', 'label': 'Spain' },
    { 'slug': 'sri-lanka', 'label': 'Sri Lanka' },
    { 'slug': 'sudan', 'label': 'Sudan' },
    { 'slug': 'suriname', 'label': 'Suriname' },
    { 'slug': 'swaziland', 'label': 'Swaziland' },
    { 'slug': 'sweden', 'label': 'Sweden' },
    { 'slug': 'switzerland', 'label': 'Switzerland' },
    { 'slug': 'syria', 'label': 'Syria' },
    { 'slug': 'tadjikistan', 'label': 'Tadjikistan' },
    { 'slug': 'taiwan', 'label': 'Taiwan' },
    { 'slug': 'tanzania', 'label': 'Tanzania' },
    { 'slug': 'thailand', 'label': 'Thailand' },
    { 'slug': 'timor-leste', 'label': 'Timor-Leste' },
    { 'slug': 'togo', 'label': 'Togo' },
    { 'slug': 'tokelau-islands', 'label': 'Tokelau Islands' },
    { 'slug': 'tonga', 'label': 'Tonga' },
    { 'slug': 'trentino-alto-adige-italy', 'label': 'Trentino-Alto Adige (Italy)' },
    { 'slug': 'trinidad-and-tobago', 'label': 'Trinidad and Tobago' },
    { 'slug': 'tunisia', 'label': 'Tunisia' },
    { 'slug': 'turkey', 'label': 'Turkey' },
    { 'slug': 'turkmenistan', 'label': 'Turkmenistan' },
    { 'slug': 'turks-and-caicos-islands', 'label': 'Turks and Caicos Islands' },
    { 'slug': 'tuvalu', 'label': 'Tuvalu' },
    { 'slug': 'uganda', 'label': 'Uganda' },
    { 'slug': 'ukraine', 'label': 'Ukraine' },
    { 'slug': 'united-arab-emirates', 'label': 'United Arab Emirates' },
    { 'slug': 'united-kingdom', 'label': 'United Kingdom' },
    { 'slug': 'united-states', 'label': 'United States' },
    { 'slug': 'united-states-virgin-islands', 'label': 'United States Virgin Islands' },
    { 'slug': 'uruguay', 'label': 'Uruguay' },
    { 'slug': 'uzbekistan', 'label': 'Uzbekistan' },
    { 'slug': 'vanuatu', 'label': 'Vanuatu' },
    { 'slug': 'vatican-city', 'label': 'Vatican City' },
    { 'slug': 'venezuela', 'label': 'Venezuela' },
    { 'slug': 'vietnam', 'label': 'Vietnam' },
    { 'slug': 'wallis-and-futuna-french-com', 'label': 'Wallis and Futuna (French COM)' },
    { 'slug': 'windward-islands', 'label': 'Windward Islands' },
    { 'slug': 'yemen', 'label': 'Yemen' },
    { 'slug': 'zambia', 'label': 'Zambia' },
    { 'slug': 'zanzibar', 'label': 'Zanzibar' },
    { 'slug': 'zimbabwe', 'label': 'Zimbabwe' },
    { 'slug': 'antigua-&-barbuda', 'label': 'Antigua & Barbuda' },
    { 'slug': 'bosnia-&-herzegovina', 'label': 'Bosnia & Herzegovina' },
    { 'slug': 'ile-saint-helene', 'label': 'Ile Saint Helene' },
    { 'slug': 'saint-kitts-&-nevis', 'label': 'Saint Kitts & Nevis' },
    { 'slug': 'saint-vincent-&-the-grenadines', 'label': 'Saint Vincent & The Grenadines' },
    { 'slug': 'sao-tome-&-principe', 'label': 'Sao Tome & Principe' }
  ] as const,
  'MEDIAS': [
    { 'slug': 'pay-tv', 'label': 'Pay TV' },
    { 'slug': 'pay-per-view', 'label': 'Pay Per View' },
    { 'slug': 'free-tv', 'label': 'Free TV' },
    { 'slug': 't-vod-er-dtr-streaming', 'label': 'T-VOD, ER, DTR, Streaming' },
    { 'slug': 'est-dto-download', 'label': 'EST, DTO, Download' },
    { 'slug': 'n-vod', 'label': 'N-VOD' },
    { 'slug': 'a-vod', 'label': 'A-VOD' },
    { 'slug': 'f-vod', 'label': 'F-VOD' },
    { 'slug': 's-vod', 'label': 'S-VOD' },
    { 'slug': 'all-rights', 'label': 'All rights' },
    { 'slug': 'theatrical', 'label': 'Theatrical' },
    { 'slug': 'video', 'label': 'Video' },
    { 'slug': 'planes', 'label': 'Planes' },
    { 'slug': 'boats', 'label': 'Boats' },
    { 'slug': 'hotels', 'label': 'Hotels' },
    { 'slug': 'trains', 'label': 'Trains' },
    { 'slug': 'remake', 'label': 'Remake' },
    { 'slug': 'book-adaptation', 'label': 'Book Adaptation' },
    { 'slug': 'music-publishing', 'label': 'Music Publishing' },
    { 'slug': 'merchandising', 'label': 'Merchandising' },
  ] as const,
  'LEGAL_ROLES': [
    { 'slug': 'service-provider', 'label': 'Service provider' },
    { 'slug': 'licensor', 'label': 'Licensor' },
    { 'slug': 'licensee', 'label': 'Licensee' },
    { 'slug': 'seller', 'label': 'Seller' },
    { 'slug': 'lender', 'label': 'Lender' },
    { 'slug': 'signatory', 'label': 'Signatory' },
    { 'slug': 'promisor', 'label': 'Promisor' },
    { 'slug': 'promisee', 'label': 'Promisee' },
    { 'slug': 'beneficiary', 'label': 'Beneficiary' },
    { 'slug': 'third-party', 'label': 'Third party' },
    { 'slug': 'purchaser', 'label': 'Purchaser' },
  ] as const,
  'MOVIE_FORMAT': [
    { 'slug': '1_33', 'label': '1.33' },
    { 'slug': '1_37', 'label': '1.37' },
    { 'slug': '1_66', 'label': '1.66' },
    { 'slug': '1_77', 'label': '1.77' },
    { 'slug': '1_85', 'label': '1.85' },
    { 'slug': 'scope', 'label': 'SCOPE' },
    { 'slug': '4/3', 'label': '4/3' },
    { 'slug': '16/9', 'label': '16/9' },
  ] as const,
  'MOVIE_FORMAT_QUALITY': [
    { 'slug': 'sd', 'label': 'SD' },
    { 'slug': 'hd', 'label': 'HD' },
    { 'slug': '2k', 'label': '2K' },
    { 'slug': '4k', 'label': '4K' },
  ] as const,
  'SOUND_FORMATS': [
    { 'slug': 'mono', 'label': 'Mono' },
    { 'slug': 'stereo', 'label': 'Stereo' },
    { 'slug': 'dolby-sr', 'label': 'Dolby SR' },
    { 'slug': 'dts', 'label': 'DTS' },
    { 'slug': 'dolby-5.1', 'label': 'Dolby 5.1' },
    { 'slug': 'dolby-7.1', 'label': 'Dolby 7.1' },
    { 'slug': 'thx', 'label': 'THX' },
  ]
};

/**
 * Checks if given code (or slug) exists in above static models
 * @dev If it exists, return code else false
 * @param scope
 * @param str
 */
export const getCodeIfExists = (scope: Scope, str: string) => {
  let item = models[scope].find(i => i.slug.trim().toLowerCase() === str.trim().toLowerCase());
  if (item) { return item.slug }

  item = models[scope].find(i => i.label.trim().toLowerCase() === str.trim().toLowerCase());
  if (item) { return item.slug }

  return null;
};

/**
 * Returns the label corresponding to a slug (ie:code).
 * @dev Codes are used to store sanitized data in database
 * @param scope
 * @param slug
 */
export const getLabelByCode = (scope: Scope, slug: string) => {
  const item = models[scope].find(i => i.slug === slug);
  return item ? item.label : '';
};

export default models;

export interface SlugAndLabel {
  label: string;
  slug: string;
}

export interface CurrencyWithLabel {
  label: string;
  slug: string;
  code: string;
}

/** Used in notifications/invitations to define which app is concerned. */
export const enum App {
  main = 'main',
  delivery = 'delivery',
  catalog = 'catalog'
}

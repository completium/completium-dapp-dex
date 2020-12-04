export const appTitle = "Exchange city coins!"

export const network = "delphinet"

export const appName = "CityDexCorp."

export const cities = [ 'tezos', 'paris', 'london', 'moscow', 'nyc', 'tokyo', 'sydney', 'athenes', 'rio', 'rome' ];

export const getCityName = (city) => {
  switch(city) {
    case 'tezos'   : return 'Tezos';
    case 'paris'   : return 'Paris';
    case 'london'  : return 'London';
    case 'moscow'  : return 'Moscow';
    case 'nyc'     : return 'New York City';
    case 'tokyo'   : return 'Tokyo';
    case 'sydney'  : return 'Sydney';
    case 'athenes' : return 'Athens';
    case 'rio'     : return 'Rio de Janeiro';
    case 'rome'    : return 'Rome';
    default : return '';
  }
}

export const getCoinLabel = (city) => {
  switch(city) {
    case 'tezos'   : return 'XTZ';
    case 'paris'   : return 'XPA';
    case 'london'  : return 'XLD';
    case 'moscow'  : return 'XMO';
    case 'nyc'     : return 'XNY';
    case 'tokyo'   : return 'XTK';
    case 'sydney'  : return 'XSD';
    case 'athenes' : return 'XAT';
    case 'rio'     : return 'XRI';
    case 'rome'    : return 'XRO';
    default : return '';
  }
}

export const getBalanceFor = (coin) => {
  const balance = {
  'XLD' : '3450',
  'XPA' : '1230',
  'XNY' : '560',
  'XRO' : '0',
  'XTK' : '0',
  'XAT' : '0',
  'XMO' : '0',
  'XSD' : '345',
  'XRI' : '0',
  };
  return balance[coin];
}
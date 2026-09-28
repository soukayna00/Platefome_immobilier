export const demoProperties = [
  {id:1,title:'Villa contemporaine avec piscine',city:'Marrakech',neighborhood:'Route de l’Ourika',propertyType:'Villa',transaction:'vente',price:4200000,area:320,bedrooms:4,image:'/images/villa.webp'},
  {id:2,title:'Riad rénové au cœur de la médina',city:'Fès',neighborhood:'Médina',propertyType:'Riad',transaction:'location',price:18000,area:180,bedrooms:3,image:'/images/riad.webp'},
  {id:3,title:'Appartement avec terrasse vue mer',city:'Casablanca',neighborhood:'Aïn Diab',propertyType:'Appartement',transaction:'vente',price:2950000,area:145,bedrooms:3,image:'/images/apartment.webp'},
  {id:4,title:'Appartement lumineux à Malabata',city:'Tanger',neighborhood:'Malabata',propertyType:'Appartement',transaction:'location',price:10500,area:95,bedrooms:2,image:'/images/tanger_apartment.webp'},
  {id:5,title:'Villa avec jardin à Souissi',city:'Rabat',neighborhood:'Souissi',propertyType:'Villa',transaction:'vente',price:5800000,area:390,bedrooms:5,image:'/images/villa.webp'},
]
export const formatPrice = property => `${new Intl.NumberFormat('fr-FR').format(property.price)} MAD${property.transaction === 'location' ? ' / mois' : ''}`

import type {
  AppUser,
  Booking,
  Charge,
  Chef,
  ChefCategoryPrice,
  Menu,
  Package,
  Service,
  ServiceCategory } from
'../types';

export const serviceCategories: ServiceCategory[] = [
{
  id: 'cat_private',
  name: 'Private Dining',
  slug: 'private-dining',
  description: 'Multi-course dining experiences hosted in the client’s home.',
  icon: 'UtensilsCrossed',
  status: 'active',
  createdAt: '2025-11-04'
},
{
  id: 'cat_events',
  name: 'Events & Catering',
  slug: 'events-catering',
  description: 'Weddings, corporate functions and large format catering.',
  icon: 'PartyPopper',
  status: 'active',
  createdAt: '2025-12-12'
},
{
  id: 'cat_weekly',
  name: 'Weekly Meal Prep',
  slug: 'weekly-meal-prep',
  description: 'Recurring in-home batch cooking and nutrition plans.',
  icon: 'CalendarRange',
  status: 'active',
  createdAt: '2026-01-19'
},
{
  id: 'cat_class',
  name: 'Cooking Classes',
  slug: 'cooking-classes',
  description: 'Hands-on technique workshops led by a professional chef.',
  icon: 'GraduationCap',
  status: 'inactive',
  createdAt: '2026-02-28'
}];


export const services: Service[] = [
{
  id: 'svc_tasting',
  name: 'Signature Tasting Menu',
  categoryId: 'cat_private',
  description: 'Seven-course chef-curated tasting with wine pairing guidance.',
  basePrice: 480,
  durationHours: 5,
  minGuests: 2,
  maxGuests: 12,
  status: 'active',
  createdAt: '2025-11-06',
  terms: [
  {
    id: 'trm_1',
    title: 'Cancellation Policy',
    body: 'Full refund up to 72 hours before service. Within 72 hours, 50% of the service fee is retained to cover sourcing and chef scheduling.',
    required: true
  },
  {
    id: 'trm_2',
    title: 'Kitchen Requirements',
    body: 'The client must provide a working oven, a minimum of four burners, running hot water and at least 2m of clear counter space.',
    required: true
  },
  {
    id: 'trm_3',
    title: 'Grocery Reconciliation',
    body: 'Grocery costs are estimated at booking and reconciled against receipts within 48 hours of service. Differences over 10% are refunded or invoiced.',
    required: false
  }]

},
{
  id: 'svc_dinner',
  name: 'Intimate Dinner Party',
  categoryId: 'cat_private',
  description: 'Three-course seated dinner including service and full cleanup.',
  basePrice: 320,
  durationHours: 4,
  minGuests: 2,
  maxGuests: 10,
  status: 'active',
  createdAt: '2025-11-21',
  terms: [
  {
    id: 'trm_4',
    title: 'Cancellation Policy',
    body: 'Full refund up to 48 hours before service.',
    required: true
  },
  {
    id: 'trm_5',
    title: 'Allergen Disclosure',
    body: 'All allergies and dietary restrictions must be declared at least 96 hours before service.',
    required: true
  }]

},
{
  id: 'svc_wedding',
  name: 'Wedding Catering',
  categoryId: 'cat_events',
  description: 'Full-service catering with brigade staffing for 40+ guests.',
  basePrice: 2400,
  durationHours: 10,
  minGuests: 40,
  maxGuests: 250,
  status: 'active',
  createdAt: '2025-12-18',
  terms: [
  {
    id: 'trm_6',
    title: 'Deposit Terms',
    body: 'A non-refundable 30% deposit secures the date. Balance is due 14 days before the event.',
    required: true
  }]

},
{
  id: 'svc_corporate',
  name: 'Corporate Lunch Service',
  categoryId: 'cat_events',
  description: 'Office lunch service with rotating seasonal menus.',
  basePrice: 900,
  durationHours: 6,
  minGuests: 15,
  maxGuests: 80,
  status: 'active',
  createdAt: '2026-01-08',
  terms: []
},
{
  id: 'svc_mealprep',
  name: 'Weekly Meal Prep',
  categoryId: 'cat_weekly',
  description: 'Ten prepped meals cooked on-site, portioned and labelled.',
  basePrice: 260,
  durationHours: 4,
  minGuests: 1,
  maxGuests: 6,
  status: 'active',
  createdAt: '2026-01-22',
  terms: [
  {
    id: 'trm_7',
    title: 'Recurring Billing',
    body: 'Weekly plans renew automatically every Sunday and can be paused with 24 hours notice.',
    required: true
  }]

},
{
  id: 'svc_masterclass',
  name: 'Pasta Masterclass',
  categoryId: 'cat_class',
  description: 'Two-hour hands-on fresh pasta workshop for up to eight guests.',
  basePrice: 180,
  durationHours: 2,
  minGuests: 2,
  maxGuests: 8,
  status: 'inactive',
  createdAt: '2026-03-02',
  terms: []
}];


export const users: AppUser[] = [
{
  id: 'usr_1',
  name: 'Amara Whitfield',
  email: 'amara.whitfield@northwind.co',
  phone: '+1 415 220 8841',
  city: 'San Francisco, CA',
  status: 'approved',
  bookings: 14,
  lifetimeValue: 9820,
  joinedAt: '2025-09-14'
},
{
  id: 'usr_2',
  name: 'Daniel Okafor',
  email: 'd.okafor@lumenlabs.io',
  phone: '+1 212 908 4410',
  city: 'Brooklyn, NY',
  status: 'approved',
  bookings: 7,
  lifetimeValue: 5240,
  joinedAt: '2025-10-02'
},
{
  id: 'usr_3',
  name: 'Priya Raghunathan',
  email: 'priya.r@fernbrook.com',
  phone: '+1 312 774 1190',
  city: 'Chicago, IL',
  status: 'pending',
  bookings: 0,
  lifetimeValue: 0,
  joinedAt: '2026-07-28'
},
{
  id: 'usr_4',
  name: 'Marcus Lindqvist',
  email: 'marcus@lindqvist.design',
  phone: '+1 206 331 7752',
  city: 'Seattle, WA',
  status: 'pending',
  bookings: 0,
  lifetimeValue: 0,
  joinedAt: '2026-08-01'
},
{
  id: 'usr_5',
  name: 'Sofia Marchetti',
  email: 'sofia.marchetti@atelier.co',
  phone: '+1 305 610 2287',
  city: 'Miami, FL',
  status: 'approved',
  bookings: 21,
  lifetimeValue: 17450,
  joinedAt: '2025-06-11'
},
{
  id: 'usr_6',
  name: 'Tobias Brandt',
  email: 'tobias.brandt@mail.com',
  phone: '+1 512 448 9013',
  city: 'Austin, TX',
  status: 'suspended',
  bookings: 3,
  lifetimeValue: 1180,
  joinedAt: '2026-02-19'
}];


export const chefs: Chef[] = [
{
  id: 'chf_1',
  name: 'Antoine Dubois',
  email: 'antoine.dubois@rentachef.com',
  phone: '+1 415 887 2213',
  state: { stateId: 'california', stateName: 'California' },
  city: 'San Francisco, CA',
  chefLevel: { id: 'signature', name: 'Signature' },
  specialties: ['French', 'Modern European'],
  servicesOffered: ['svc_tasting', 'svc_dinner'],
  yearsOfExperience: 18,
  rating: 4.9,
  jobsCompleted: 212,
  status: 'approved',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Two-Michelin-star trained, specialising in seasonal tasting menus and wine pairing.',
  joinedAt: '2024-04-18'
},
{
  id: 'chf_2',
  name: 'Naledi Mokoena',
  email: 'naledi.m@rentachef.com',
  phone: '+1 212 554 7781',
  state: { stateId: 'new-york', stateName: 'New York' },
  city: 'Brooklyn, NY',
  chefLevel: { id: 'executive', name: 'Executive' },
  specialties: ['Pan-African', 'Fusion'],
  servicesOffered: ['svc_dinner', 'svc_corporate'],
  yearsOfExperience: 12,
  rating: 4.8,
  jobsCompleted: 164,
  status: 'approved',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Bold, produce-led cooking blending West African technique with New York seasonality.',
  joinedAt: '2024-08-05'
},
{
  id: 'chf_3',
  name: 'Renzo Alcantara',
  email: 'renzo.a@rentachef.com',
  phone: '+1 305 220 4409',
  state: { stateId: 'florida', stateName: 'Florida' },
  city: 'Miami, FL',
  chefLevel: { id: 'premium', name: 'Premium' },
  specialties: ['Peruvian', 'Seafood'],
  servicesOffered: ['svc_dinner'],
  yearsOfExperience: 9,
  rating: 4.7,
  jobsCompleted: 98,
  status: 'approved',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Ceviche specialist with a decade in coastal fine dining kitchens.',
  joinedAt: '2025-01-30'
},
{
  id: 'chf_4',
  name: 'Hannah Weiss',
  email: 'hannah.weiss@rentachef.com',
  phone: '+1 206 771 3390',
  state: { stateId: 'washington', stateName: 'Washington' },
  city: 'Seattle, WA',
  chefLevel: { id: 'standard', name: 'Standard' },
  specialties: ['Plant-based', 'Pacific Northwest'],
  servicesOffered: ['svc_mealprep'],
  yearsOfExperience: 5,
  rating: 4.6,
  jobsCompleted: 41,
  status: 'pending',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Vegetable-forward menus built around Pacific Northwest farm partners.',
  joinedAt: '2026-07-21'
},
{
  id: 'chf_5',
  name: 'Kenji Watanabe',
  email: 'kenji.w@rentachef.com',
  phone: '+1 312 660 5518',
  state: { stateId: 'illinois', stateName: 'Illinois' },
  city: 'Chicago, IL',
  chefLevel: { id: 'executive', name: 'Executive' },
  specialties: ['Japanese', 'Kaiseki'],
  servicesOffered: ['svc_tasting', 'svc_masterclass'],
  yearsOfExperience: 15,
  rating: 4.9,
  jobsCompleted: 187,
  status: 'approved',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Kaiseki discipline applied to Midwest produce, with an omakase counter format.',
  joinedAt: '2024-11-12'
},
{
  id: 'chf_6',
  name: 'Lucia Ferreira',
  email: 'lucia.f@rentachef.com',
  phone: '+1 512 909 1123',
  state: { stateId: 'texas', stateName: 'Texas' },
  city: 'Austin, TX',
  chefLevel: { id: 'premium', name: 'Premium' },
  specialties: ['Brazilian', 'Fire Cooking'],
  servicesOffered: ['svc_wedding', 'svc_corporate'],
  yearsOfExperience: 11,
  rating: 4.8,
  jobsCompleted: 132,
  status: 'pending',
  avatar: "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg",

  bio: 'Live-fire churrasco and open-hearth cooking for large format events.',
  joinedAt: '2026-06-30'
}];


export const menus: Menu[] = [
{
  id: 'mnu_1',
  name: 'Autumn Harvest Tasting',
  cuisine: 'Modern European',
  serviceId: 'svc_tasting',
  serves: 8,
  pricePerHead: 145,
  status: 'active',
  createdAt: '2026-03-11',
  courses: [
  {
    id: 'crs_1',
    course: 'Amuse',
    name: 'Celeriac velouté',
    description: 'Truffle oil, toasted hazelnut'
  },
  {
    id: 'crs_2',
    course: 'Starter',
    name: 'Cured trout',
    description: 'Beet, dill crème fraîche, rye'
  },
  {
    id: 'crs_3',
    course: 'Main',
    name: 'Duck breast',
    description: 'Blackberry jus, charred endive'
  },
  {
    id: 'crs_4',
    course: 'Dessert',
    name: 'Pear tarte tatin',
    description: 'Brown butter ice cream'
  }],

  groceries: [
  { id: 'grc_1', name: 'Duck breast', quantity: 8, unit: 'pc', unitCost: 14.5 },
  { id: 'grc_2', name: 'Ocean trout fillet', quantity: 2, unit: 'kg', unitCost: 31 },
  { id: 'grc_3', name: 'Celeriac', quantity: 3, unit: 'kg', unitCost: 4.2 },
  { id: 'grc_4', name: 'Blackberries', quantity: 1.5, unit: 'kg', unitCost: 12 },
  { id: 'grc_5', name: 'Cultured butter', quantity: 1, unit: 'kg', unitCost: 18 }]

},
{
  id: 'mnu_2',
  name: 'Coastal Ceviche Table',
  cuisine: 'Peruvian',
  serviceId: 'svc_dinner',
  serves: 6,
  pricePerHead: 98,
  status: 'active',
  createdAt: '2026-04-02',
  courses: [
  {
    id: 'crs_5',
    course: 'Starter',
    name: 'Classic tiradito',
    description: 'Aji amarillo, lime, sweet potato'
  },
  {
    id: 'crs_6',
    course: 'Main',
    name: 'Grilled corvina',
    description: 'Choclo, huancaína emulsion'
  },
  {
    id: 'crs_7',
    course: 'Dessert',
    name: 'Lucuma cream',
    description: 'Cacao nib crumble'
  }],

  groceries: [
  { id: 'grc_6', name: 'Corvina fillet', quantity: 3, unit: 'kg', unitCost: 27 },
  { id: 'grc_7', name: 'Limes', quantity: 60, unit: 'pc', unitCost: 0.4 },
  { id: 'grc_8', name: 'Aji amarillo paste', quantity: 0.5, unit: 'kg', unitCost: 16 }]

},
{
  id: 'mnu_3',
  name: 'Fire & Smoke Feast',
  cuisine: 'Brazilian',
  serviceId: 'svc_wedding',
  serves: 60,
  pricePerHead: 82,
  status: 'active',
  createdAt: '2026-05-19',
  courses: [
  {
    id: 'crs_8',
    course: 'Grazing',
    name: 'Pão de queijo & dips',
    description: 'Smoked malagueta butter'
  },
  {
    id: 'crs_9',
    course: 'Main',
    name: 'Picanha on the coals',
    description: 'Chimichurri, farofa, vinagrete'
  },
  {
    id: 'crs_10',
    course: 'Dessert',
    name: 'Grilled pineapple',
    description: 'Cinnamon, dulce de leche'
  }],

  groceries: [
  { id: 'grc_9', name: 'Picanha', quantity: 22, unit: 'kg', unitCost: 21 },
  { id: 'grc_10', name: 'Charcoal', quantity: 40, unit: 'kg', unitCost: 1.8 },
  { id: 'grc_11', name: 'Pineapple', quantity: 18, unit: 'pc', unitCost: 3.2 }]

},
{
  id: 'mnu_4',
  name: 'Weeknight Reset',
  cuisine: 'Plant-based',
  serviceId: 'svc_mealprep',
  serves: 2,
  pricePerHead: 54,
  status: 'inactive',
  createdAt: '2026-06-08',
  courses: [
  {
    id: 'crs_11',
    course: 'Meal',
    name: 'Miso squash grain bowl',
    description: 'Farro, kale, tahini'
  },
  {
    id: 'crs_12',
    course: 'Meal',
    name: 'Smoky bean cassoulet',
    description: 'Herb breadcrumb'
  }],

  groceries: [
  { id: 'grc_12', name: 'Kabocha squash', quantity: 4, unit: 'kg', unitCost: 3.6 },
  { id: 'grc_13', name: 'Farro', quantity: 2, unit: 'kg', unitCost: 5.5 }]

}];


export const packages: Package[] = [
{
  id: 'pkg_1',
  name: 'Date Night Signature',
  description: 'Four-course dinner for two with sommelier notes and full cleanup.',
  serviceIds: ['svc_dinner'],
  menuIds: ['mnu_2'],
  price: 620,
  durationHours: 4,
  guests: 2,
  perks: ['Wine pairing notes', 'Table styling', 'Full kitchen cleanup'],
  status: 'active',
  createdAt: '2026-02-14'
},
{
  id: 'pkg_2',
  name: 'Celebration Table',
  description: 'Signature tasting menu for up to ten guests with a service assistant.',
  serviceIds: ['svc_tasting', 'svc_dinner'],
  menuIds: ['mnu_1'],
  price: 1780,
  durationHours: 6,
  guests: 10,
  perks: ['Service assistant', 'Menu printing', 'Welcome canapés'],
  status: 'active',
  createdAt: '2026-03-30'
},
{
  id: 'pkg_3',
  name: 'Wedding Brigade',
  description: 'Full event catering with a five-person brigade and rentals coordination.',
  serviceIds: ['svc_wedding'],
  menuIds: ['mnu_3'],
  price: 9400,
  durationHours: 12,
  guests: 80,
  perks: ['5-person brigade', 'Tasting session', 'Rentals coordination'],
  status: 'active',
  createdAt: '2026-05-22'
},
{
  id: 'pkg_4',
  name: 'Reset Weekly',
  description: 'Ten prepped meals per week with a monthly nutrition check-in.',
  serviceIds: ['svc_mealprep'],
  menuIds: ['mnu_4'],
  price: 340,
  durationHours: 4,
  guests: 2,
  perks: ['Labelled containers', 'Nutrition check-in'],
  status: 'inactive',
  createdAt: '2026-06-10'
}];


export const charges: Charge[] = [
{
  id: 'chg_1',
  name: 'Platform Service Fee',
  code: 'PLATFORM_FEE',
  type: 'percentage',
  value: 12,
  appliesTo: 'booking',
  status: 'active'
},
{
  id: 'chg_2',
  name: 'Grocery Sourcing Fee',
  code: 'GROCERY_FEE',
  type: 'percentage',
  value: 8,
  appliesTo: 'grocery',
  status: 'active'
},
{
  id: 'chg_3',
  name: 'Late Booking Surcharge',
  code: 'LATE_BOOKING',
  type: 'fixed',
  value: 75,
  appliesTo: 'booking',
  status: 'active'
},
{
  id: 'chg_4',
  name: 'Chef Payout Commission',
  code: 'CHEF_COMMISSION',
  type: 'percentage',
  value: 18,
  appliesTo: 'chef_payout',
  status: 'active'
},
{
  id: 'chg_5',
  name: 'Package Discount Offset',
  code: 'PKG_OFFSET',
  type: 'fixed',
  value: 40,
  appliesTo: 'package',
  status: 'inactive'
}];


export const chefCategoryPrices: ChefCategoryPrice[] = [
{
  id: 'ccp_1',
  tier: 'Standard',
  serviceId: 'svc_dinner',
  hourlyRate: 45,
  minimumHours: 3,
  weekendSurchargePct: 10,
  travelFee: 20,
  status: 'active'
},
{
  id: 'ccp_2',
  tier: 'Premium',
  serviceId: 'svc_dinner',
  hourlyRate: 70,
  minimumHours: 3,
  weekendSurchargePct: 12,
  travelFee: 25,
  status: 'active'
},
{
  id: 'ccp_3',
  tier: 'Executive',
  serviceId: 'svc_tasting',
  hourlyRate: 110,
  minimumHours: 4,
  weekendSurchargePct: 15,
  travelFee: 40,
  status: 'active'
},
{
  id: 'ccp_4',
  tier: 'Signature',
  serviceId: 'svc_tasting',
  hourlyRate: 165,
  minimumHours: 5,
  weekendSurchargePct: 20,
  travelFee: 60,
  status: 'active'
},
{
  id: 'ccp_5',
  tier: 'Executive',
  serviceId: 'svc_wedding',
  hourlyRate: 130,
  minimumHours: 8,
  weekendSurchargePct: 18,
  travelFee: 80,
  status: 'active'
},
{
  id: 'ccp_6',
  tier: 'Standard',
  serviceId: 'svc_mealprep',
  hourlyRate: 38,
  minimumHours: 3,
  weekendSurchargePct: 0,
  travelFee: 15,
  status: 'inactive'
}];


export const bookings: Booking[] = [
{
  id: 'bkg_1',
  reference: 'RAC-4821',
  userId: 'usr_1',
  chefId: 'chf_1',
  serviceId: 'svc_tasting',
  menuId: 'mnu_1',
  packageId: 'pkg_2',
  date: '2026-08-14',
  time: '18:30',
  guests: 8,
  address: '2140 Vallejo St, San Francisco, CA',
  status: 'confirmed',
  serviceAmount: 1780,
  notes: 'One guest is pescatarian. Client will supply wine.',
  createdAt: '2026-07-20',
  groceries: [
  { id: 'bg_1', name: 'Duck breast', quantity: 8, unit: 'pc', unitCost: 14.5 },
  { id: 'bg_2', name: 'Ocean trout fillet', quantity: 2, unit: 'kg', unitCost: 31 },
  { id: 'bg_3', name: 'Seasonal produce box', quantity: 1, unit: 'box', unitCost: 68 }]

},
{
  id: 'bkg_2',
  reference: 'RAC-4822',
  userId: 'usr_2',
  chefId: 'chf_2',
  serviceId: 'svc_dinner',
  menuId: 'mnu_2',
  packageId: null,
  date: '2026-08-09',
  time: '19:00',
  guests: 6,
  address: '88 Clinton Ave, Brooklyn, NY',
  status: 'pending',
  serviceAmount: 320,
  notes: 'Awaiting chef confirmation.',
  createdAt: '2026-08-01',
  groceries: [
  { id: 'bg_4', name: 'Corvina fillet', quantity: 3, unit: 'kg', unitCost: 27 },
  { id: 'bg_5', name: 'Limes', quantity: 60, unit: 'pc', unitCost: 0.4 }]

},
{
  id: 'bkg_3',
  reference: 'RAC-4805',
  userId: 'usr_5',
  chefId: 'chf_3',
  serviceId: 'svc_dinner',
  menuId: 'mnu_2',
  packageId: 'pkg_1',
  date: '2026-07-26',
  time: '20:00',
  guests: 2,
  address: '1201 Brickell Bay Dr, Miami, FL',
  status: 'completed',
  serviceAmount: 620,
  notes: 'Anniversary dinner. Repeat client.',
  createdAt: '2026-07-04',
  groceries: [
  { id: 'bg_6', name: 'Corvina fillet', quantity: 1.2, unit: 'kg', unitCost: 27 },
  { id: 'bg_7', name: 'Passionfruit', quantity: 10, unit: 'pc', unitCost: 1.6 }]

},
{
  id: 'bkg_4',
  reference: 'RAC-4830',
  userId: 'usr_5',
  chefId: 'chf_6',
  serviceId: 'svc_wedding',
  menuId: 'mnu_3',
  packageId: 'pkg_3',
  date: '2026-09-19',
  time: '15:00',
  guests: 80,
  address: 'Villa Sereno, Coral Gables, FL',
  status: 'confirmed',
  serviceAmount: 9400,
  notes: 'Tasting session scheduled for 22 Aug.',
  createdAt: '2026-07-30',
  groceries: [
  { id: 'bg_8', name: 'Picanha', quantity: 22, unit: 'kg', unitCost: 21 },
  { id: 'bg_9', name: 'Charcoal', quantity: 40, unit: 'kg', unitCost: 1.8 },
  { id: 'bg_10', name: 'Produce & sides', quantity: 1, unit: 'lot', unitCost: 410 }]

},
{
  id: 'bkg_5',
  reference: 'RAC-4812',
  userId: 'usr_6',
  chefId: 'chf_5',
  serviceId: 'svc_corporate',
  menuId: null,
  packageId: null,
  date: '2026-08-05',
  time: '11:30',
  guests: 35,
  address: '600 W Chicago Ave, Chicago, IL',
  status: 'in_progress',
  serviceAmount: 900,
  notes: 'Recurring monthly lunch service.',
  createdAt: '2026-07-15',
  groceries: [
  { id: 'bg_11', name: 'Seasonal produce box', quantity: 3, unit: 'box', unitCost: 68 },
  { id: 'bg_12', name: 'Sushi-grade salmon', quantity: 6, unit: 'kg', unitCost: 34 }]

},
{
  id: 'bkg_6',
  reference: 'RAC-4799',
  userId: 'usr_2',
  chefId: 'chf_5',
  serviceId: 'svc_mealprep',
  menuId: 'mnu_4',
  packageId: 'pkg_4',
  date: '2026-07-12',
  time: '09:00',
  guests: 2,
  address: '88 Clinton Ave, Brooklyn, NY',
  status: 'cancelled',
  serviceAmount: 340,
  notes: 'Client travelling — cancelled within policy window.',
  createdAt: '2026-06-28',
  groceries: []
},
{
  id: 'bkg_7',
  reference: 'RAC-4835',
  userId: 'usr_1',
  chefId: 'chf_2',
  serviceId: 'svc_dinner',
  menuId: 'mnu_1',
  packageId: null,
  date: '2026-08-23',
  time: '18:00',
  guests: 10,
  address: '2140 Vallejo St, San Francisco, CA',
  status: 'pending',
  serviceAmount: 320,
  notes: 'Chef travel fee to be confirmed.',
  createdAt: '2026-08-02',
  groceries: []
}];


export const revenueTrend = [
{ month: 'Feb', revenue: 42800, bookings: 38 },
{ month: 'Mar', revenue: 51200, bookings: 45 },
{ month: 'Apr', revenue: 48600, bookings: 41 },
{ month: 'May', revenue: 63400, bookings: 56 },
{ month: 'Jun', revenue: 71900, bookings: 62 },
{ month: 'Jul', revenue: 84300, bookings: 74 }];
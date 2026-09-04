import type { Merchant } from '../types';

export const merchants: Merchant[] = [
{
  id: 'MRC_2201',
  name: 'UrbanCart',
  category: 'Marketplace / Retail',
  mcc: '5399',
  gstin: '29AABCU9603R1ZM',
  onboarded: '2023-04-11'
},
{
  id: 'MRC_2208',
  name: 'MediBridge',
  category: 'Healthcare / Pharmacy',
  mcc: '5912',
  gstin: '27AAGCM4419P1Z8',
  onboarded: '2023-07-02'
},
{
  id: 'MRC_2214',
  name: 'TravelNest',
  category: 'Travel / OTA',
  mcc: '4722',
  gstin: '07AACCT3391L1ZQ',
  onboarded: '2022-11-19'
},
{
  id: 'MRC_2219',
  name: 'EduSphere',
  category: 'Education / Subscriptions',
  mcc: '8299',
  gstin: '36AAECE7712K1ZV',
  onboarded: '2024-01-08'
},
{
  id: 'MRC_2226',
  name: 'QuickServe',
  category: 'Food delivery',
  mcc: '5814',
  gstin: '19AAGCQ5580J1ZB',
  onboarded: '2023-02-27'
},
{
  id: 'MRC_2231',
  name: 'HomeKart',
  category: 'Home & furnishing',
  mcc: '5712',
  gstin: '33AABCH8827N1ZK',
  onboarded: '2022-09-05'
},
{
  id: 'MRC_2237',
  name: 'FitFuel',
  category: 'D2C / Nutrition',
  mcc: '5499',
  gstin: '06AAFCF1146T1ZD',
  onboarded: '2024-03-21'
},
{
  id: 'MRC_2242',
  name: 'LoomLane',
  category: 'Apparel',
  mcc: '5651',
  gstin: '24AADCL6603Q1ZR',
  onboarded: '2023-10-16'
}];


export const merchantNames = merchants.map((m) => m.name);
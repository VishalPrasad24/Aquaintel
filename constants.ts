
import { LocationData, Disease, Translations, StudyModule, HealthAuthorityContact, UserProfile, HospitalProfile } from './types';

export const HIERARCHICAL_LOCATIONS = {
  'Assam': {
    'Kamrup': ['Kamrup'],
    'Dibrugarh': ['Dibrugarh'],
  },
  'Tripura': {
    'West Tripura': ['West Tripura'],
  },
  'Meghalaya': {
    'East Khasi Hills': ['East Khasi Hills'],
  },
  'Manipur': {
    'Imphal West': ['Imphal West'],
  },
  'Sikkim': {
    'Gangtok': ['Gangtok', 'Ranipool', 'Singtam', 'Ranka', 'Tadong'],
    'Pakyong': ['Pakyong', 'Rhenock', 'Rangpo'],
    'Soreng': ['Soreng', 'Chakung'],
    'Namchi': ['Namchi', 'Jorethang', 'Melli', 'Ravangla'],
    'Gyalshing': ['Gyalshing', 'Yuksom', 'Pelling', 'Dentam'],
    'Mangan': ['Mangan', 'Chungthang', 'Lachen', 'Lachung'],
  }
};

const DISTRICT_COORDS: { [key: string]: { lat: number, lng: number } } = {
  'Kamrup': { lat: 26.1, lng: 91.5 },
  'Dibrugarh': { lat: 27.4, lng: 95.0 },
  'West Tripura': { lat: 23.8, lng: 91.2 },
  'East Khasi Hills': { lat: 25.5, lng: 91.8 },
  'Imphal West': { lat: 24.8, lng: 93.9 },
  'Gangtok': { lat: 27.33, lng: 88.61 },
  'Pakyong': { lat: 27.22, lng: 88.59 },
  'Soreng': { lat: 27.17, lng: 88.19 },
  'Namchi': { lat: 27.16, lng: 88.35 },
  'Gyalshing': { lat: 27.28, lng: 88.26 },
  'Mangan': { lat: 27.51, lng: 88.53 },
  // Adding other states' districts
  'Arunachal Pradesh': { lat: 28.3, lng: 94.7 },
  'Assam': { lat: 26.2, lng: 92.9 },
  'Manipur': { lat: 24.8, lng: 93.9 },
  'Meghalaya': { lat: 25.4, lng: 91.8 },
  'Mizoram': { lat: 23.7, lng: 92.7 },
  'Nagaland': { lat: 26.1, lng: 94.5 },
  'Tripura': { lat: 23.8, lng: 91.2 },
  'Sikkim': { lat: 27.5, lng: 88.5 },
};

const CITY_COORDS: { [key: string]: { lat: number, lng: number } } = {
    Ravangla: { lat: 27.30, lng: 88.36 },
};

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const generateRandomData = (lat: number, lng: number) => ({
  coords: { lat: lat + (Math.random() - 0.5) * 0.05, lng: lng + (Math.random() - 0.5) * 0.05 },
  cases: Object.values(Disease).reduce((acc, disease) => {
    acc[disease] = 0; // Initialize with 0, data will come from hospital reports
    return acc;
  }, {} as { [key in Disease]: number }),
  waterQuality: { ph: parseFloat((6.0 + Math.random() * 2.5).toFixed(1)), turbidity: randomBetween(5, 50) },
});

const flattenLocations = (): LocationData[] => {
    const locations: LocationData[] = [];
    for (const state in HIERARCHICAL_LOCATIONS) {
        for (const district in HIERARCHICAL_LOCATIONS[state as keyof typeof HIERARCHICAL_LOCATIONS]) {
            for (const city of HIERARCHICAL_LOCATIONS[state as keyof typeof HIERARCHICAL_LOCATIONS][district]) {
                const id = `${state}-${district}-${city}`.toLowerCase().replace(/\s+/g, '_');
                const cityCoords = CITY_COORDS[city];
                const baseCoords = cityCoords || DISTRICT_COORDS[district] || DISTRICT_COORDS[state] || { lat: 27.5, lng: 88.5 };
                const data = generateRandomData(baseCoords.lat, baseCoords.lng);
                
                locations.push({ id, state, district, city, ...data });
            }
        }
    }
    return locations;
};

export const LOCATIONS: LocationData[] = flattenLocations();

export const STUDY_MODULES: StudyModule[] = [
  { id: Disease.Cholera, title: 'Understanding Cholera', summary: 'An acute diarrhoeal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae.', symptoms: ['Severe watery diarrhea', 'Vomiting', 'Muscle cramps', 'Dehydration'], prevention: ['Drink and use safe water', 'Wash hands often with soap', 'Cook food well', 'Clean up safely'], imageUrl: 'https://picsum.photos/seed/cholera/400/200' },
  { id: Disease.Typhoid, title: 'About Typhoid Fever', summary: 'A bacterial infection that can lead to a high fever, diarrhea, and vomiting. It can be fatal. It is caused by the bacteria Salmonella typhi.', symptoms: ['High fever', 'Headache', 'Stomach pain', 'Constipation or diarrhea'], prevention: ['Get vaccinated', 'Avoid risky food and drinks', 'Wash hands frequently'], imageUrl: 'https://picsum.photos/seed/typhoid/400/200' },
  { id: Disease.HepatitisA, title: 'Hepatitis A Guide', summary: 'A highly contagious liver infection caused by the hepatitis A virus. It can range from a mild illness to a severe illness.', symptoms: ['Fatigue', 'Nausea and vomiting', 'Abdominal pain', 'Jaundice'], prevention: ['Get the hepatitis A vaccine', 'Practice good hand hygiene', 'Avoid contaminated food and water'], imageUrl: 'https://picsum.photos/seed/hepatitis/400/200' },
  { id: Disease.Shigellosis, title: 'Stopping Shigellosis', summary: 'A bacterial infection caused by Shigella bacteria, affecting the intestinal lining and causing dysentery.', symptoms: ['Diarrhea (often bloody)', 'Fever', 'Stomach pain', 'Tenesmus (feeling the need to pass stool)'], prevention: ['Frequent handwashing with soap', 'Avoid preparing food for others if sick', 'Dispose of soiled diapers properly'], imageUrl: 'https://picsum.photos/seed/shigellosis/400/200' },
  { id: Disease.Dysentery, title: 'Understanding Dysentery', summary: 'An intestinal inflammation, especially in the colon, that can lead to severe diarrhea with mucus or blood in the feces.', symptoms: ['Bloody diarrhea', 'Fever', 'Vomiting', 'Stomach cramps'], prevention: ['Practice good hand hygiene', 'Drink boiled or purified water', 'Avoid raw fruits and vegetables unless peeled', 'Cook food thoroughly'], imageUrl: 'https://picsum.photos/seed/dysentery/400/200' },
  { id: Disease.Giardiasis, title: 'Dealing with Giardiasis', summary: 'An intestinal infection caused by a microscopic parasite called Giardia lamblia, often contracted by drinking contaminated water.', symptoms: ['Watery diarrhea', 'Fatigue', 'Stomach cramps and bloating', 'Gas and nausea'], prevention: ['Avoid swallowing water from lakes or rivers', 'Drink purified or boiled water', 'Wash hands thoroughly'], imageUrl: 'https://picsum.photos/seed/giardiasis/400/200' },
  { id: Disease.Amoebiasis, title: 'Guide to Amoebiasis', summary: 'An infection of the intestines caused by the parasite Entamoeba histolytica, spread through contaminated food or water.', symptoms: ['Loose stools', 'Stomach cramping', 'Stomach pain', 'Bloody stools'], prevention: ['Purify drinking water', 'Practice safe food handling', 'Wash hands after using the toilet', 'Avoid food from street vendors'], imageUrl: 'https://picsum.photos/seed/amoebiasis/400/200' },
  { id: Disease.Cryptosporidiosis, title: 'Preventing Cryptosporidiosis', summary: 'A diarrheal disease caused by microscopic Cryptosporidium parasites, which can live in the intestine of humans and animals.', symptoms: ['Watery diarrhea', 'Stomach cramps or pain', 'Dehydration', 'Nausea and vomiting'], prevention: ['Do not swallow water from pools or lakes', 'Use a water filter', 'Practice good hand hygiene, especially after contact with animals'], imageUrl: 'https://picsum.photos/seed/crypto/400/200' },
];

export const HEALTH_AUTHORITY_CONTACTS: HealthAuthorityContact[] = [
  { state: 'Sikkim', helplines: [{ name: 'State Health Helpline', phone: '104' }, { name: 'Emergency Ambulance Service', phone: '108' }], hospitals: [{ name: 'STNM Hospital', district: 'Gangtok', phone: '03592-202955', address: 'Sochaygang, Gangtok' }, { name: 'Namchi District Hospital', district: 'Namchi', phone: '03595-263744', address: 'Namchi' }] },
  { state: 'Assam', helplines: [{ name: 'State Health Helpline', phone: '104' }, { name: 'Emergency Ambulance Service', phone: '108' }], hospitals: [{ name: 'Gauhati Medical College & Hospital', district: 'Kamrup', phone: '0361-2453549', address: 'Bhangagarh, Guwahati' }, { name: 'Assam Medical College & Hospital', district: 'Dibrugarh', phone: '0373-2300080', address: 'Barbari, Dibrugarh' }] },
  { state: 'Tripura', helplines: [{ name: 'State Health Helpline', phone: '104' }, { name: 'Emergency Ambulance Service', phone: '102' }], hospitals: [{ name: 'Agartala Govt. Medical College', district: 'West Tripura', phone: '0381-2357130', address: 'Kunjaban, Agartala' }] },
  { state: 'Manipur', helplines: [{ name: 'State Health Helpline', phone: '104' }, { name: 'Emergency Ambulance Service', phone: '102' }], hospitals: [{ name: 'J N Institute of Medical Sciences', district: 'Imphal West', phone: '0385-2443021', address: 'Porompat, Imphal' }] },
  { state: 'Meghalaya', helplines: [{ name: 'Emergency Ambulance Service', phone: '108' }, { name: 'State Health Helpline', phone: '104' }], hospitals: [{ name: 'NEIGRIHMS, Shillong', district: 'East Khasi Hills', phone: '0364-2538019', address: 'Mawdiangdiang, Shillong' }] },
];

export const DISEASE_COLORS: { [key in Disease]: string } = {
    [Disease.Cholera]: '#0ea5e9', [Disease.Typhoid]: '#ef4444', [Disease.HepatitisA]: '#f59e0b', [Disease.Dysentery]: '#8b5cf6', [Disease.Giardiasis]: '#22c55e', [Disease.Shigellosis]: '#ec4899', [Disease.Amoebiasis]: '#14b8a6', [Disease.Cryptosporidiosis]: '#64748b',
};

export const TRANSLATIONS: Translations = {
  // Role Selection
  are_you_a: { en: 'Are you a...', hi: 'आप एक...', as: 'আপুনি এজন...', ne: 'तपाईं एक...' },
  public_user: { en: 'Public User', hi: 'सार्वजनिक उपयोगकर्ता', as: 'सार्वजनिक ব্যৱহাৰকাৰী', ne: 'सार्वजनिक प्रयोगकर्ता' },
  hospital_staff: { en: 'Hospital Staff', hi: 'अस्पताल कर्मचारी', as: ' চিকিৎসালয়ৰ কৰ্মচাৰী', ne: 'अस्पताल कर्मचारी' },
  // Hospital Login
  hospital_login: { en: 'Hospital Login', hi: 'अस्पताल लॉगिन', as: ' চিকিৎসালয় লগইন', ne: 'अस्पताल लगइन' },
  hospital_id: { en: '8-Digit Hospital ID', hi: '8-अंकीय अस्पताल आईडी', as: '৮- সংখ্যাৰ চিকিৎসালয় আইডি', ne: '८-अंकीय अस्पताल आईडी' },
  login: { en: 'Login', hi: 'लॉग इन करें', as: 'লগ ইন কৰক', ne: 'लगइन गर्नुहोस्' },
  // Sidebar & Header
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', as: 'ডেশ্বৰ্ড', ne: 'ड्यासबोर्ड' },
  map_view: { en: 'Map View', hi: 'मानचित्र देखें', as: 'মানচিত্ৰ দৰ্শন', ne: 'नक्सा दृश्य' },
  study_modules: { en: 'Study Modules', hi: 'अध्ययन मॉड्यूल', as: 'অধ্যয়ন মডিউল', ne: 'अध्ययन मोड्युलहरू' },
  ai_assistant: { en: 'AI Assistant', hi: 'एआई सहायक', as: 'এআই সহকাৰী', ne: 'एआई सहायक' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', as: 'প্ৰফাইল', ne: 'प्रोफाइल' },
  logout: { en: 'Logout', hi: 'लॉग आउट', as: 'লগ আউট', ne: 'लगआउट' },
  welcome_user: { en: 'Welcome', hi: 'स्वागत है', as: 'স্বাগতম', ne: 'स्वागत छ' },
  welcome_hospital: { en: 'Welcome', hi: 'स्वागत है', as: 'স্বাগতম', ne: 'स्वागत छ' },
  select_location: { en: 'Select your location', hi: 'अपना स्थान चुनें', as: 'আপোনাৰ অৱস্থান বাছনি কৰক', ne: 'आफ्नो स्थान छान्नुहोस्' },
  // Dashboard
  health_overview: { en: 'Health Overview for', hi: 'के लिए स्वास्थ्य अवलोकन', as: 'ৰ বাবে স্বাস্থ্যৰ অৱলোকন', ne: 'को लागि स्वास्थ्य अवलोकन' },
  total_cases: { en: 'Total Reported Cases', hi: 'कुल रिपोर्ट किए गए मामले', as: 'মুঠ ৰিপৰ্ট কৰা ঘটনা', ne: 'कुल रिपोर्ट गरिएका केसहरू' },
  submit_patient_data: { en: 'Submit Patient Data', hi: 'रोगी डेटा जमा करें', as: 'ৰোগীৰ তথ্য দাখিল কৰক', ne: 'बिरामीको डाटा पेश गर्नुहोस्' },
  number_of_cases: { en: 'Number of Cases', hi: 'मामलों की संख्या', as: 'ঘটনাৰ সংখ্যা', ne: 'केसहरूको संख्या' },
  date_of_report: { en: 'Date of Report', hi: 'रिपोर्ट की तारीख', as: 'প্ৰতিবেদনৰ তাৰিখ', ne: 'रिपोर्टको मिति' },
  water_ph_level: { en: 'Water pH Level', hi: 'पानी का पीएच स्तर', as: 'পানীৰ পিএইচ স্তৰ', ne: 'पानीको pH स्तर' },
  disease_breakdown: { en: 'Disease Breakdown', hi: 'रोग का विवरण', as: 'ৰোগৰ বিৱৰণ', ne: 'रोगको ब्रेकडाउन' },
  select_disease: { en: 'Select Disease', hi: 'रोग चुनें', as: 'ৰোগ বাছনি কৰক', ne: 'रोग छान्नुहोस्' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', as: 'বাতিল কৰক', ne: 'रद्द गर्नुहोस्' },
  submit: { en: 'Submit', hi: 'प्रस्तुत करें', as: 'দাখিল কৰক', ne: 'पेश गर्नुहोस्' },
  case_reported_successfully: { en: 'Data submitted successfully!', hi: 'डेटा सफलतापूर्वक सबमिट किया गया!', as: 'তথ্য সফলতাৰে দাখিল কৰা হৈছে!', ne: 'डाटा सफलतापूर्वक पेश गरियो!' },
  case_queued_offline: { en: 'Report saved. Will sync when online.', hi: 'रिपोर्ट सहेजी गई। ऑनलाइन होने पर सिंक होगी।', as: 'প্ৰতিবেদন সংৰক্ষণ কৰা হৈছে। অনলাইন হ’লে ছিংক হ’ব।', ne: 'रिपोर्ट सुरक्षित भयो। अनलाइन हुँदा सिङ्क हुनेछ।' },
  map_search_placeholder: { en: 'Search for a location...', hi: 'स्थान खोजें...', as: 'এটা অৱস্থানৰ বাবে সন্ধান কৰক...', ne: 'स्थान खोज्नुहोस्...' },
  search: { en: 'Search', hi: 'खोजें', as: 'সন্ধান কৰক', ne: 'खोज्नुहोस्' },
  reset_view: { en: 'Reset View', hi: 'व्यू रीसेट करें', as: 'দৰ্শন পুনৰ সংহতি কৰক', ne: 'दृश्य रिसेट गर्नुहोस्' },
  disease_hotspots: { en: 'Disease Hotspots', hi: 'रोग हॉटस्पॉट', as: 'ৰোগৰ হটস্পট', ne: 'रोग हटस्पट' },
  filter_by_disease: { en: 'Filter by disease', hi: 'रोग के अनुसार फ़िल्टर करें', as: 'ৰোগ অনুসৰি ফিল্টাৰ কৰক', ne: 'रोग अनुसार फिल्टर गर्नुहोस्' },
  all_diseases: { en: 'All Diseases', hi: 'सभी रोग', as: 'সকলো ৰোগ', ne: 'सबै रोगहरू' },
  symptoms: { en: 'Symptoms', hi: 'लक्षण', as: 'ৰোগৰ লক্ষণ', ne: 'लक्षणहरू' },
  prevention: { en: 'Prevention', hi: 'निवारण', as: 'প্ৰতিৰোধ', ne: 'रोकथाम' },
  water_borne_diseases: { en: 'Water-Borne Diseases', hi: 'जल जनित रोग', as: 'জলজনিত ৰোগ', ne: 'पानीजन्य रोगहरू' },
  remind_me: { en: 'Remind Me Later', hi: 'मुझे बाद में याद दिलाना', as: ' মোক পিছত মনত পেলাই দিব', ne: 'मलाई पछि सम्झाउनुहोस्' },
  reminder_set: { en: 'Reminder Set!', hi: 'रिमाइंडर सेट!', as: 'ৰিमाइণ্ডাৰ ছেট!', ne: 'रिमाइन्डर सेट!' },
  chat_placeholder: { en: 'Ask about symptoms, prevention...', hi: 'लक्षणों, रोकथाम के बारे में पूछें...', as: 'ৰোগৰ লক্ষণ, প্ৰতিৰোধৰ বিষয়ে সোধক...', ne: 'लक्षण, रोकथाम बारे सोध्नुहोस्...' },
  chat_welcome_user: { en: 'Hello! I am Arogya Sahayak, your AI health assistant. How can I help you today? You can ask me about symptoms, prevention tips, or general health information.', hi: 'नमस्ते! मैं आरोग्य सहायक हूँ, आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे लक्षणों, रोकथाम के सुझावों, या सामान्य स्वास्थ्य जानकारी के बारे में पूछ सकते हैं।', as: 'নমস্কাৰ! মই আৰোগ্য সহায়ক, আপোনাৰ এআই স্বাস্থ্য সহকাৰী। আজি মই আপোনাক কেনেদৰে সহায় কৰিব পাৰোঁ? আপুনি মোক লক্ষণ, প্ৰতিৰোধৰ পৰামৰ্শ, বা সাধাৰণ স্বাস্থ্য তথ্যৰ বিষয়ে সুধিব পাৰে।', ne: 'नमस्ते! म आरोग्य सहायक हुँ, तपाईंको एआई स्वास्थ्य सहायक। आज म तपाईंलाई कसरी मद्दत गर्न सक्छु? तपाईं मलाई लक्षण, रोकथामका सुझावहरू, वा सामान्य स्वास्थ्य जानकारीको बारेमा सोध्न सक्नुहुन्छ।' },
  chat_welcome_hospital: { en: 'Welcome, healthcare professional. I am Arogya Sahayak. How can I assist you? You can ask me about submitting data, interpreting dashboard analytics, or using the app\'s features.', hi: 'नमस्ते, स्वास्थ्य पेशेवर। मैं आरोग्य सहायक हूँ। मैं आपकी कैसे सहायता कर सकता हूँ? आप मुझसे डेटा सबमिट करने, डैशबोर्ड एनालिटिक्स की व्याख्या करने, या ऐप की सुविधाओं का उपयोग करने के बारे में पूछ सकते हैं।', as: 'স্বাগতম, স্বাস্থ্যসেৱা পেছাদাৰী। মই আৰোগ্য সহায়ক। মই আপোনাক কেনেদৰে সহায় কৰিব পাৰোঁ? আপুনি মোক তথ্য দাখিল কৰা, ডেচবৰ্ড বিশ্লেষণৰ ব্যাখ্যা কৰা, বা এপৰ সুবিধা ব্যৱহাৰ কৰাৰ বিষয়ে সুধিব পাৰে।', ne: 'स्वागत छ, स्वास्थ्यसेवा पेशेवर। म आरोग्य सहायक हुँ। म तपाईंलाई कसरी सहयोग गर्न सक्छु? तपाईं मलाई डाटा पेश गर्ने, ड्यासबोर्ड विश्लेषण व्याख्या गर्ने, वा एपका सुविधाहरू प्रयोग गर्ने बारेमा सोध्न सक्नुहुन्छ।' },
  offline_banner: { en: "You are currently offline. Some features may be limited.", hi: "आप वर्तमान में ऑफ़लाइन हैं। कुछ सुविधाएँ सीमित हो सकती हैं।", as: "আপুনি বৰ্তমান অফলাইন আছে। কিছুমান সুবিধা সীমিত হ'ব পাৰে।", ne: "तपाईं हाल अफलाइन हुनुहुन्छ। केही सुविधाहरू सीमित हुन सक्छन्।" },
  high_alert: { en: 'High Alert!', hi: 'उच्च चेतावनी!', as: 'উচ্চ সতৰ্কবাণী!', ne: 'उच्च सतर्कता!' },
  outbreak_alert_message: { en: 'A high number of {disease} cases have been reported in this area.', hi: 'इस क्षेत्र में {disease} के अधिक मामले सामने आए हैं।', as: 'এই অঞ্চলত {disease} ৰ বহু ঘটনা ৰিপৰ্ট কৰা হৈছে।', ne: 'यस क्षेत्रमा {disease} का उच्च संख्यामा केसहरू रिपोर्ट गरिएका छन्।' },
  learn_more: { en: 'Learn More', hi: 'और जानें', as: 'অধিক জানক', ne: 'थप जान्नुहोस्' },
  ask_ai_assistant: { en: 'Ask AI Assistant', hi: 'एआई सहायक से पूछें', as: 'এআই সহকাৰীক সোধক', ne: 'एआई सहायकलाई सोध्नुहोस्' },
  user_profile: { en: 'User Profile', hi: 'उपयोगकर्ता प्रोफ़ाइल', as: 'ব্যৱহাৰকাৰীৰ প্ৰফাইল', ne: 'प्रयोगकर्ता प्रोफाइल' },
  hospital_profile: { en: 'Hospital Profile', hi: 'अस्पताल प्रोफ़ाइल', as: ' চিকিৎসালয়ৰ প্ৰফাইল', ne: 'अस्पताल प्रोफाइल' },
  personal_information: { en: 'Personal Information', hi: 'व्यक्तिगत जानकारी', as: 'ব্যক্তিগত তথ্য', ne: 'व्यक्तिगत जानकारी' },
  preferences: { en: 'Preferences', hi: 'वरीयताएँ', as: 'পছন্দসমূহ', ne: 'प्राथमिकताहरू' },
  support_and_help: { en: 'Support & Help', hi: 'सहायता और मदद', as: 'সহায় আৰু সহায়', ne: 'समर्थन र मद्दत' },
  name: { en: 'Name', hi: 'नाम', as: 'নাম', ne: 'नाम' },
  hospital_name: { en: 'Hospital Name', hi: 'अस्पताल का नाम', as: ' চিকিৎসালয়ৰ নাম', ne: 'अस्पतालको नाम' },
  change_picture: { en: 'Change Picture', hi: 'तस्वीर बदलें', as: 'ছবি সলনি কৰক', ne: 'तस्विर परिवर्तन गर्नुहोस्' },
  location: { en: 'Location', hi: 'स्थान', as: 'অৱস্থান', ne: 'स्थान' },
  save: { en: 'Save Changes', hi: 'बदलाव सहेजें', as: 'সলনিসমূহ সংৰক্ষণ কৰক', ne: 'परिवर्तनहरू बचत गर्नुहोस्' },
  dark_mode: { en: 'Dark Mode', hi: 'डार्क मोड', as: 'ডাৰ্ক মোড', ne: 'डार्क मोड' },
  notifications: { en: 'Notifications', hi: 'सूचनाएं', as: 'অধিসূচনা', ne: 'सूचनाहरू' },
  notifications_enabled: { en: 'Push notifications are enabled.', hi: 'पुश सूचनाएं सक्षम हैं।', as: 'পুশ্ব অধিসূচনা সক্ষম কৰা হৈছে।', ne: 'पुश सूचनाहरू सक्षम छन्।' },
  enable_notifications: { en: 'Enable Push Notifications', hi: 'पुश सूचनाएं सक्षम करें', as: 'পুশ্ব অধিসূচনা সক্ষম কৰক', ne: 'पुश सूचनाहरू सक्षम गर्नुहोस्' },
  customer_support: { en: 'Customer Support', hi: 'ग्राहक सहायता', as: 'গ্ৰাহক সহায়', ne: 'ग्राहक समर्थन' },
  support_message: { en: 'For any issues or questions about the app, please contact us.', hi: 'ऐप के बारे में किसी भी समस्या या प्रश्न के लिए, कृपया हमसे संपर्क करें।', as: 'এপৰ বিষয়ে কোনো সমস্যা বা প্ৰশ্নৰ বাবে, অনুগ্ৰহ কৰি আমাৰ সৈতে যোগাযোগ কৰক।', ne: 'एपको बारेमा कुनै पनि समस्या वा प्रश्नहरूको लागि, कृपया हामीलाई सम्पर्क गर्नुहोस्।' },
  local_health_authorities: { en: 'Local Health Authorities', hi: 'स्थानीय स्वास्थ्य प्राधिकरण', as: 'স্থানীয় স্বাস্থ্য প্ৰাধিকাৰী', ne: 'स्थानीय स्वास्थ्य प्राधिकरण' },
  state_helplines: { en: 'State Helplines', hi: 'राज्य हेल्पलाइन', as: 'ৰাজ্যিক হেল্পলাইন', ne: 'राज्य हेल्पलाइन' },
  nearby_hospitals: { en: 'Nearby Hospitals', hi: 'आस-पास के अस्पताल', as: 'ওচৰৰ চিকিৎসালয়', ne: 'नजिकका अस्पतालहरू' },
  recent_submissions: { en: 'Recent Submissions', hi: 'हाल की प्रस्तुतियाँ', as: 'শেহতীয়া দাখিলসমূহ', ne: 'भर्खरका सबमिशनहरू' },
  last_7_days: { en: 'Reports (Last 7 Days)', hi: 'रिपोर्ट (पिछले 7 दिन)', as: 'প্ৰতিবেদন (যোৱা ৭ দিন)', ne: 'रिपोर्ट (पछिल्लो ७ दिन)' },
  date: { en: 'Date', hi: 'तारीख', as: 'তাৰিখ', ne: 'मिति' },
  disease: { en: 'Disease', hi: 'रोग', as: 'ৰোগ', ne: 'रोग' },
  cases: { en: 'Cases', hi: 'मामले', as: 'ঘটনা', ne: 'केसहरू' },
};

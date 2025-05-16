import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const states = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli' },
  { value: 'DD', label: 'Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' }
];



// lib/utils.ts - Add these additional data structures

// Rename the existing states array to indstates
export const indstates = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli' },
  { value: 'DD', label: 'Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' }
];

// UAE Emirates
export const uaeemirates = [
  { value: 'AUH', label: 'Abu Dhabi' },
  { value: 'DXB', label: 'Dubai' },
  { value: 'SHJ', label: 'Sharjah' },
  { value: 'AJM', label: 'Ajman' },
  { value: 'UAQ', label: 'Umm Al Quwain' },
  { value: 'RAK', label: 'Ras Al Khaimah' },
  { value: 'FUJ', label: 'Fujairah' }
];

export const countries = [
  { value: 'IN', label: 'India' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' }
  // Add more countries as needed
];

// Map states to their respective countries
export const countryStateMap: Record<string, Array<{value: string, label: string}>> = {
  'IN': indstates, // Your existing states array for India (renamed)
  'AE': uaeemirates, // UAE emirates
  'US': [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    // Add more US states as needed
  ],
  'UK': [
    { value: 'EN', label: 'England' },
    { value: 'SC', label: 'Scotland' },
    { value: 'WL', label: 'Wales' },
    { value: 'NI', label: 'Northern Ireland' }
  ],
  // Add more countries and their states
};

// Cities mapped to states (sample data - expand as needed)
export const stateCityMap: Record<string, Array<{value: string, label: string}>> = {
  // India
  // Andaman and Nicobar Islands
  'AN': [
    { value: 'PBL', label: 'Port Blair' },
    { value: 'MYB', label: 'Mayabunder' },
    { value: 'CAR', label: 'Car Nicobar' },
    { value: 'DGP', label: 'Diglipur' },
    { value: 'HVL', label: 'Havelock Island' }
  ],
  
  // Andhra Pradesh
  'AP': [
    { value: 'VIJ', label: 'Vijayawada' },
    { value: 'VZG', label: 'Visakhapatnam' },
    { value: 'NEL', label: 'Nellore' },
    { value: 'GNT', label: 'Guntur' },
    { value: 'KKL', label: 'Kakinada' },
    { value: 'TPT', label: 'Tirupati' },
    { value: 'RJM', label: 'Rajahmundry' },
    { value: 'ATP', label: 'Anantapur' },
    { value: 'CDP', label: 'Cuddapah' },
    { value: 'KRN', label: 'Kurnool' }
  ],
  
  // Arunachal Pradesh
  'AR': [
    { value: 'ITN', label: 'Itanagar' },
    { value: 'PAS', label: 'Pasighat' },
    { value: 'TEZ', label: 'Tezpur' },
    { value: 'BOM', label: 'Bomdila' },
    { value: 'ALN', label: 'Along' },
    { value: 'ZRO', label: 'Ziro' }
  ],
  
  // Assam
  'AS': [
    { value: 'GHY', label: 'Guwahati' },
    { value: 'DRG', label: 'Dibrugarh' },
    { value: 'JRT', label: 'Jorhat' },
    { value: 'SLR', label: 'Silchar' },
    { value: 'NGO', label: 'Nagaon' },
    { value: 'TIN', label: 'Tinsukia' },
    { value: 'TZP', label: 'Tezpur' },
    { value: 'DIB', label: 'Dibrugarh' }
  ],
  
  // Bihar
  'BR': [
    { value: 'PTN', label: 'Patna' },
    { value: 'GYA', label: 'Gaya' },
    { value: 'BHG', label: 'Bhagalpur' },
    { value: 'MZP', label: 'Muzaffarpur' },
    { value: 'DRB', label: 'Darbhanga' },
    { value: 'ARA', label: 'Arrah' },
    { value: 'BXR', label: 'Buxar' },
    { value: 'BHP', label: 'Biharsharif' },
    { value: 'SAS', label: 'Sasaram' },
    { value: 'HPR', label: 'Hajipur' }
  ],
  
  // Chandigarh
  'CH': [
    { value: 'CHD', label: 'Chandigarh' },
    { value: 'MAN', label: 'Manimajra' },
    { value: 'PSH', label: 'Panchkula' },
    { value: 'MHL', label: 'Mohali' }
  ],
  
  // Chhattisgarh
  'CT': [
    { value: 'RPR', label: 'Raipur' },
    { value: 'BLR', label: 'Bilaspur' },
    { value: 'DRG', label: 'Durg' },
    { value: 'BJR', label: 'Bhilai' },
    { value: 'KKR', label: 'Korba' },
    { value: 'RGH', label: 'Rajnandgaon' },
    { value: 'ABJ', label: 'Ambikapur' },
    { value: 'JGD', label: 'Jagdalpur' }
  ],
  
  // Dadra and Nagar Haveli
  'DN': [
    { value: 'SLV', label: 'Silvassa' },
    { value: 'AMD', label: 'Amli' },
    { value: 'DNH', label: 'Dadra' },
    { value: 'NAR', label: 'Naroli' }
  ],
  
  // Daman and Diu
  'DD': [
    { value: 'DAM', label: 'Daman' },
    { value: 'DIU', label: 'Diu' }
  ],
  
  // Delhi
  'DL': [
    { value: 'NDL', label: 'New Delhi' },
    { value: 'SDL', label: 'South Delhi' },
    { value: 'NDL', label: 'North Delhi' },
    { value: 'EDL', label: 'East Delhi' },
    { value: 'WDL', label: 'West Delhi' },
    { value: 'DWK', label: 'Dwarka' },
    { value: 'ROH', label: 'Rohini' },
    { value: 'NGD', label: 'Najafgarh' },
    { value: 'SHD', label: 'Shahdara' },
    { value: 'NND', label: 'Narela' }
  ],
  
  // Goa
  'GA': [
    { value: 'PNJ', label: 'Panaji' },
    { value: 'MRG', label: 'Margao' },
    { value: 'VAP', label: 'Vasco da Gama' },
    { value: 'MPM', label: 'Mapusa' },
    { value: 'PDN', label: 'Ponda' },
    { value: 'CNL', label: 'Canacona' }
  ],
  
  // Gujarat
  'GJ': [
    { value: 'AMD', label: 'Ahmedabad' },
    { value: 'SRT', label: 'Surat' },
    { value: 'VDR', label: 'Vadodara' },
    { value: 'RJK', label: 'Rajkot' },
    { value: 'BVN', label: 'Bhavnagar' },
    { value: 'JMN', label: 'Jamnagar' },
    { value: 'JNG', label: 'Junagadh' },
    { value: 'GND', label: 'Gandhinagar' },
    { value: 'ANK', label: 'Ankleshwar' },
    { value: 'NAV', label: 'Navsari' },
    { value: 'VLS', label: 'Valsad' },
    { value: 'BHJ', label: 'Bhuj' }
  ],
  
  // Haryana
  'HR': [
    { value: 'FBD', label: 'Faridabad' },
    { value: 'GGN', label: 'Gurugram' },
    { value: 'PNC', label: 'Panchkula' },
    { value: 'AMB', label: 'Ambala' },
    { value: 'HSR', label: 'Hisar' },
    { value: 'KNL', label: 'Karnal' },
    { value: 'PNP', label: 'Panipat' },
    { value: 'RTK', label: 'Rohtak' },
    { value: 'SNP', label: 'Sonipat' },
    { value: 'YNR', label: 'Yamunanagar' }
  ],
  
  // Himachal Pradesh
  'HP': [
    { value: 'SML', label: 'Shimla' },
    { value: 'MND', label: 'Mandi' },
    { value: 'DRM', label: 'Dharamshala' },
    { value: 'SLN', label: 'Solan' },
    { value: 'KLU', label: 'Kullu' },
    { value: 'BLS', label: 'Bilaspur' },
    { value: 'HMR', label: 'Hamirpur' },
    { value: 'UNA', label: 'Una' },
    { value: 'KGR', label: 'Kangra' },
    { value: 'CNN', label: 'Chamba' }
  ],
  
  // Jammu and Kashmir
  'JK': [
    { value: 'SRN', label: 'Srinagar' },
    { value: 'JAM', label: 'Jammu' },
    { value: 'ANT', label: 'Anantnag' },
    { value: 'BRW', label: 'Baramulla' },
    { value: 'KTR', label: 'Kathua' },
    { value: 'SMB', label: 'Sopore' },
    { value: 'UDP', label: 'Udhampur' },
    { value: 'PUL', label: 'Pulwama' }
  ],
  
  // Jharkhand
  'JH': [
    { value: 'RNC', label: 'Ranchi' },
    { value: 'JSR', label: 'Jamshedpur' },
    { value: 'DND', label: 'Dhanbad' },
    { value: 'BOK', label: 'Bokaro' },
    { value: 'HZB', label: 'Hazaribagh' },
    { value: 'DMK', label: 'Deoghar' },
    { value: 'PNG', label: 'Phusro' },
    { value: 'GIR', label: 'Giridih' }
  ],
  
  // Karnataka
  'KA': [
    { value: 'BLR', label: 'Bengaluru' },
    { value: 'MYS', label: 'Mysuru' },
    { value: 'HUB', label: 'Hubballi-Dharwad' },
    { value: 'MLR', label: 'Mangaluru' },
    { value: 'BGM', label: 'Belagavi' },
    { value: 'DVG', label: 'Davangere' },
    { value: 'TUM', label: 'Tumakuru' },
    { value: 'SHV', label: 'Shivamogga' },
    { value: 'BIJ', label: 'Vijayapura' },
    { value: 'RCH', label: 'Raichur' },
    { value: 'KLB', label: 'Kalaburagi' },
    { value: 'BLC', label: 'Ballari' }
  ],
  
  // Kerala
  'KL': [
    { value: 'TVM', label: 'Thiruvananthapuram' },
    { value: 'KCH', label: 'Kochi' },
    { value: 'KZK', label: 'Kozhikode' },
    { value: 'TCR', label: 'Thrissur' },
    { value: 'KNR', label: 'Kannur' },
    { value: 'KTM', label: 'Kottayam' },
    { value: 'ALP', label: 'Alappuzha' },
    { value: 'KLM', label: 'Kollam' },
    { value: 'PGT', label: 'Palakkad' },
    { value: 'MLP', label: 'Malappuram' },
    { value: 'PTA', label: 'Pathanamthitta' },
    { value: 'IDK', label: 'Idukki' },
    { value: 'WYD', label: 'Wayanad' },
    { value: 'KSR', label: 'Kasaragod' }
  ],
  
  // Ladakh
  'LA': [
    { value: 'LEH', label: 'Leh' },
    { value: 'KAR', label: 'Kargil' },
    { value: 'NYM', label: 'Nubra' },
    { value: 'ZAN', label: 'Zanskar' }
  ],
  
  // Lakshadweep
  'LD': [
    { value: 'KVT', label: 'Kavaratti' },
    { value: 'AGT', label: 'Agatti' },
    { value: 'AMN', label: 'Amini' },
    { value: 'MNC', label: 'Minicoy' }
  ],
  
  // Madhya Pradesh
  'MP': [
    { value: 'BPL', label: 'Bhopal' },
    { value: 'IND', label: 'Indore' },
    { value: 'JBP', label: 'Jabalpur' },
    { value: 'GWL', label: 'Gwalior' },
    { value: 'UJN', label: 'Ujjain' },
    { value: 'STN', label: 'Satna' },
    { value: 'RWA', label: 'Rewa' },
    { value: 'SAG', label: 'Sagar' },
    { value: 'DEW', label: 'Dewas' },
    { value: 'KTN', label: 'Katni' },
    { value: 'SHD', label: 'Singrauli' },
    { value: 'RTL', label: 'Ratlam' }
  ],
  
  // Maharashtra
  'MH': [
    { value: 'BOM', label: 'Mumbai' },
    { value: 'PNQ', label: 'Pune' },
    { value: 'NAG', label: 'Nagpur' },
    { value: 'THA', label: 'Thane' },
    { value: 'NAS', label: 'Nashik' },
    { value: 'AUR', label: 'Aurangabad' },
    { value: 'SOL', label: 'Solapur' },
    { value: 'NAD', label: 'Nanded' },
    { value: 'KLH', label: 'Kolhapur' },
    { value: 'SAN', label: 'Sangli' },
    { value: 'AMR', label: 'Amravati' },
    { value: 'AKO', label: 'Akola' },
    { value: 'JAL', label: 'Jalgaon' },
    { value: 'DHU', label: 'Dhule' }
  ],
  
  // Manipur
  'MN': [
    { value: 'IMP', label: 'Imphal' },
    { value: 'TMG', label: 'Thoubal' },
    { value: 'CHR', label: 'Churachandpur' },
    { value: 'UKL', label: 'Ukhrul' },
    { value: 'BPR', label: 'Bishnupur' }
  ],
  
  // Meghalaya
  'ML': [
    { value: 'SHL', label: 'Shillong' },
    { value: 'TUR', label: 'Tura' },
    { value: 'JWI', label: 'Jowai' },
    { value: 'NGN', label: 'Nongstoin' },
    { value: 'NPH', label: 'Nongpoh' }
  ],
  
  // Mizoram
  'MZ': [
    { value: 'AIZ', label: 'Aizawl' },
    { value: 'LNG', label: 'Lunglei' },
    { value: 'SAH', label: 'Saiha' },
    { value: 'CHM', label: 'Champhai' },
    { value: 'KLS', label: 'Kolasib' }
  ],
  
  // Nagaland
  'NL': [
    { value: 'KMA', label: 'Kohima' },
    { value: 'DMR', label: 'Dimapur' },
    { value: 'MKG', label: 'Mokokchung' },
    { value: 'WOK', label: 'Wokha' },
    { value: 'TNG', label: 'Tuensang' }
  ],
  
  // Odisha
  'OR': [
    { value: 'BBI', label: 'Bhubaneswar' },
    { value: 'CTC', label: 'Cuttack' },
    { value: 'ROU', label: 'Rourkela' },
    { value: 'BER', label: 'Berhampur' },
    { value: 'SBP', label: 'Sambalpur' },
    { value: 'BLS', label: 'Balasore' },
    { value: 'BRP', label: 'Baripada' },
    { value: 'JEY', label: 'Jeypore' },
    { value: 'PRM', label: 'Puri' }
  ],
  
  // Puducherry
  'PY': [
    { value: 'PDC', label: 'Puducherry' },
    { value: 'KKL', label: 'Karaikal' },
    { value: 'MAH', label: 'Mahe' },
    { value: 'YAN', label: 'Yanam' }
  ],
   
  // Punjab
  'PB': [
    { value: 'LDH', label: 'Ludhiana' },
    { value: 'ASR', label: 'Amritsar' },
    { value: 'JLD', label: 'Jalandhar' },
    { value: 'PTL', label: 'Patiala' },
    { value: 'BLA', label: 'Bathinda' },
    { value: 'PTK', label: 'Pathankot' },
    { value: 'MGA', label: 'Mohali' },
    { value: 'HOS', label: 'Hoshiarpur' },
    { value: 'MKT', label: 'Moga' },
    { value: 'MAN', label: 'Mansa' }
  ],
  
  // Rajasthan
  'RJ': [
    { value: 'JPR', label: 'Jaipur' },
    { value: 'JDU', label: 'Jodhpur' },
    { value: 'KTA', label: 'Kota' },
    { value: 'BKR', label: 'Bikaner' },
    { value: 'AJM', label: 'Ajmer' },
    { value: 'UDR', label: 'Udaipur' },
    { value: 'BHL', label: 'Bhilwara' },
    { value: 'ALW', label: 'Alwar' },
    { value: 'SIK', label: 'Sikar' },
    { value: 'GMT', label: 'Ganganagar' },
    { value: 'BSW', label: 'Bharatpur' },
    { value: 'PLW', label: 'Pali' }
  ],
  
  // Sikkim
  'SK': [
    { value: 'GNG', label: 'Gangtok' },
    { value: 'NML', label: 'Namchi' },
    { value: 'GYL', label: 'Gyalshing' },
    { value: 'MNG', label: 'Mangan' },
    { value: 'RAV', label: 'Ravangla' }
  ],
  
  // Tamil Nadu
  'TN': [
    { value: 'CHN', label: 'Chennai' },
    { value: 'CBE', label: 'Coimbatore' },
    { value: 'MDU', label: 'Madurai' },
    { value: 'TCN', label: 'Tiruchirappalli' },
    { value: 'SLM', label: 'Salem' },
    { value: 'TPR', label: 'Tiruppur' },
    { value: 'ERD', label: 'Erode' },
    { value: 'VLR', label: 'Vellore' },
    { value: 'TUT', label: 'Thoothukudi' },
    { value: 'TJR', label: 'Thanjavur' },
    { value: 'DGL', label: 'Dindigul' },
    { value: 'TNL', label: 'Tirunelveli' },
    { value: 'NGP', label: 'Nagercoil' },
    { value: 'KNC', label: 'Kanchipuram' }
  ],
  
  // Telangana
  'TG': [
    { value: 'HYD', label: 'Hyderabad' },
    { value: 'WAL', label: 'Warangal' },
    { value: 'NLG', label: 'Nizamabad' },
    { value: 'KRM', label: 'Karimnagar' },
    { value: 'SEC', label: 'Secunderabad' },
    { value: 'KHM', label: 'Khammam' },
    { value: 'ADL', label: 'Adilabad' },
    { value: 'NKL', label: 'Nalgonda' },
    { value: 'MBN', label: 'Mahabubnagar' },
    { value: 'SRD', label: 'Siddipet' }
  ],
  
  // Tripura
  'TR': [
    { value: 'AGL', label: 'Agartala' },
    { value: 'UDR', label: 'Udaipur' },
    { value: 'DMN', label: 'Dharmanagar' },
    { value: 'KLS', label: 'Kailasahar' },
    { value: 'AMB', label: 'Ambassa' }
  ],
  
  // Uttar Pradesh
  'UP': [
    { value: 'LKO', label: 'Lucknow' },
    { value: 'KNP', label: 'Kanpur' },
    { value: 'GBD', label: 'Ghaziabad' },
    { value: 'AGR', label: 'Agra' },
    { value: 'MER', label: 'Meerut' },
    { value: 'VNS', label: 'Varanasi' },
    { value: 'ALD', label: 'Prayagraj' },
    { value: 'BRY', label: 'Bareilly' },
    { value: 'MRB', label: 'Moradabad' },
    { value: 'ALG', label: 'Aligarh' },
    { value: 'SHK', label: 'Saharanpur' },
    { value: 'GRK', label: 'Gorakhpur' },
    { value: 'JHS', label: 'Jhansi' },
    { value: 'MHP', label: 'Mathura' }
  ],
  
  // Uttarakhand
  'UT': [
    { value: 'DUN', label: 'Dehradun' },
    { value: 'HRD', label: 'Haridwar' },
    { value: 'RDP', label: 'Rudrapur' },
    { value: 'HPL', label: 'Haldwani' },
    { value: 'ROO', label: 'Roorkee' },
    { value: 'KSN', label: 'Kashipur' },
    { value: 'RAR', label: 'Rishikesh' },
    { value: 'NTL', label: 'Nainital' }
  ],
  
  // West Bengal
  'WB': [
    { value: 'CCU', label: 'Kolkata' },
    { value: 'HWH', label: 'Howrah' },
    { value: 'DGP', label: 'Durgapur' },
    { value: 'ASN', label: 'Asansol' },
    { value: 'SLG', label: 'Siliguri' },
    { value: 'BEH', label: 'Berhampore' },
    { value: 'KGP', label: 'Kharagpur' },
    { value: 'MLD', label: 'Malda' },
    { value: 'JPG', label: 'Jalpaiguri' },
    { value: 'HPD', label: 'Haldia' },
    { value: 'BRY', label: 'Baharampur' },
    { value: 'BAR', label: 'Bardhaman' }
  ],


  // UAE
  // Abu Dhabi
  'AUH': [
    { value: 'AUH', label: 'Abu Dhabi City' },
    { value: 'AIN', label: 'Al Ain' },
    { value: 'RUW', label: 'Ruwais' },
    { value: 'MZD', label: 'Madinat Zayed' },
    { value: 'GHN', label: 'Ghayathi' },
    { value: 'SLA', label: 'Sila' },
    { value: 'MRF', label: 'Mirfa' },
    { value: 'TRF', label: 'Tarif' },
    { value: 'DHF', label: 'Dhafra' },
    { value: 'YSI', label: 'Yas Island' },
    { value: 'SYI', label: 'Saadiyat Island' },
    { value: 'KHL', label: 'Khalifa City' },
    { value: 'MSH', label: 'Musaffah' }
  ],
  
  // Dubai
  'DXB': [
    { value: 'DXB', label: 'Dubai City' },
    { value: 'JBL', label: 'Jebel Ali' },
    { value: 'HAT', label: 'Hatta' },
    { value: 'DMC', label: 'Dubai Marina' },
    { value: 'DIC', label: 'Dubai International City' },
    { value: 'DSO', label: 'Dubai Silicon Oasis' },
    { value: 'DLD', label: 'Dubai Land' },
    { value: 'DDP', label: 'Downtown Dubai' },
    { value: 'DJV', label: 'Jumeirah Village' },
    { value: 'PJB', label: 'Palm Jumeirah' },
    { value: 'DBR', label: 'Bur Dubai' },
    { value: 'DDR', label: 'Deira' },
    { value: 'DHL', label: 'Al Qusais' },
    { value: 'DSC', label: 'Sports City' },
    { value: 'DJL', label: 'Jumeirah Lakes Towers' },
    { value: 'DAQ', label: 'Al Quoz' },
    { value: 'DAB', label: 'Arabian Ranches' },
    { value: 'DMR', label: 'Mirdif' },
    { value: 'DJM', label: 'Jumeirah Beach Residence' },
    { value: 'DKR', label: 'Karama' }
  ],
  
  // Sharjah
  'SHJ': [
    { value: 'SHJ', label: 'Sharjah City' },
    { value: 'DBH', label: 'Dibba Al-Hisn' },
    { value: 'KHF', label: 'Khorfakkan' },
    { value: 'KLB', label: 'Kalba' },
    { value: 'DBA', label: 'Al Dhaid' },
    { value: 'MLH', label: 'Maliha' },
    { value: 'HMR', label: 'Al Hamriyah' },
    { value: 'SNR', label: 'Al Senaeyah Island' },
    { value: 'BTN', label: 'Al Batayeh' },
    { value: 'SUM', label: 'Industrial Area' },
    { value: 'NHD', label: 'Nahda' },
    { value: 'QSB', label: 'Al Qasba' },
    { value: 'MAM', label: 'Mamzar' }
  ],
  
  // Ajman
  'AJM': [
    { value: 'AJM', label: 'Ajman City' },
    { value: 'MSF', label: 'Masfout' },
    { value: 'MNM', label: 'Manama' },
    { value: 'AJR', label: 'Al Jurf' },
    { value: 'ARQ', label: 'Al Rashidiya' },
    { value: 'AMF', label: 'Mushairef' },
    { value: 'ARW', label: 'Al Rawda' },
    { value: 'AZR', label: 'Al Zahra' },
    { value: 'AMM', label: 'Marina' }
  ],
  
  // Ras Al Khaimah
  'RAK': [
    { value: 'RAK', label: 'Ras Al Khaimah City' },
    { value: 'KHR', label: 'Khatt' },
    { value: 'GHD', label: 'Ghaleelah' },
    { value: 'DIG', label: 'Digdaga' },
    { value: 'SHM', label: 'Shaam' },
    { value: 'RAM', label: 'Al Rams' },
    { value: 'JZR', label: 'Jazirat Al Hamra' },
    { value: 'MRD', label: 'Masafi' },
    { value: 'KHJ', label: 'Khor Khwair' },
    { value: 'FLJ', label: 'Al Fahlain' },
    { value: 'MAN', label: 'Manaie' }
  ],
  
  // Fujairah
  'FUJ': [
    { value: 'FUJ', label: 'Fujairah City' },
    { value: 'DBA', label: 'Dibba Al-Fujairah' },
    { value: 'MRB', label: 'Mirbah' },
    { value: 'QRF', label: 'Qidfa' },
    { value: 'MDF', label: 'Madhab' },
    { value: 'SIJ', label: 'Siji' },
    { value: 'ALQ', label: 'Al Qurayyah' },
    { value: 'ALB', label: 'Al Bidyah' },
    { value: 'ALF', label: 'Al Farfar' },
    { value: 'ALT', label: 'Al Taween' },
    { value: 'WDH', label: 'Wadi Al Helo' }
  ],
  
  // Umm Al Quwain
  'UAQ': [
    { value: 'UAQ', label: 'Umm Al Quwain City' },
    { value: 'FLH', label: 'Falaj Al Mualla' },
    { value: 'DSV', label: 'Dreamland' },
    { value: 'ALS', label: 'Al Salamah' },
    { value: 'ALR', label: 'Al Raas' },
    { value: 'ALK', label: 'Al Khor' },
    { value: 'ALD', label: 'Al Dar Al Baida' }
  ],
  
  // US
  'AL': [
    { value: 'BHM', label: 'Birmingham' },
    { value: 'MGM', label: 'Montgomery' },
    { value: 'HSV', label: 'Huntsville' },
    { value: 'MOB', label: 'Mobile' }
  ],
  'AK': [
    { value: 'ANC', label: 'Anchorage' },
    { value: 'FAI', label: 'Fairbanks' },
    { value: 'JNU', label: 'Juneau' },
    { value: 'KTN', label: 'Ketchikan' }
  ],
  'AZ': [
    { value: 'PHX', label: 'Phoenix' },
    { value: 'TUS', label: 'Tucson' },
    { value: 'MSA', label: 'Mesa' },
    { value: 'GLD', label: 'Glendale' }
  ],
  
  // UK
  'EN': [
    { value: 'LDN', label: 'London' },
    { value: 'MAN', label: 'Manchester' },
    { value: 'BRM', label: 'Birmingham' },
    { value: 'LDS', label: 'Leeds' },
    { value: 'LVP', label: 'Liverpool' }
  ],
  'SC': [
    { value: 'EDI', label: 'Edinburgh' },
    { value: 'GLA', label: 'Glasgow' },
    { value: 'ABD', label: 'Aberdeen' },
    { value: 'DND', label: 'Dundee' }
  ],
  'WL': [
    { value: 'CRD', label: 'Cardiff' },
    { value: 'SWA', label: 'Swansea' },
    { value: 'NWP', label: 'Newport' }
  ],
  'NI': [
    { value: 'BFS', label: 'Belfast' },
    { value: 'DRY', label: 'Derry' },
    { value: 'LSB', label: 'Lisburn' }
  ]
};
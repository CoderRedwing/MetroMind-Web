import { STATIONS, LINES, INTERCHANGE_MAP } from './stations.js';

// Build adjacency list graph from ordered line sequences
// Each edge: { to, line, distance, travelTime, isInterchange }

const STATION_SEQUENCES = {
  RED: [
    'rithala', 'rohini_west', 'rohini_east', 'pitampura', 'kohat_enclave',
    'netaji_subhash_place', 'keshav_puram', 'kanhaiya_nagar', 'inderlok',
    'shastri_nagar', 'pratap_nagar', 'pulbangash', 'tis_hazari', 'kashmere_gate'
  ],
  YELLOW: [
    'samaypur_badli', 'rohini_sector18_19', 'haiderpur_badli_mor', 'jahangirpuri',
    'adarsh_nagar', 'azadpur', 'model_town', 'gtb_nagar', 'vishwavidyalaya',
    'vidhan_sabha', 'civil_lines', 'kashmere_gate', 'chandni_chowk', 'chawri_bazar',
    'new_delhi', 'rajiv_chowk', 'patel_chowk', 'central_secretariat', 'udyog_bhawan',
    'lok_kalyan_marg', 'jor_bagh', 'ina', 'aiims', 'green_park', 'hauz_khas',
    'malviya_nagar', 'saket', 'qutab_minar', 'chhattarpur', 'sultanpur',
    'ghitorni', 'arjan_garh', 'guru_dronacharya', 'sikanderpur', 'mg_road',
    'iffco_chowk', 'huda_city_centre'
  ],
  BLUE: [
    'dwarka_sec21', 'dwarka_sec8', 'dwarka_sec9', 'dwarka_sec10', 'dwarka_sec11',
    'dwarka_sec12', 'dwarka_sec13', 'dwarka_sec14', 'dwarka', 'dwarka_mor',
    'nawada', 'uttam_nagar_west', 'uttam_nagar_east', 'janakpuri_west',
    'janakpuri_east', 'tilak_nagar', 'subhash_nagar', 'tagore_garden',
    'rajouri_garden', 'ramesh_nagar', 'moti_nagar', 'kirti_nagar', 'shadipur',
    'patel_nagar', 'rajendra_place', 'karol_bagh', 'jhandewalan',
    'ramakrishna_ashram_marg', 'rajiv_chowk', 'barakhamba_road', 'mandi_house',
    'supreme_court', 'indraprastha', 'yamuna_bank', 'akshardham',
    'mayur_vihar_1', 'mayur_vihar_extension', 'new_ashok_nagar',
    'noida_sec15', 'noida_sec16', 'noida_sec18', 'botanical_garden',
    'golf_course', 'noida_city_centre', 'noida_sec34'
  ],
  BLUE_NOIDA_BRANCH: [
    'yamuna_bank', 'laxmi_nagar', 'nirman_vihar', 'preet_vihar', 'karkarduma',
    'anand_vihar', 'kaushambi', 'vaishali'
  ],
  BLUE_NOIDA_ELECTRONIC: [
    'noida_sec34', 'noida_sec52', 'noida_sec61', 'noida_sec59',
    'noida_sec62', 'noida_electronic_city'
  ],
  GREEN: [
    'inderlok', 'ashok_park_main', 'satguru_ram_singh_marg', 'kirti_nagar',
    'shakar_pur', 'east_patel_nagar', 'ranjit_nagar', 'mayapuri',
    'naraina_vihar', 'delhi_cantt', 'durgabai_deshmukh_south_campus'
  ],
  VIOLET: [
    'kashmere_gate', 'lal_quila', 'jama_masjid', 'delhi_gate', 'ito',
    'mandi_house', 'janpath', 'central_secretariat', 'khan_market',
    'jawaharlal_nehru_stadium', 'jangpura', 'lajpat_nagar', 'moolchand',
    'kailash_colony', 'nehru_place', 'kalkaji_mandir', 'govindpuri',
    'harkesh_nagar', 'jasola_apollo', 'sarita_vihar', 'mohan_estate',
    'tughlakabad', 'badarpur', 'faridabad_old', 'neelam_chowk_ajronda',
    'bata_chowk', 'escorts_mujesar', 'sant_surdas_sihi', 'raja_nahar_singh'
  ],
  ORANGE: [
    'new_delhi', 'shivaji_stadium', 'dhaula_kuan', 'delhi_aerocity',
    'igi_airport', 'dwarka_sec21'
  ],
  PINK: [
    'majlis_park', 'azadpur', 'shalimar_bagh', 'netaji_subhash_place',
    'shakurpur', 'punjabi_bagh_west', 'esplanande', 'rajouri_garden',
    'mayapuri_pink', 'naraina_vihar_pink', 'delhi_cantt_pink',
    'durgabai_deshmukh_pink', 'sir_mv_nmict', 'ina', 'south_extension',
    'lajpat_nagar', 'vinobapuri', 'ashram', 'hazrat_nizamuddin',
    'mayur_vihar_1', 'mayur_vihar_pocket1', 'trilokpuri_sanjay_lake',
    'east_vinod_nagar', 'ip_extension', 'anand_vihar', 'karkarduma_court',
    'welcome', 'jaffrabad', 'maujpur_babarpur', 'gokulpuri',
    'johri_enclave', 'shiv_vihar'
  ],
  MAGENTA: [
    'janakpuri_west', 'dabri_mor', 'dashrathpuri', 'palam',
    'sadar_bazar_cantonment', 'terminal1_igi', 'shankar_vihar',
    'vasant_vihar', 'munirka', 'rk_puram', 'iit_magenta', 'hauz_khas',
    'panchsheel_park', 'chirag_delhi', 'greater_kailash', 'nehru_enclave',
    'kalkaji_mandir', 'okhla_nsic', 'sukhdev_vihar', 'jamia_millia_islamia',
    'okhla_vihar', 'jasola_vihar_shaheen_bagh', 'kalindi_kunj',
    'okhla_bird_sanctuary', 'botanical_garden'
  ],
  GREY: ['dwarka', 'nangli', 'najafgarh'],
};

// Interchange connections (same physical station, different lines)
const INTERCHANGE_CONNECTIONS = [
  { stations: ['kashmere_gate', 'kashmere_gate_yellow', 'kashmere_gate_violet'], delay: 7 },
  { stations: ['rajiv_chowk', 'rajiv_chowk_blue'], delay: 5 },
  { stations: ['central_secretariat', 'central_secretariat_violet'], delay: 5 },
  { stations: ['mandi_house', 'mandi_house_violet'], delay: 5 },
  { stations: ['hauz_khas', 'hauz_khas_yellow', 'hauz_khas_magenta'], delay: 6 },
  { stations: ['inderlok', 'inderlok_green'], delay: 5 },
  { stations: ['kirti_nagar', 'kirti_nagar_green'], delay: 5 },
  { stations: ['lajpat_nagar', 'lajpat_nagar_pink'], delay: 5 },
  { stations: ['ina', 'ina_pink'], delay: 5 },
  { stations: ['kalkaji_mandir', 'kalkaji_mandir_magenta'], delay: 5 },
  { stations: ['botanical_garden', 'botanical_garden_magenta'], delay: 5 },
  { stations: ['new_delhi', 'new_delhi_airport'], delay: 8 },
  { stations: ['dwarka_sec21', 'dwarka_sec21_airport'], delay: 5 },
  { stations: ['netaji_subhash_place', 'netaji_subhash_place_pink'], delay: 5 },
  { stations: ['azadpur', 'azadpur_pink'], delay: 5 },
  { stations: ['anand_vihar', 'anand_vihar_pink'], delay: 6 },
  { stations: ['rajouri_garden', 'rajouri_garden_pink'], delay: 5 },
  { stations: ['mayur_vihar_1', 'mayur_vihar_1_pink'], delay: 5 },
  { stations: ['lal_quila', 'lal_quila_violet'], delay: 3 },
  { stations: ['jama_masjid', 'jama_masjid_violet'], delay: 3 },
  { stations: ['yamuna_bank'], delay: 3 },
];

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildGraph() {
  const stationMap = {};
  STATIONS.forEach((s) => (stationMap[s.id] = s));

  const graph = {}; // id -> [{to, line, distance, travelTime, isInterchange}]

  const addEdge = (from, to, line, distance, travelTime, isInterchange = false) => {
    if (!graph[from]) graph[from] = [];
    if (!graph[to]) graph[to] = [];
    graph[from].push({ to, line, distance, travelTime, isInterchange });
    graph[to].push({ to: from, line, distance, travelTime, isInterchange });
  };

  // Build edges along each line
  Object.entries(STATION_SEQUENCES).forEach(([lineName, sequence]) => {
    const lineKey = lineName.includes('BLUE_NOIDA') ? 'BLUE' :
                    lineName.includes('BLUE') ? 'BLUE' :
                    lineName.includes('GREEN') ? 'GREEN' :
                    lineName;

    for (let i = 0; i < sequence.length - 1; i++) {
      const fromId = sequence[i];
      const toId = sequence[i + 1];
      const fromS = stationMap[fromId];
      const toS = stationMap[toId];

      if (!fromS || !toS) continue;

      const dist = haversineDistance(fromS.lat, fromS.lng, toS.lat, toS.lng);
      const time = Math.max(2, Math.round(dist * 2.5)); // ~2.5 min/km

      addEdge(fromId, toId, lineKey, dist, time);
    }
  });

  // Add interchange edges
  INTERCHANGE_CONNECTIONS.forEach(({ stations, delay }) => {
    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
        const a = stations[i];
        const b = stations[j];
        if (!graph[a]) graph[a] = [];
        if (!graph[b]) graph[b] = [];
        graph[a].push({ to: b, line: 'INTERCHANGE', distance: 0, travelTime: delay, isInterchange: true });
        graph[b].push({ to: a, line: 'INTERCHANGE', distance: 0, travelTime: delay, isInterchange: true });
      }
    }
  });

  return { graph, stationMap };
}

export { STATION_SEQUENCES };

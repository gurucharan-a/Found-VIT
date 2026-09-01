// EASILY REPLACE / EXPAND — add real VIT locations here
export interface VITLocation { id: string; label: string; zone: string }

export const VIT_LOCATIONS: VITLocation[] = [
  { id: "sjt", label: "SJT — Silver Jubilee Tower", zone: "Academic" },
  { id: "tt", label: "TT — Technology Tower", zone: "Academic" },
  { id: "smv", label: "SMV — Sir M. Visvesvaraya Block", zone: "Academic" },
  { id: "cbd", label: "CBD — Central Block", zone: "Academic" },
  { id: "prp", label: "PRP — Pearl Research Park", zone: "Academic" },
  { id: "gdn", label: "GDN — Gandhi Block", zone: "Academic" },
  { id: "library", label: "Central Library", zone: "Academic" },
  { id: "foodys", label: "Foodys Court", zone: "Food & Leisure" },
  { id: "darling", label: "Darling Residency Food Court", zone: "Food & Leisure" },
  { id: "allmart", label: "All Mart", zone: "Food & Leisure" },
  { id: "gym", label: "Gymnasium & Swimming Pool", zone: "Sports" },
  { id: "stadium", label: "Outdoor Stadium", zone: "Sports" },
  { id: "mens-hostel-a", label: "Men's Hostel - A Block", zone: "Hostels" },
  { id: "mens-hostel-b", label: "Men's Hostel - B Block", zone: "Hostels" },
  { id: "mens-hostel-c", label: "Men's Hostel - C Block", zone: "Hostels" },
  { id: "ladies-hostel", label: "Ladies Hostel Complex", zone: "Hostels" },
  { id: "main-gate", label: "Main Gate", zone: "Campus" },
  { id: "auditorium", label: "Anna Auditorium", zone: "Campus" },
  { id: "mgb", label: "MGB — M.G. Block", zone: "Academic" },
  { id: "cdmm", label: "CDMM Building", zone: "Academic" },
]

export const LOCATION_MAP = Object.fromEntries(VIT_LOCATIONS.map(l => [l.id, l.label]))

// EASILY REPLACE / EXPAND — add real VIT Chennai locations here
export interface VITLocation { id: string; label: string; zone: string }

export const VIT_LOCATIONS: VITLocation[] = [
  { id: "a-block", label: "A Block", zone: "Academic" },
  { id: "ab1", label: "AB1", zone: "Academic" },
  { id: "ab2", label: "AB2", zone: "Academic" },
  { id: "ab3", label: "AB3", zone: "Academic" },
  { id: "ab4", label: "AB4", zone: "Academic" },
  { id: "ab5", label: "AB5", zone: "Academic" },
  { id: "admin-block", label: "Admin Block", zone: "Administration" },
  { id: "b-block", label: "B Block", zone: "Academic" },
  { id: "c-block", label: "C Block", zone: "Academic" },
  { id: "clock-court", label: "Clock Court", zone: "Campus" },
  { id: "courier-pickup", label: "Courier Pickup", zone: "Services" },
  { id: "d1-block", label: "D1 Block", zone: "Academic" },
  { id: "d2-block", label: "D2 Block", zone: "Academic" },
  { id: "entrance", label: "Entrance", zone: "Campus" },
  { id: "gazebo", label: "Gazebo", zone: "Campus" },
  { id: "guest-house", label: "Guest House", zone: "Campus" },
  { id: "gymkhana-dominos", label: "Gymkhana & Dominos", zone: "Sports & Food" },
  { id: "health-center", label: "Health Center", zone: "Services" },
  { id: "library", label: "Library", zone: "Academic" },
  { id: "mg-auditorium", label: "MG Auditorium", zone: "Campus" },
  { id: "north-square", label: "North Square", zone: "Campus" },
  { id: "reception", label: "Reception", zone: "Campus" },
  { id: "sigma-block", label: "Sigma Block", zone: "Academic" },
  { id: "student-parking", label: "Student Parking Lot", zone: "Parking" },
  { id: "swimming-pool", label: "Swimming Pool", zone: "Sports" },
  { id: "v-mart", label: "V Mart", zone: "Food & Shopping" },
]

export const LOCATION_MAP = Object.fromEntries(VIT_LOCATIONS.map(l => [l.id, l.label]))

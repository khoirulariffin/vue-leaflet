export interface Dapur {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  targetSchools: TargetSchool[];
  createdAt: Date;
}

export interface TargetSchool {
  npsn: string;
  schoolName: string;
  lat: number;
  lng: number;
  distance?: number; // in meters
  duration?: number; // in seconds
  route?: [number, number][]; // route coordinates
}

export interface DapurFormData {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  selectedSchoolNpsn: string;
}

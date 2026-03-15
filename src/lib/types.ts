

export interface MapLayer {
  remove: any;
  select: any;
  style: any;
  transition: () => MapLayer;
  duration: (ms: number) => MapLayer;
  ease: (easingFunction: (t: number) => number) => MapLayer;
  attr: (name: string, value: string | number | ((d: any) => string | number)) => MapLayer;
  append: (name: string) => MapLayer;
  selectAll: (selector: string) => MapLayer;
  data: (data: any[]) => MapLayer;
  join: (name: string) => MapLayer;
  text: (value: string | ((d: any) => string)) => MapLayer;
  on: (eventType: string, callback: (event: any, d?: any) => void) => MapLayer;
}

export interface ProvincePaths {
  transition: () => ProvincePaths;
  duration: (ms: number) => ProvincePaths;
  ease: (easingFunction: (t: number) => number) => ProvincePaths;
  attr: (name: string, value: string | ((d: any) => string | number)) => ProvincePaths;
}

export interface ClinicCircles {
  transition: () => ClinicCircles;
  duration: (ms: number) => ClinicCircles;
  ease: (easingFunction: (t: number) => number) => ClinicCircles;
  attr: (name: string, value: string | number | ((d: any) => string | number)) => ClinicCircles;
  on: (eventType: string, callback: (event: any, d?: any) => void) => ClinicCircles;
}

export interface DistrictPaths {
  transition: () => DistrictPaths;
  duration: (ms: number) => DistrictPaths;
  ease: (easingFunction: (t: number) => number) => DistrictPaths;
  attr: (name: string, value: string | number | ((d: any) => string | number)) => DistrictPaths;
  on: (eventType: string, callback: (event: any, d?: any) => void) => MapLayer;
}
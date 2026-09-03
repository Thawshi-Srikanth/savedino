export interface Observation {
  candidateCode: string;
  isDiscovery: boolean;
  dateStr: string;
  utcDate: Date;
  raRaw: string;
  decRaw: string;
  raHours: number;
  decDegrees: number;
  magnitude: number;
  band: string;
  observatoryCode: string;
  rawLine: string;
}

export interface CandidateReport {
  candidateCode: string;
  isNewDiscovery: boolean;
  observationCount: number;
  observations: Observation[];
  avgMagnitude: number;
  firstSeen: Date;
  lastSeen: Date;
  speedArcsecPerHour?: number;
}

export interface ParsedMpcFile {
  observatoryCode: string;
  contact: string;
  observers: string[];
  measurers: string[];
  telescope: string;
  starCatalog: string;
  candidates: CandidateReport[];
  totalObservations: number;
}

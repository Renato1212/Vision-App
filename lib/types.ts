export type PhotoKey = "frontal_rest" | "frontal_smile" | "profile";

export type Annotation = {
  photo: PhotoKey;
  x: number;
  y: number;
  label: string;
};

export type ReportSection = {
  title: string;
  body: string;
  annotations: Annotation[];
};

export type ReportSectionKey =
  | "proporcao"
  | "linha_do_sorriso"
  | "mapa_de_volumes"
  | "mapa_dinamico"
  | "assimetria"
  | "trajectoria"
  | "perguntas";

export type ReportSections = Record<ReportSectionKey, ReportSection>;

export type Intake = {
  firstName: string;
  age: string;
  mirror: string;
  bothers: string;
  fears: string;
  previousWork: string;
  smilesFreely: string;
  orthodontic: string;
  dentalAesthetic: string;
  grinds: string;
  inFiveYears: string;
  inTenYears: string;
  inTwentyYears: string;
  ageingWell: string;
};

export type Photos = {
  frontal_rest: string;
  frontal_smile: string;
  profile: string;
};

export type StoredReport = {
  id: string;
  createdAt: string;
  serial: string;
  intake: Intake;
  photos: Photos;
  sections: ReportSections;
  status: "pending" | "ready" | "error";
  error?: string;
};

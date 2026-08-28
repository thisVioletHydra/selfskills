export type ProfileFact = {
  label: string;
  value: string;
};

export type ProfileInfo = {
  name: string;
  role: string;
  tag: string;
  blurb: string;
  portrait: string;
  facts: ProfileFact[];
  goals: string[];
  about: string[];
};
 
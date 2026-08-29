export type ProfileFact = {
  label: string;
  value: string;
};

export type ProfileInfo = {
  name: string;
  role: string;
  tag: string;
  blurb: string;
  /** Asset key from public/images (see generated asset-urls). */
  portrait: string;
  facts: ProfileFact[];
  about: string[];
};

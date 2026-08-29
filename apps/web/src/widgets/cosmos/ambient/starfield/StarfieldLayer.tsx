import type { AmbientContext } from '#web/widgets/cosmos/ambient/types';

export function StarfieldLayer(_props: AmbientContext) {
  return (
    <>
      <div className="stars-far" />
      <div className="stars-mid" />
      <div className="stars-near" />
    </>
  );
}

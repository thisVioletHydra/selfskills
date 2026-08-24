import type { OrbitMotionMode } from "#app/shared/lib/orbit-motion-state";

import { useEffect, useState } from "react";

/** Hero visible, tab active, user motion = auto */
export function useOrbitAmbientActive(motionMode: OrbitMotionMode) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      return;
    }

    let inView = true;
    let pageVisible = document.visibilityState === "visible";

    const sync = () => {
      setActive(motionMode === "auto" && inView && pageVisible);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0;
        sync();
      },
      { threshold: [0, 0.05], rootMargin: "0px" },
    );
    io.observe(hero);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      sync();
    };

    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [motionMode]);

  return active;
}

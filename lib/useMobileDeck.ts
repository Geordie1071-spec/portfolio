"use client";

import { useEffect, useState } from "react";

const QUERY = "(max-width: 680px)";

export function useMobileDeck() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

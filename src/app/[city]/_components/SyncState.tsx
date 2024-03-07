"use client";

import { busAtom, directionAtom, stationAtom } from "@/state/busState";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
let hydrating = true;

export default function SyncState({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const bus = useAtomValue(busAtom);
  const direction = useAtomValue(directionAtom);
  // const station = useAtomValue(stationAtom);
  const [hydrated, setHydrated] = useState(() => !hydrating);

  const searchParams = useSearchParams();
  

  // useEffect(() => {
  //   if (hydrated) {
  //     router.push(
  //       `?bus=${bus ?? ""}&direction=${
  //         direction !== null ? direction : ""
  //       }&station=${station ?? ""}`
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [bus, station, direction]);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);
  return <>{children}</>;
}

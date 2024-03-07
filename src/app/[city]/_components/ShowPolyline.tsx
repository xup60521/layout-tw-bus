"use client";

import { togglePolylineAtom } from "@/state/busState";
import { useAtomValue } from "jotai";
import type { PathOptions } from "leaflet";
import { useEffect, useRef } from "react";
import { Polyline, Popup, Tooltip } from "react-leaflet";

export default function ShowPolyline({
  positions,
  pathOptions,
  headSign,
  routeName,
  direction,
}: {
  positions: [number, number][];
  pathOptions: PathOptions;
  headSign: string;
  routeName: string;
  direction: string;
}) {
  const togglePolyline = useAtomValue(togglePolylineAtom);
  const polylineRef = useRef<L.Polyline>(null)
  useEffect(() => {
    if (togglePolyline.routeName === routeName && togglePolyline.direction === direction) {
        polylineRef.current?.openPopup()
    }
  }, [togglePolyline]);
  return (
    <Polyline ref={polylineRef} positions={positions} pathOptions={pathOptions}>
      <Tooltip sticky>{headSign}</Tooltip>
      <Popup>
        {headSign}
      </Popup>
    </Polyline>
  );
}

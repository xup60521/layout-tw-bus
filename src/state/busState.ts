import type { BusStops, BusGeo, BusOverlay } from "@/type/busType";
import { atom } from "jotai";

export const busAtom = atom("");
export const directionAtom = atom("");
export const stationAtom = atom("");
export const busStopsAtom = atom<BusStops[]>([]);
export const busShapeAtom = atom<BusGeo[]>([]);
export const overlayAtom = atom<BusOverlay[]>([]);
export const toggleStopAtom = atom<{
  stopName?: string;
  id: number;
}>({ stopName: undefined, id: 0 });
export const togglePolylineAtom = atom<{
  routeName?: string;
  direction?: string;
  id: number;
}>({ routeName: undefined, id: 0, direction: undefined });

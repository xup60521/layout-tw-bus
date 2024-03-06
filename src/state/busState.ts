import type { BusStops, BusGeo } from "@/type/busType"
import { atom } from "jotai"


export const busAtom = atom("")
export const directionAtom = atom("")
export const stationAtom = atom("")
export const busStopsAtom = atom<BusStops[]>([])
export const busShapeAtom = atom<BusGeo[]>([])
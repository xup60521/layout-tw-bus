"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { busAtom, busShapeAtom, busStopsAtom } from "@/state/busState";
import { useAtomValue, useSetAtom } from "jotai";
import { getBusStops } from "@/server_action/getBusStops";
import { getBusShape } from "@/server_action/getBusShape";

export default function Map({ city }: { city: string }) {
  const position = useMemo(
    () => ({ lat: 24.137396608878987, lng: 120.68692065044608 }), // [緯度, 經度]
    []
  );
  const bus = useAtomValue(busAtom);
  const setBusShape = useSetAtom(busShapeAtom);
  const setBusStops = useSetAtom(busStopsAtom);

  useEffect(() => {
    if (bus) {
      getBusStops(bus, city)
        .then((stops) => {
          setBusStops([...stops]);
          getBusShape(bus, city)
            .then((shapes) => {
                const withDirectionData = shapes
                  .map((item, index, arr) => {
                    const d0 = stops.find((d) => d.Direction === 0)?.Stops.sort((a,b)=>a.StopSequence - b.StopSequence)[0]
                      .StopPosition;
                    const d1 = stops.find((d) => d.Direction === 1)?.Stops.sort((a,b)=>a.StopSequence - b.StopSequence)[0]
                      .StopPosition;
                    if (item.Direction) {
                      return item;
                    } else if (arr.length === 2 && d0 && d1) {
                      const regex = /[A-Z()]/g;
                      const position = item.Geometry.replace(regex, "")
                        .split(",")
                        .map((f) =>
                          f
                            .split(" ")
                            .reverse()
                            .map((item) => Number(item)),
                        )[0] as [number, number];
                      const length_to_d0 = (position[0] - d0.PositionLat)**2 + (position[1] - d0.PositionLon)**2
                      const length_to_d1 = (position[0] - d1.PositionLat)**2 + (position[1] - d1.PositionLon)**2
                      if (length_to_d0 >= length_to_d1) {
                        item.Direction = 1
                      } else {
                        item.Direction = 0
                      }

                      return item;
                    } else {
                      item.Direction = index;
                      return item;
                    }
                  })
                  .sort((a, b) => a.Direction - b.Direction);
              setBusShape([...withDirectionData]);
            })
            .catch((shapErr) => alert(shapErr));
        })
        .catch((StopsErr) => alert(StopsErr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      />
      <FlyToCurrent />
    </MapContainer>
  );
}

const FlyToCurrent = () => {
  const map = useMap();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.flyTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};
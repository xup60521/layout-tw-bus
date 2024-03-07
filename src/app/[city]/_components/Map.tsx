"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  busAtom,
  busShapeAtom,
  busStopsAtom,
  directionAtom,
  overlayAtom,
} from "@/state/busState";
import { useAtom, useAtomValue } from "jotai";
import { getBusStops } from "@/server_action/getBusStops";
import { getBusShape } from "@/server_action/getBusShape";
import type { BusGeo, BusOverlay, BusStops } from "@/type/busType";
import ShowMarker from "./ShowMarker";
import seedrandom from "seedrandom";
import { Icon } from "leaflet";
import ShowPolyline from "./ShowPolyline";

export default function Map({ city }: { city: string }) {
  const position = useMemo(
    () => ({ lat: 24.137396608878987, lng: 120.68692065044608 }), // [緯度, 經度]
    []
  );
  const bus = useAtomValue(busAtom);
  const direction = useAtomValue(directionAtom);
  const [busShape, setBusShape] = useAtom(busShapeAtom);
  const [busStops, setBusStops] = useAtom(busStopsAtom);
  const busOverlay = useAtomValue(overlayAtom);

  useEffect(() => {
    if (bus) {
      getBusStops(bus, city)
        .then((stops) => {
          setBusStops([...stops]);
          getBusShape(bus, city)
            .then((shapes) => {
              const withDirectionData = shapes
                .map((item, index, arr) => {
                  const d0 = stops
                    .find((d) => d.Direction === 0)
                    ?.Stops.sort(
                      (a, b) => a.StopSequence - b.StopSequence
                    )[0].StopPosition;
                  const d1 = stops
                    .find((d) => d.Direction === 1)
                    ?.Stops.sort(
                      (a, b) => a.StopSequence - b.StopSequence
                    )[0].StopPosition;
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
                          .map((item) => Number(item))
                      )[0] as [number, number];
                    const length_to_d0 =
                      (position[0] - d0.PositionLat) ** 2 +
                      (position[1] - d0.PositionLon) ** 2;
                    const length_to_d1 =
                      (position[0] - d1.PositionLat) ** 2 +
                      (position[1] - d1.PositionLon) ** 2;
                    if (length_to_d0 >= length_to_d1) {
                      item.Direction = 1;
                    } else {
                      item.Direction = 0;
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
      <ShowPolyLines
        bus={bus}
        direction={direction}
        busShape={busShape}
        busStops={busStops}
      />
      <ShowOverlayPolylines
        bus={bus}
        direction={direction}
        busOverlay={busOverlay}
      />
      <ShowStops bus={bus} direction={direction} busStops={busStops} />
      <ShowOverlayStops busOverlay={busOverlay} />
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

const ShowPolyLines = ({
  bus,
  direction,
  busStops,
  busShape,
}: {
  bus: string;
  direction: string;
  busStops: BusStops[];
  busShape: BusGeo[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (busShape) {
      const positionStr = busShape[Number(direction)]?.Geometry;
      const regex = /[A-Z()]/g;
      const positionArr = positionStr
        ?.replace(regex, "")
        .split(",")
        .map((f) =>
          f
            .split(" ")
            .reverse()
            .map((item) => Number(item))
        ) as [number, number][];
      if (positionArr) {
        const center = { lat: 0, lng: 0 } as { lat: number; lng: number };
        positionArr.forEach((d, _i, arr) => {
          center.lat += d[0] / arr.length;
          center.lng += d[1] / arr.length;
        });
        map.flyTo(center, 13);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busShape]);

  if (!busShape || bus === "" || direction === "") {
    return "";
  }
  const positionStr =
    busShape[Number(direction)]?.Geometry ?? busShape[0]?.Geometry;
  if (positionStr) {
    const regex = /[A-Z()]/g;
    const positionArr = positionStr
      .replace(regex, "")
      .split(",")
      .map((f) =>
        f
          .split(" ")
          .reverse()
          .map((item) => Number(item))
      ) as [number, number][];
    const thisStops = busStops?.find(
      (item) =>
        item.Direction === Number(direction) && item.RouteName.Zh_tw === bus
    )?.Stops;

    return (
      <>
        <ShowPolyline
          positions={positionArr}
          routeName={bus}
          direction={direction}
          pathOptions={{
            opacity: 0.6,
            color: "#809fff",
            weight: 8,
          }}
          headSign={
            thisStops
              ? `${bus}（${thisStops[0].StopName.Zh_tw} - ${
                  thisStops[thisStops.length - 1].StopName.Zh_tw
                }）`
              : bus
          }
        />
      </>
    );
  }
  return "";
};

const ShowOverlayPolylines = ({
  bus,
  direction,
  busOverlay,
}: {
  bus: string;
  direction: string;
  busOverlay: BusOverlay[];
}) => {
  return (
    <>
      {busOverlay.map((item) => {
        if (
          item.Direction === Number(direction) &&
          item.RouteName.Zh_tw === bus
        ) {
          return null;
        }
        const regex = /[A-Z()]/g;
        const positionArr = item.Geometry.replace(regex, "")
          .split(",")
          .map((f) =>
            f
              .split(" ")
              .reverse()
              .map((item) => Number(item))
          ) as [number, number][];
        const headSign = `${item.RouteName.Zh_tw}（${
          item.Stops[0].StopName.Zh_tw
        } - ${item.Stops[item.Stops.length - 1].StopName.Zh_tw}）`;
        const color_r = Math.floor(
          256 * seedrandom(item.RouteName.Zh_tw + "r")()
        )
          .toString(16)
          .padStart(2, "0");
        const color_g = Math.floor(
          256 * seedrandom(item.RouteName.Zh_tw + "g")()
        )
          .toString(16)
          .padStart(2, "0");
        const color_b = Math.floor(
          256 * seedrandom(item.RouteName.Zh_tw + "b")()
        )
          .toString(16)
          .padStart(2, "0");
        const color = `#${color_r}${color_g}${color_b}`;
        return (
          <ShowPolyline
            routeName={item.RouteName.Zh_tw}
            direction={`${item.Direction}`}
            key={`polyline ${item.RouteName.Zh_tw} ${item.Direction}`}
            positions={positionArr}
            pathOptions={{
              opacity: 0.7,
              color,
              weight: 8,
            }}
            headSign={headSign}
          />
        );
      })}
    </>
  );
};

const ShowStops = ({
  bus,
  direction,
  busStops,
}: {
  bus: string;
  direction: string;
  busStops: BusStops[];
}) => {
  if (!bus || direction === "") {
    return null;
  }

  if (busStops && bus && direction) {
    const thisDirection = busStops.find(
      (item) => item.Direction === Number(direction)
    );
    return (
      <>
        {thisDirection?.Stops.map((item) => {
          return (
            <ShowMarker
              item={item}
              key={`${item.StopSequence} ${item.StopName.Zh_tw}`}
            />
          );
        })}
      </>
    );
  }

  return null;
};

const ShowOverlayStops = ({ busOverlay }: { busOverlay: BusOverlay[] }) => {
  const ref = useRef<L.Marker>(null);
  const flatall = busOverlay.map((d) => d.Stops).flat();
  const flatName = flatall
    .map((d) => d.StopName.Zh_tw)
    .filter((item, index, arr) => arr.indexOf(item) === index);
  // const filteredOverlap = flatName.filter(name => !busStopFlat?.find(item => item === name))
  const icon = new Icon({
    iconUrl: "pin3.png",
    iconSize: [16, 16],
  });

  return (
    <>
      {flatName.map((name) => {
        const item = flatall.find((d) => d.StopName.Zh_tw === name);
        return (
          <>
            {!!item && (
              <Marker
                ref={ref}
                riseOffset={-12}
                icon={icon}
                key={`${item.StopSequence}`}
                position={[
                  item.StopPosition.PositionLat,
                  item.StopPosition.PositionLon,
                ]}
              >
                <Popup>
                  <div>
                    <p>{`${item.StopName.Zh_tw}`}</p>
                  </div>
                </Popup>
                <Tooltip direction="bottom">
                  <div>
                    <p>{`${item.StopName.Zh_tw}`}</p>
                  </div>
                </Tooltip>
              </Marker>
            )}
          </>
        );
      })}
    </>
  );
};

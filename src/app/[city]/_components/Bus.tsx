"use client";

import { Button } from "@/components/ui/button";
import type { BusEst, BusList, BusStops } from "@/type/busType";
import { Fragment, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { RNN } from "@/lib/utils";
import { SetAtom } from "@/type/setAtom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiMenu, FiMinus, FiPlus } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBusEst } from "@/server_action/getBusEst";
import { useHydrateAtoms } from "jotai/utils";
import {
  busAtom,
  busStopsAtom,
  directionAtom,
  overlayAtom,
  stationAtom,
  toggleStopAtom,
} from "@/state/busState";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { getBusStops } from "@/server_action/getBusStops";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useOverlay } from "@/hook/useOverlay";

export default function Bus({
  initBusList,
  city,
}: {
  initBusList: BusList[];
  city: string;
}) {
  const searchParams = useSearchParams();
  useHydrateAtoms([
    [busAtom, searchParams.get("bus") ?? ""],
    [directionAtom, searchParams.get("direction") ?? ""],
    [stationAtom, searchParams.get("station") ?? ""],
  ]);
  const [open, setOpen] = useState(false);
  const [bus, setBus] = useAtom(busAtom);
  const busStops = useAtomValue(busStopsAtom);
  const [station, setStation] = useAtom(stationAtom);
  const busEst = useQuery({
    queryKey: ["busEst"],
    queryFn: () => getBusEst(city, bus),
    enabled: !!bus,
    refetchInterval: 15000,
  });
  const router = useRouter();
  const busStops0 = busStops?.find((item) => item.Direction === 0)?.Stops;
  const headto0 = busStops0?.sort((a, b) => b.StopSequence - a.StopSequence)[0]
    ?.StopName.Zh_tw;
  const busStops1 = busStops?.find((item) => item.Direction === 1)?.Stops;
  const headto1 = busStops1?.sort((a, b) => b.StopSequence - a.StopSequence)[0]
    ?.StopName.Zh_tw;
  const direction0 = busEst.data?.filter((item) => item.Direction === 0);
  const direction1 = busEst.data?.filter((item) => item.Direction === 1);
  const [direction, setDirection] = useAtom(directionAtom);
  const add_remove_overlay = useOverlay();
  const busOverlay = useAtomValue(overlayAtom);
  const isOneWay =
    (busStops0?.length ?? 0) > 0 && (busStops1?.length ?? 0) > 0 ? false : true;
  const isOverlayed = !!busOverlay.find(
    (d) => d.RouteName.Zh_tw === bus && d.Direction === Number(direction)
  );

  useEffect(() => {
    busEst.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);
  return (
    <>
      <div className="w-full h-full flex flex-col min-h-0">
        <div className="w-full min-h-0 p-1 h-12 box-border border-b-[1px] border-white flex gap-1 items-center">
          <button
            className=" bg-transparent text-white h-8 py-1 flex-shrink-0 px-3 border-[1px] border-white rounded-md transition-all hover:bg-white hover:text-black"
            onClick={() => setOpen(true)}
          >
            {bus ? bus : "選擇公車"}
          </button>
          {bus && (
            <>
              <button
                onClick={add_remove_overlay}
                className={`box-border flex px-2 h-8 py-2 items-center justify-center rounded-md border-[1px] text-white font-bold transition-all ${
                  isOverlayed
                    ? "border-red-300 text-red-300 hover:bg-red-300 hover:text-white"
                    : " border-white hover:bg-white hover:text-slate-700"
                }`}
              >
                {isOverlayed ? <FiMinus /> : <FiPlus />}
              </button>
              <div
                className={`w-full ${
                  isOneWay ? "" : "grid grid-cols-2 gap-1"
                } relative py-1`}
              >
                <button
                  className={`h-8	 truncate rounded-md p-1 text-center border-[1px] font-semibold transition  border-white hover:bg-white hover:text-black ${
                    isOneWay ? "w-full" : ""
                  } z-20 ${
                    direction === "0" ? "bg-white text-black" : "text-white"
                  }`}
                  onClick={() => {
                    setDirection("0");
                    router.push(
                      `?bus=${bus ?? ""}&direction=0&station=${station ?? ""}`
                    );
                  }}
                >
                  {headto0 ? `往${headto0}` : " "}
                </button>
                {isOneWay ? (
                  ""
                ) : (
                  <button
                    className={`z-20 h-8 truncate rounded-md p-1 text-center font-semibold border-[1px] transition border-white hover:bg-white hover:text-black ${
                      direction === "1" ? "text-black bg-white" : "text-white"
                    }`}
                    onClick={() => {
                      setDirection("1");
                      router.push(
                        `?bus=${bus ?? ""}&direction=1&station=${station ?? ""}`
                      );
                    }}
                  >
                    {headto1 ? `往${headto1}` : " "}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <ScrollArea className="w-full h-full">
          <div className="flex w-full flex-col gap-1 p-1">
            <StopList
              list={direction === "0" ? direction0 : direction1}
              stops={direction === "0" ? busStops0 : busStops1}
              station={station}
              setStation={setStation}
              bus={bus}
              direction={direction}
              router={router}
              isLoading={busEst.isLoading}
            />
          </div>
        </ScrollArea>
      </div>
      <DrawerSection
        initBusList={initBusList}
        open={open}
        setOpen={setOpen}
        setBus={setBus}
        setDirection={setDirection}
        router={router}
        station={station}
      />
    </>
  );
}

function DrawerSection({
  initBusList,
  open,
  setOpen,
  setBus,
  setDirection,
  router,
  station,
}: {
  initBusList: BusList[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBus: SetAtom<[SetStateAction<string>], void>;
  setDirection: SetAtom<[SetStateAction<string>], void>;
  router: AppRouterInstance;
  station: string;
}) {
  const [qString, setQString] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const data = structuredClone(initBusList)
    .sort(
      (a, b) => Number(RNN(a.RouteName.Zh_tw)) - Number(RNN(b.RouteName.Zh_tw))
    )
    .map((item) => {
      const headSign = `${item.RouteName.Zh_tw} ${
        item.SubRoutes[0].Headsign ?? ""
      }`;
      return {
        headSign,
        ...item,
      };
    })
    .filter((item) => {
      if (qString) {
        return item.headSign.includes(qString);
      }
      return true;
    });

  return (
    <>
      <Drawer onClose={() => setOpen(false)} open={open}>
        <DrawerContent
          onInteractOutside={() => setOpen(false)}
          onEscapeKeyDown={() => setOpen(false)}
        >
          <DrawerHeader>
            <DrawerTitle>選擇公車</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col items-center">
            <Input
              ref={inputRef}
              value={qString}
              onChange={(e) => {
                setQString(e.target.value);
              }}
              placeholder="搜尋路線..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputRef.current?.blur();
                }
              }}
            />
            <ScrollArea className="h-[60vh] w-full">
              <div className="w-full flex flex-col">
                {data.map((item, index) => {
                  return (
                    <Fragment
                      key={`fragment ${item.SubRoutes[0].SubRouteName.Zh_tw}`}
                    >
                      {index !== 0 && (
                        <div className="w-full border-t-[0.05rem] border-slate-100 mx-1" />
                      )}
                      <div
                        onClick={() => {
                          closeBtnRef.current?.click();
                          setQString("");
                          setBus(item.RouteName.Zh_tw);
                          setDirection("0");
                          router.push(
                            `?bus=${
                              item.RouteName.Zh_tw
                            }&direction=${"0"}&station=${station}`
                          );
                        }}
                        className="p-2 py-3 rounded-md hover:bg-slate-100 hover:cursor-pointer transition-all"
                      >
                        {item.headSign}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </ScrollArea>

            <Button
              variant="outline"
              ref={closeBtnRef}
              onClick={() => setOpen(false)}
              className="w-fit"
            >
              取消
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

const StopList = ({
  isLoading,
  list,
  // setPage,
  setStation,
  station,
  stops,
  bus,
  direction,
  router,
}: {
  list?: BusEst[];
  isLoading: boolean;
  // setPage: SetAtom<[SetStateAction<string>], void>;
  setStation: SetAtom<[SetStateAction<string>], void>;
  station: string;
  stops?: BusStops["Stops"];
  bus: string;
  direction: string;
  router: AppRouterInstance;
}) => {
  const setToggleStop = useSetAtom(toggleStopAtom);
  if (!list) {
    return "";
  }

  return (
    <>
      {stops
        ?.sort((a, b) => a.StopSequence - b.StopSequence)
        .map((item) => {
          let g = list.find((d) => d.StopSequence === item.StopSequence);
          if (!g) {
            g = list.find((d) => d.StopName.Zh_tw === item.StopName.Zh_tw);
          }
          return (
            <div
              className="flex w-full justify-between text-white"
              key={`${item.StopSequence} ${item.StopName.Zh_tw}`}
            >
              <div className="flex h-full items-center gap-2">
                <RemainningTime
                  EstimateTime={g?.EstimateTime}
                  NextBusTime={g?.NextBusTime}
                  isLoading={isLoading}
                />
                <button
                  onClick={() => {
                    setToggleStop((prev) => ({
                      stopName: item.StopName.Zh_tw,
                      id: prev.id + 1,
                    }));
                  }}
                  className="group relative"
                >
                  <span>{item.StopName.Zh_tw}</span>
                  <span
                    className={`absolute -bottom-1 left-1/2 h-0.5 w-0 bg-red-400 group-hover:w-1/2 group-hover:transition-all 
                    ${station === item.StopName.Zh_tw ? "w-1/2" : ""}`}
                  ></span>
                  <span
                    className={`absolute -bottom-1 right-1/2 h-0.5 w-0 bg-red-400 group-hover:w-1/2 group-hover:transition-all 
                    ${station === item.StopName.Zh_tw ? "w-1/2" : ""}`}
                  ></span>
                </button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="bg-transparant h-fit  w-fit -translate-x-2 rounded border-[1px] border-white p-1 text-center font-bold text-white transition-all hover:bg-white hover:text-black">
                    <FiMenu />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setStation(item.StopName.Zh_tw);
                      router.push(
                        `?bus=${bus ?? ""}&direction=${
                          direction !== "" ? direction : ""
                        }&station=${item.StopName.Zh_tw ?? ""}`
                      );
                    }}
                  >
                    <span>查看站牌</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
    </>
  );
};

const RemainningTime = ({
  EstimateTime,
  NextBusTime,
  isLoading,
}: {
  EstimateTime: BusEst["EstimateTime"];
  NextBusTime: BusEst["NextBusTime"];
  isLoading: boolean;
}) => {
  const min = Math.floor(Number(EstimateTime ?? 0) / 60);
  const color =
    min > 5 ? "bg-slate-100 text-slate-600" : "bg-red-200 text-red-900";
  if (isLoading) {
    return (
      <div className="w-20 rounded-md border-[1px] border-slate-100 p-1 py-[0.125rem] text-center text-white">
        Loading...
      </div>
    );
  }
  if (EstimateTime) {
    return (
      <div className={`h-full w-20 rounded p-1 text-center ${color}`}>
        {`${min}`.padEnd(3, " ")}分鐘
      </div>
    );
  }

  if (EstimateTime === 0) {
    return (
      <div className={`h-full w-20 rounded p-1 text-center ${color}`}>
        進站中
      </div>
    );
  }

  if (!EstimateTime && NextBusTime) {
    const date = new Date(NextBusTime);
    const time = `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return (
      <div className="w-20 rounded-md border-[1px] border-slate-100 p-1 py-[0.125rem] text-center text-slate-700">
        {time}
      </div>
    );
  }
  return (
    <div className="w-20 rounded-md border-[1px] border-slate-100 p-1 py-[0.125rem] text-center text-white">
      末班駛離
    </div>
  );
};

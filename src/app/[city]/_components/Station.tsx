"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchStop } from "@/server_action/searchStop";
import {
  busAtom,
  directionAtom,
  overlayAtom,
  stationAtom,
} from "@/state/busState";
import type { BusRoutePassBy, BusStopSearchResult } from "@/type/busType";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Popup from "reactjs-popup";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RNN } from "@/lib/utils";
import { SetAtom } from "@/type/setAtom";
import { FiMenu } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getRoutePassBy } from "@/server_action/getRoutePassby";
import { useOverlay } from "@/hook/useOverlay";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

export default function Station({ city }: { city: string }) {
  const [open, setOpen] = useState(false);
  const station = useAtomValue(stationAtom);
  const [direction, setDirection] = useAtom(directionAtom);
  const [bus, setBus] = useAtom(busAtom);
  const router = useRouter()
  const data = useQuery({
    queryKey: ["routePassBy"],
    queryFn: () => getRoutePassBy(city, station),
    enabled: !!station,
    refetchInterval: 15000,
  });

  useEffect(() => {
    data.refetch();
  }, [station]);

  return (
    <>
      <div className="w-full h-full flex flex-col min-h-0">
        <div className="w-full box-border p-1 border-b-[1px] border-white flex gap-1 items-center h-12 min-h-0">
          <button
            onClick={() => setOpen(true)}
            className=" bg-transparent text-white py-1 flex-shrink-0 px-3 border-[1px] border-white rounded-md transition-all hover:bg-white hover:text-black "
          >
            {station ? station : "選擇站牌..."}
          </button>
        </div>
        <ScrollArea className="w-full h-full">
          <div className="flex w-full flex-col gap-1 p-1">
            <BusList
              bus={bus}
              direction={direction}
              //   setPage={setPage}
              list={data.data}
              setBus={setBus}
              setDirection={setDirection}
            />
          </div>
        </ScrollArea>
      </div>
      <PopupSetStation city={city} setOpen={setOpen} open={open} bus={bus} direction={direction} router={router} />
    </>
  );
}

function PopupSetStation({
  open,
  setOpen,
  city,
  bus,
  direction,
  router
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  city: string;
  router: AppRouterInstance;
  bus: string;
  direction: string;
}) {
  const [result, setResult] = useState<BusStopSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const setStation = useSetAtom(stationAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = async () => {
    if (inputRef.current?.value && city) {
      setLoading(true);
      searchStop(inputRef.current.value, city)
        .then((data) => {
          setResult([...data]);
          setLoading(false);
        })
        .catch((err) => alert(err));
    }
  };

  const handleEnter = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputRef.current?.value && city) {
      await handleSearch();
    }
  };

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  return (
    <Popup open={open} onClose={() => setOpen(false)}>
      <div className="flex w-[95vw] flex-col  items-center gap-3 rounded-lg bg-white p-4 transition-all md:w-[40rem]">
        <h3 className="w-full text-center text-xl">搜尋站牌</h3>
        <div className="flex w-full gap-2">
          <Input onKeyDown={handleEnter} ref={inputRef} className="flex-grow" />
          <Button onClick={handleSearch} className="bg-slate-700">
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          </Button>
        </div>
        <ScrollArea className="w-full">
          <div className="max-h-[70vh] w-full">
            {result
              ?.map((d) => d.StopName.Zh_tw)
              .filter((d, i, arr) => arr.indexOf(d) === i)
              .map((item, index) => {
                return (
                  <>
                    {index !== 0 && (
                      <div className="mx-1 w-full border-t-[0.05rem] border-slate-100" />
                    )}
                    <div
                      onClick={() => {
                        setOpen(false);
                        setStation(item);
                        router.push(`?bus=${bus}&direction=${direction}&station=${item}`)
                      }}
                      key={`${item}`}
                      className="rounded-md p-2 py-3 transition-all hover:cursor-pointer hover:bg-slate-100"
                    >
                      {item}
                    </div>
                  </>
                );
              })}
          </div>
        </ScrollArea>
        <Button className="w-fit" onClick={() => setOpen(false)}>
          取消
        </Button>
      </div>
    </Popup>
  );
}

const BusList = ({
  list,
  setBus,
  setDirection,
  bus,
  direction,
}: {
  list?: BusRoutePassBy[];
  setBus: SetAtom<[SetStateAction<string>], void>;
  setDirection: SetAtom<[SetStateAction<string>], void>;
  bus: string;
  direction: string;
}) => {
  const busOverlay = useAtomValue(overlayAtom);
  const add_remove_overlay = useOverlay();

  return (
    <>
      {list
        ?.sort(
          (a, b) =>
            Number(RNN(a.RouteName.Zh_tw)) - Number(RNN(b.RouteName.Zh_tw))
        )
        .map((item) => {
          const isOverlayed = !!busOverlay.find(
            (d) =>
              d.RouteName.Zh_tw === item.RouteName.Zh_tw &&
              item.Direction === Number(direction)
          );
          return (
            <div
              key={`${item.Direction} ${item.RouteName.Zh_tw} ${item.StopSequence}`}
              className="w-full flex justify-between text-white"
            >
              <div className="h-full flex items-center gap-2">
                <RemainningTime
                  EstimateTime={item.EstimateTime}
                  NextBusTime={item.NextBusTime}
                />
                <button
                  onClick={() => {
                    setBus(item.RouteName.Zh_tw);
                    setDirection(
                      String(item.Direction === 255 ? 0 : item.Direction)
                    );
                  }}
                  className="relative group"
                >
                  <span>{item.RouteName.Zh_tw}</span>
                  <span
                    className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-red-400 group-hover:w-1/2 group-hover:transition-all ${
                      bus === item.RouteName.Zh_tw &&
                      direction === `${item.Direction}` &&
                      "w-1/2"
                    }`}
                  ></span>
                  <span
                    className={`absolute -bottom-1 right-1/2 w-0 h-0.5 bg-red-400 group-hover:w-1/2 group-hover:transition-all ${
                      bus === item.RouteName.Zh_tw &&
                      direction === `${item.Direction}` &&
                      "w-1/2"
                    }`}
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
                      setDirection(
                        String(item.Direction === 255 ? 0 : item.Direction)
                      );
                      setBus(item.RouteName.Zh_tw);
                    }}
                  >
                    <span>查看路線</span>
                  </DropdownMenuItem>
                  {bus === item.RouteName.Zh_tw &&
                    Number(direction) === item.Direction && (
                      <DropdownMenuItem onClick={add_remove_overlay}>
                        <span>
                          {isOverlayed ? "移除疊加路線" : "新增疊加路線"}
                        </span>
                      </DropdownMenuItem>
                    )}
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
}: {
  EstimateTime: BusRoutePassBy["EstimateTime"];
  NextBusTime: BusRoutePassBy["NextBusTime"];
}) => {
  const min = Math.floor(Number(EstimateTime ?? 0) / 60);
  const color =
    min > 5 ? "bg-slate-100 text-slate-600" : "bg-red-200 text-red-900";
  if (EstimateTime) {
    return (
      <div className={`w-20 p-1 text-center h-full rounded ${color}`}>
        {`${min}`.padEnd(3, " ")}分鐘
      </div>
    );
  }

  if (EstimateTime === 0) {
    return (
      <div className={`w-20 p-1 text-center h-full rounded ${color}`}>
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
      <div className="w-20 p-1 py-[0.125rem] text-center rounded-md border-slate-100 border-[1px] text-slate-700">
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

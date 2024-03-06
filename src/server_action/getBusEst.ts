"use server";

import { get_access_token } from "@/lib/get_access_token";
import type { BusEst } from "@/type/busType";

export async function getBusEst(city: string, bus: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/${city}/${bus}?$select=RouteName,StopName,Direction,NextBusTime,StopStatus,StopSequence,EstimateTime&$filter=RouteName/Zh_tw eq '${bus}'&$format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  ).then((res) => {
    return res;
  });
  const data = (await res.json()) as BusEst[];
  return data;
}

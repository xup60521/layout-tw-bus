"use server";

import { get_access_token } from "@/lib/get_access_token";
import type { BusStops } from "@/type/busType";

export async function getBusStops(bus: string, city: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/StopOfRoute/City/${city}/${bus}?$select=RouteName,Direction,Stops&$filter=RouteName/Zh_tw eq '${bus}'&$format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 },
    }
  ).then((res) => {
    return res;
  });
  const data = (await res.json()) as BusStops[];
  return data;
}

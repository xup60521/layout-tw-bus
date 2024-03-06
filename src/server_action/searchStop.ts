"use server";

import { get_access_token } from "@/lib/get_access_token";
import { BusStopSearchResult } from "@/type/busType";

export async function searchStop(q: string, city: string) {
  const access_token_res = await get_access_token();
  const access_token = access_token_res.access_token;
  const res = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/Stop/City/${city}?%24top=30&%24format=JSON&$filter=contains(StopName/Zh_tw,'${q}')&$select=StopName`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      next: { revalidate: 43200 },
    }
  ).then((res) => {
    return res;
  });
  const data = (await res.json()) as BusStopSearchResult[];
  return data;
}

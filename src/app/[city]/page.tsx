import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer } from "react-leaflet";
import Bus from "./_components/Bus";
import Station from "./_components/Station";
import Overlay from "./_components/Overlay";
import { unstable_noStore } from "next/cache";
import { getAllBus } from "@/server_action/getAllBus";
import ReactQuery from "./_components/ReactQueryClient";

const Map = dynamic(() => import("./_components/Map"), { ssr: false });

export default async function City({
  params,
  searchParams,
}: {
  params: { city: string };
  searchParams: { bus?: string; station?: string };
}) {
  unstable_noStore();
  const initBusList = await getAllBus(params.city);

  return (
    <main className="w-screen h-screen bg-slate-800 border-t-[1px] border-gray-300">
      <ReactQuery>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={65}>
            <Map city={params.city} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={35}>
            <div className="w-full h-full box-border grid grid-cols-3">
              <Bus initBusList={initBusList} city={params.city} />
              <Station city={params.city} />
              <Overlay />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQuery>
    </main>
  );
}

'use client'


import { toast } from "@/components/ui/use-toast";
import { busStopsAtom, busAtom, directionAtom, busShapeAtom, overlayAtom } from "@/state/busState";
import { useAtom } from "jotai";



export const useOverlay = () => {
    const [busStops] = useAtom(busStopsAtom);
    const [bus] = useAtom(busAtom)
    const [direction] = useAtom(directionAtom)
    const [busShape] = useAtom(busShapeAtom);
    const [busOverlay, setBusOverlay] = useAtom(overlayAtom);
    const add_remove_overlay = () => {
        const thisStops = busStops?.find((d) => d.Direction === Number(direction));
        const thisShape = busShape.find((d) => d.Direction === Number(direction));
        // add
        if (
          !busOverlay.find(
            (d) => d.RouteName.Zh_tw === bus && d.Direction === Number(direction),
          ) &&
          thisStops &&
          thisShape
        ) {
          setBusOverlay((prev) => {
            return [
              ...prev,
              {
                ...thisShape,
                Stops: thisStops.Stops,
              },
            ];
          });
          toast({
            title:"新增成功",
            description: `${bus}（${thisStops.Stops[0].StopName.Zh_tw} - ${thisStops.Stops[thisStops.Stops.length-1].StopName.Zh_tw}）`,
            className: "bg-lime-200"
          })
        }
        //remove
        if (
          busOverlay.find(
            (d) => d.RouteName.Zh_tw === bus && d.Direction === Number(direction),
          )
        ) {
          setBusOverlay((prev) => {
            const filtered = prev.filter(
              (item) =>
                item.Direction !== Number(direction) ||
                item.RouteName.Zh_tw !== bus,
            );
            return [...filtered];
          });
          const thisStops = busStops?.find((d) => d.Direction === Number(direction));
          const sign = `${bus}（${thisStops?.Stops[0].StopName.Zh_tw} - ${thisStops?.Stops[thisStops?.Stops.length-1].StopName.Zh_tw}）`
          toast({
            title: "刪除成功",
            description: sign,
            className: "bg-red-100"
          });
        }
      };
    return add_remove_overlay
}
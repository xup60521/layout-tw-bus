"use client";

import { useState } from "react";
import ReactSelect from "react-select";
import Link from "next/link";

export default function SelectCity({
  list,
}: {
  list: {
    label: string;
    value: string;
  }[];
}): React.ReactNode {
  const [value, setValue] = useState("");

  return (
    <section
      id="start"
      className="flex h-screen w-screen flex-col items-center justify-start gap-4 pt-[10vh]"
    >
      <h2 className="font-mono text-3xl">Select a city</h2>
      <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
        <ReactSelect
          placeholder="選擇城市..."
          className="w-48 text-black"
          options={list}
          onChange={(e) => setValue(e?.value ?? "")}
        />
        {list.map((item) => {
          if (!value) {
            return null;
          }
          if (item.value === value) {
            return (
              <>
                <Link
                  className="rounded-lg bg-sky-500 p-2 px-6 font-bold text-white transition-all hover:bg-sky-400"
                  key={item.value}
                  href={`/${item.value}`}
                >
                  進入
                </Link>
              </>
            );
          }
        })}
      </div>
    </section>
  );
}

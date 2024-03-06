import Image from "next/image";
import "@/styles/scrollbar.css";
import { FaGithub } from "react-icons/fa6";
import SelectCity from "./SelectCity";

export default function Home() {
  const list = [
    {label: "台北市",value:"Taipei"},
    {label: "新北市",value:"NewTaipei"},
    {label: "桃園市",value:"Taoyuan"},
    {label: "台中市",value:"Taichung"},
    {label: "台南市",value:"Tainan"},
    {label: "高雄市",value:"Kaohsiung"},
    {label: "基隆市",value:"Keelung"},
    {label: "金門縣",value:"KinmenCounty"},
    {label: "新竹市",value:"Hsinchu"},
    {label: "新竹縣",value:"HsinchuCounty"},
    {label: "苗栗縣",value:"MiaoliCounty"},
    {label: "彰化縣",value:"ChanghuaCounty"},
    {label: "南投縣",value:"NantouCounty"},
    {label: "雲林縣",value:"YunlinCounty"},
    {label: "嘉義縣",value:"ChiayiCounty"},
    {label: "嘉義市",value:"Chiayi"},
    {label: "屏東縣",value:"PingtungCounty"},
    {label: "宜蘭縣",value:"YilanCounty"},
    {label: "花蓮縣",value:"HualienCounty"},
    {label: "台東縣",value:"TaitungCounty"},
    {label: "澎湖縣",value:"PenghuCounty"},
  ];

  return (
    <main className="h-screen flex-col items-center justify-center gap-4 overflow-x-hidden overflow-y-scroll bg-slate-700 text-white scroll-smooth">
      <section className="relative flex min-h-screen w-full flex-col items-center gap-8 overflow-y-clip bg-gradient-to-b from-gray-900 to-slate-700 px-4 pt-[20vh] md:pt-[30vh]">
        <nav className="absolute left-0 top-0 flex w-screen items-center justify-between p-8">
          <span className="flex h-full items-center gap-4">
            <Image src="/icon_white.png" height={20} width={20} alt="icon" />
            <span className="font-mono text-xl">T3 Taiwan Bus</span>
          </span>
          <a
            href={"https://github.com/xup60521/t3-taiwan-bus"}
            target="_blank"
            className="flex h-full items-center"
          >
            <FaGithub className="text-xl text-gray-300 hover:text-white" />
          </a>
        </nav>
        <div
          className={
            "flex w-[60rem] max-w-[100vw] flex-col  items-center gap-8 text-center font-mono"
          }
        >
          <h1 className="text-6xl font-black px-4">
            Taking the bus without all the pain.
          </h1>
          <p className="mx-16">
            A web app with various built in function that optimizes user
            experiance of searching, finding the correct{" "}
            <span className="text-sky-300">bus</span> routes.
          </p>
        </div>
        <a
          href="#start"
          className="rounded-lg bg-sky-500 p-3 px-6 font-bold text-white transition-all hover:bg-sky-400"
        >
          Get started
        </a>
      </section>
          <SelectCity list={list} />
      {/* <ListItems list={list} /> */}
    </main>
  );
}
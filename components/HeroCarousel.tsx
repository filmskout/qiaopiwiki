"use client";
/**
 * Ken Burns hero carousel — pure CSS zoom/pan + minimal React state (no library).
 * Each slide pairs a themed illustration with a caption and a "themed question" chip;
 * clicking the chip fills + submits that question into the existing ask flow.
 */
import Image from "next/image";
import { useEffect, useState } from "react";

export interface CarouselSlide {
  src: string;
  alt: string;
  captionZh: string;
  captionEn: string;
  questionZh: string;
  questionEn: string;
  pan: "left" | "right";
}

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    src: "/art/carousel/attic-reading.webp",
    alt: "老宅阁楼夜景，年轻女性跪坐在旧木匣前捧读一封泛黄的旧信",
    captionZh: "阁楼上的木匣",
    captionEn: "The wooden box in the attic",
    questionZh: "侨批信封上为什么写着两个字——侨批？",
    questionEn: "What are Qiaopi letters?",
    pan: "left",
  },
  {
    src: "/art/carousel/nanyang-letter.webp",
    alt: "1948年南洋码头，年轻华工把一封信和纸币交给戴斗笠的水客",
    captionZh: "1948·南洋写批",
    captionEn: "1948 · A letter written in Nanyang",
    questionZh: "什么是水客？",
    questionEn: "What is a shuike (courier)?",
    pan: "right",
  },
  {
    src: "/art/carousel/old-street.webp",
    alt: "岭南老街骑楼下，老板娘看到侨批地址后神情惊讶",
    captionZh: "公明老街的骑楼",
    captionEn: "Under the arcades of Gongming's old street",
    questionZh: "什么是批局？",
    questionEn: "What is a piju (remittance house)?",
    pan: "left",
  },
  {
    src: "/art/carousel/library-archive.webp",
    alt: "图书馆地方文献阅览室，俯身翻阅一册线装旧档案",
    captionZh: "地方文献室里的旧档案",
    captionEn: "Old archives in the local literature room",
    questionZh: "侨批为什么入选世界记忆遗产？",
    questionEn: "Why were Qiaopi inscribed on the UNESCO Memory of the World?",
    pan: "right",
  },
  {
    src: "/art/carousel/ancient-village.webp",
    alt: "侨乡古村村口，老榕树垂着气根，青砖黛瓦沿石板巷延伸",
    captionZh: "老榕树下的侨乡古村",
    captionEn: "The ancestral village beneath the old banyan",
    questionZh: "光明区和侨批有什么渊源？",
    questionEn: "What is Guangming District's connection to Qiaopi?",
    pan: "left",
  },
  {
    src: "/art/carousel/village-letters.webp",
    alt: "古村老屋堂屋，天光斜射，捧起一叠用红绳扎好的泛黄信件",
    captionZh: "红绳扎好的旧家书",
    captionEn: "Old letters bound with red string",
    questionZh: "侨批体现了怎样的诚信文化？",
    questionEn: "What trust culture do Qiaopi embody?",
    pan: "right",
  },
  {
    src: "/art/carousel/memory-wall.webp",
    alt: "侨史馆展厅，玻璃展柜里陈列着泛黄侨批信封与旧算盘银票",
    captionZh: "展柜里的侨批与银票",
    captionEn: "Qiaopi and remittance notes behind glass",
    questionZh: "汕头侨批文物馆是什么时候开馆的？",
    questionEn: "When did the Shantou Qiaopi Museum open?",
    pan: "left",
  },
  {
    src: "/art/carousel/museum-display.webp",
    alt: "侨史馆纪念墙前，伸手轻触密密麻麻的镌刻名录",
    captionZh: "纪念墙上的名录",
    captionEn: "Names engraved on the memorial wall",
    questionZh: "潮汕侨批和五邑侨批有什么不同？",
    questionEn: "How do Chaoshan and Wuyi Qiaopi differ?",
    pan: "right",
  },
  {
    src: "/art/carousel/boatman-delivery.webp",
    alt: "船坞木屋暖灯下，斗笠老人展开旧油布包，露出一封火漆完好的侨批",
    captionZh: "水客送到的最后一封批",
    captionEn: "The last letter a shuike delivered",
    questionZh: "Why did the Qiaopi trade decline after 1949?",
    questionEn: "Why did the Qiaopi trade decline after 1949?",
    pan: "left",
  },
  {
    src: "/art/carousel/reunion-letter.webp",
    alt: "老饼铺内暖灯下，白发老人捧着拆开的旧信老泪纵横，孙子在旁诵读",
    captionZh: "七十七年后，批到了",
    captionEn: "Seventy-seven years later, the letter arrives",
    questionZh: "侨批体现了怎样的诚信文化？",
    questionEn: "What trust culture do Qiaopi embody?",
    pan: "right",
  },
];

export function HeroCarousel({
  lang,
  onPickQuestion,
}: {
  lang: "zh" | "en";
  onPickQuestion: (q: string) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const slide = CAROUSEL_SLIDES[index];

  return (
    <div className="hero-banner relative h-[40vh] sm:h-[300px] md:h-[55vh] md:max-h-[420px] mb-8">
      {CAROUSEL_SLIDES.map((s, i) => (
        <div
          key={s.src}
          className={`kb-slide ${i === index ? "kb-slide-active" : ""} ${
            s.pan === "left" ? "kb-pan-left" : "kb-pan-right"
          }`}
          aria-hidden={i === index ? undefined : true}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover object-[center_20%]"
          />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center gap-1.5 px-4 pb-5 md:pb-7">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fff9ef] tracking-wide drop-shadow-md">
          侨批知识 · QiaopiWiki
        </h1>
        <p className="text-[#f6efdf] text-xs sm:text-sm md:text-base drop-shadow">
          多语言开放知识问答 · A multilingual open knowledge Q&amp;A engine about Qiaopi
        </p>

        <p className="mt-1 text-[#fff9ef] text-sm sm:text-base font-medium drop-shadow zh-serif">
          {lang === "en" ? slide.captionEn : slide.captionZh}
        </p>

        <button
          type="button"
          onClick={() => onPickQuestion(lang === "en" ? slide.questionEn : slide.questionZh)}
          className="chip !bg-[#fff9ef]/90 !text-ink px-3 py-2 text-xs sm:text-sm min-h-[40px] shadow"
        >
          {lang === "en" ? slide.questionEn : slide.questionZh}
        </button>

        <div className="mt-2 flex items-center gap-1.5">
          {CAROUSEL_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-[#fff9ef]" : "w-1.5 bg-[#fff9ef]/50"
              }`}
            />
          ))}
        </div>

        <nav className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
          <a
            href="/about"
            className="text-[#fff9ef] underline underline-offset-4 decoration-[#c98a55] min-h-[44px] flex items-center"
          >
            关于项目 / About
          </a>
        </nav>
      </div>
    </div>
  );
}

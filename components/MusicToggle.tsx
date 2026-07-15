"use client";
/**
 * Floating music toggle (♪) — plays looped bgm.mp3 at low volume.
 * Default OFF (browser autoplay policy); state persisted in localStorage.
 * Does not auto-play after an answer renders — purely user-initiated.
 */
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "qiaopiwiki:bgm-on";

export function MusicToggle() {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setOn(saved === "true");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, String(on));
    const audio = audioRef.current;
    if (!audio) return;
    if (on) {
      audio.play().catch(() => {
        // Autoplay blocked (e.g. no prior user gesture) — leave paused, UI stays honest via `on` state toggle below.
      });
    } else {
      audio.pause();
    }
  }, [on, ready]);

  return (
    <>
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="none" />
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="music-toggle"
        data-on={on}
        aria-pressed={on}
        aria-label={on ? "关闭背景音乐 / Mute background music" : "播放背景音乐 / Play background music"}
        title={on ? "关闭背景音乐 / Mute background music" : "播放背景音乐 / Play background music"}
      >
        ♪
      </button>
    </>
  );
}

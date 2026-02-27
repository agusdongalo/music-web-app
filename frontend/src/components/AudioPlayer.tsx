import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    repeat,
    setPlaying,
    setCurrentTime,
    setDuration,
    nextTrack,
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(duration);
    };

    const handleEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
        return;
      }
      nextTrack();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [setCurrentTime, setDuration, setPlaying, repeat, nextTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!currentTrack?.audioUrl) {
      audio.removeAttribute("src");
      audio.load();
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    }
  }, [currentTrack, isPlaying, setPlaying, setCurrentTime, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(currentTime)) {
      return;
    }

    if (Math.abs(audio.currentTime - currentTime) > 0.35) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, setPlaying]);

  return <audio ref={audioRef} preload="metadata" />;
}

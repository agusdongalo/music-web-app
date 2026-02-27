import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuthStore } from "../store/authStore";

type LikedTrack = {
  id: string;
};

export function useLikedTracks() {
  const token = useAuthStore((state) => state.token);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) {
      setLikedIds(new Set());
      setLoaded(false);
      return;
    }

    let active = true;
    apiFetch<LikedTrack[]>("/me/liked-tracks")
      .then((tracks) => {
        if (!active) {
          return;
        }
        setLikedIds(new Set(tracks.map((track) => track.id)));
        setLoaded(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setLikedIds(new Set());
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const toggleLike = useCallback(
    async (trackId: string) => {
      if (!token) {
        return;
      }
      const isLiked = likedIds.has(trackId);
      if (isLiked) {
        await apiFetch(`/tracks/${trackId}/like`, { method: "DELETE" });
      } else {
        await apiFetch(`/tracks/${trackId}/like`, { method: "POST" });
      }
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.delete(trackId);
        } else {
          next.add(trackId);
        }
        return next;
      });
    },
    [token, likedIds]
  );

  return {
    likedIds,
    loaded,
    isAuthenticated: Boolean(token),
    toggleLike,
  };
}

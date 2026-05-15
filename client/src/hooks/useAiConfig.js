import { useEffect, useState } from "react";
import api from "../lib/api";

export function useAiConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/ai/config")
      .then((res) => {
        if (active) setConfig(res.data.providers || {});
      })
      .catch(() => {
        if (active) setConfig(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { config, loading };
}

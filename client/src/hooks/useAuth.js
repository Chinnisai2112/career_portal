import { useEffect, useState } from "react";

export function useAuth() {
  const [signedIn, setSignedIn] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setSignedIn(!!localStorage.getItem("token"));
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { signedIn };
}

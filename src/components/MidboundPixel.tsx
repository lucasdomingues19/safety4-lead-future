import { useEffect } from "react";

const MIDBOUND_SRC = "https://px.midbound.ai/cmjov6wcr0005s601e1ow4i5x";
const SCRIPT_ID = "midbound-pixel";

export function MidboundPixel() {
  useEffect(() => {
    // Ensure the pixel loads even if a CDN/cache served an older HTML shell.
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = MIDBOUND_SRC;
    document.head.appendChild(script);
  }, []);

  return null;
}

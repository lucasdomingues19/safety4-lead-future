import { useEffect } from "react";

/**
 * Minimal popup page that LinkedIn redirects to after authorisation.
 * It hands the OAuth `code`/`state` back to the window that opened it
 * (the certificate page) via postMessage, then closes itself.
 */
const LinkedInCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (window.opener) {
      window.opener.postMessage(
        { source: "linkedin-oauth", code, state, error, errorDescription },
        window.location.origin,
      );
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
      <p className="text-muted-foreground">
        Connecting to LinkedIn… you can close this window.
      </p>
    </div>
  );
};

export default LinkedInCallback;

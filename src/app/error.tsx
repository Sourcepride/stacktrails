"use client"; // Error boundaries must be Client Components

import ErrorDisplay from "@/common/utils/Error";
import { Button } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  //   useEffect(() => {
  //     // Log the error to an error reporting service
  //     console.error(error);
  //   }, [error]);

  return (
    <div>
      <ErrorDisplay
        title="Something went wrong!"
        message={
          <div className="flex flex-col items-center gap-4">
            <Button disableElevation size="large" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        }
      />
    </div>
  );
}

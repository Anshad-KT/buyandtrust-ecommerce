'use client'

import React from "react";
import ZipaaraLoader from "./_components/zipaara-loader";

export default function LoaderWrapper() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [shouldRender, setShouldRender] = React.useState(true);

  // Simulate loading completion after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    setShouldRender(false);
    // Now you can show your main content
  };

  if (!shouldRender) {
    return <div>Your main content here</div>;
  }

  return <ZipaaraLoader isExiting={!isLoading} onExitComplete={handleExitComplete} />;
}

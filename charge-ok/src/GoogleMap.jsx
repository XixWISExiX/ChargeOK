import React, { useEffect, useState } from "react";

function GoogleMap() {
  const [iframeUrl, setIframeUrl] = useState("");
  useEffect(() => {
    // Fetch the URL for the iframe from the backend
    // fetch("/generate-iframe-url?q=5HX4+F2 Norman, Oklahoma");
    fetch("http://localhost:5000/generate-iframe-url")
      .then((response) => response.json())
      .then((data) => setIframeUrl(data.url))
      .catch((error) => console.error("Error fetching iframe URL:", error));
  }, []);
  return (
    <div>
      <iframe
        title="Google Map"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        src={iframeUrl}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default GoogleMap;

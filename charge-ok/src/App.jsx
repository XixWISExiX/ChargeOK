import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mainpage from "./pages/Layout";
import FullScreenMap from "./pages/MapPage"; // Import the FullScreenMap component

export default function App() {
  return (
    <BrowserRouter basename="/ChargeOK">
      <Routes>
        <Route exact path="/" element={<Mainpage />} />
        <Route path="/map" element={<FullScreenMap />} /> {/* Add the route for the map */}
      </Routes>
    </BrowserRouter>
  );
}
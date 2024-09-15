import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mainpage from "./pages/Layout";
export default function App() {
  return (
    <BrowserRouter basename="/ChargeOK">
      <Routes>
        <Route exact path="/" element={<Mainpage />} />
      </Routes>
    </BrowserRouter>
  );
}

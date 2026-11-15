import React from "react";
import HealthAnalytics from "./pages/HealthAnalytics";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      <HealthAnalytics />
    </div>
  );
};

export default App;

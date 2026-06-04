import { Outlet } from "react-router-dom";
import AuthProvider from "./components/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col items-center justify-start bg-slate-100 py-12 gap-6">
        <h1 className="text-5xl font-bold text-blue-600">Titicaca CleanTech 🚀</h1>
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default App;
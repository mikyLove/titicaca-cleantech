import ReportForm from "./components/ReportForm";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-slate-100 py-12 gap-6">
      <h1 className="text-5xl font-bold text-blue-600">Titicaca CleanTech 🚀</h1>
      <div className="w-full flex justify-center">
        <ReportForm />
      </div>
    </div>
  );
}

export default App;
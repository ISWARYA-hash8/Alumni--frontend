function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-14 w-14 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default Loader;

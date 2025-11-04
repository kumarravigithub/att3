export const Loader = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-lg">
      <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-600 text-center">{message}</p>
    </div>
  );
};


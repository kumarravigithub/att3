export const FullScreenLoader = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 text-center">{message}</p>
        </div>
    );
};


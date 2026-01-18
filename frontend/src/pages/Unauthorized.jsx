import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          {/* Error Code */}
          <div className="text-6xl font-bold text-slate-900 mb-2">403</div>
          
          {/* Title */}
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Access Denied
          </h1>
          
          {/* Description */}
          <p className="text-slate-600 mb-8 leading-relaxed">
            You don't have permission to access this page. If you believe this is an error, please contact your administrator.
          </p>

          {/* Action Button */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
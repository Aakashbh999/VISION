import { Mail } from "lucide-react";

const VerifyEmail = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or{" "}
          <button className="text-blue-600 hover:text-blue-800">
            resend verification
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

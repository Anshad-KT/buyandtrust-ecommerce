import { RETURN_AND_REFUND_POLICY } from "@/lib/constants/returnandrefundpolicy";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{fontFamily: 'Helvetica'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {RETURN_AND_REFUND_POLICY}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

import { PaymentProvider } from "./_context/PaymentContext";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaymentProvider>
      {children}
    </PaymentProvider>
  );
}

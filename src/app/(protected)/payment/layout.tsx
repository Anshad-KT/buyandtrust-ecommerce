import { PaymentProvider } from "./_context/PaymentContext";
// import Footer from "@/app/_components/Footer";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaymentProvider>
      {children}
      {/* <Footer /> */}
    </PaymentProvider>
  );
}

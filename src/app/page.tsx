import type { Metadata } from "next";
import HomePage from "./(protected)/(home)/HomePage";

export const metadata: Metadata = {
  title: "Buy and Trust Shop | Premium Car Perfumes & Lifestyle Products",
  description:
    "Shop premium car perfumes and lifestyle products at Buy and Trust Shop. Secure online shopping with trusted quality and fast delivery in India and UAE.",
};

export default function Page() {
  return <HomePage />;
}

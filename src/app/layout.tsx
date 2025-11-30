import type { Metadata } from "next";
import "./globals.css"; // Import Tailwind CSS
import ClientLayout from "./client-layout";
// import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UiProvider } from "./components/UiProvider/UiProvider";

export const metadata: Metadata = {
  title: "Bandhan Guru",
  description:
    "Professional building solutions and project management platform",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/fevicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        <UiProvider>
          <ClientLayout>{children}</ClientLayout>
        </UiProvider>

        {/* <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        /> */}
      </body>
    </html>
  );
}

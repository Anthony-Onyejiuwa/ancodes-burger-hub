// src/app/layout.jsx

export const metadata = {
  title: "Ancodes Burger Hub",
  description: "Burger Ordering App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

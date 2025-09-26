import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Import your pages
import Home from "./pages/Home"; 
import CartPage from "./pages/Cart";
import OrdersPage from "./pages/Order";
import PaymentPage from "./pages/Payment";
import LoginPage from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        {/* Anchor links for homepage sections */}
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#menu">Menu</a>
        <a href="#contact">Contact</a>

        {/* React Router Links for other pages */}
        <Link to="/login">Login</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/payment">Payment</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={"/dashboard"} /> : <LoginPage />}
      />

      <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;

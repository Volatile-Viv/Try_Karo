import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

// Pages
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import BrandDashboardPage from "./pages/BrandDashboardPage";
import TesterDashboardPage from "./pages/TesterDashboardPage";

// Components
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import PageTransition from "./components/PageTransition";
import GlobalLoadingIndicator, {
  LoadingProvider,
} from "./components/GlobalLoadingIndicator";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <CartProvider>
              <LoadingProvider>
                <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
                  {/* Navigation */}
                  <Navbar />

                  {/* Global Loading Indicator */}
                  <GlobalLoadingIndicator />

                  {/* Main content */}
                  <PageTransition>
                    <main className="flex-grow w-full max-w-full overflow-x-hidden px-0">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<ProductsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route
                          path="/products/:id"
                          element={<ProductDetailsPage />}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/cart" element={<CartPage />} />

                        {/* Protected Routes */}
                        <Route
                          path="/profile"
                          element={<PrivateRoute element={<ProfilePage />} />}
                        />
                        <Route
                          path="/brand/dashboard"
                          element={
                            <PrivateRoute
                              element={<BrandDashboardPage />}
                              allowedRoles={["Brand", "admin"]}
                            />
                          }
                        />
                        <Route
                          path="/tester/dashboard"
                          element={
                            <PrivateRoute
                              element={<TesterDashboardPage />}
                              allowedRoles={["User", "admin"]}
                            />
                          }
                        />
                        <Route
                          path="/products/new"
                          element={
                            <PrivateRoute
                              element={<CreateProductPage />}
                              allowedRoles={["Brand", "admin"]}
                            />
                          }
                        />
                        <Route
                          path="/products/:id/edit"
                          element={
                            <PrivateRoute
                              element={<EditProductPage />}
                              allowedRoles={["Brand", "admin"]}
                            />
                          }
                        />
                      </Routes>
                    </main>
                  </PageTransition>

                  {/* Footer */}
                  <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 mt-auto transition-colors duration-200">
                    <div className="max-w-full mx-auto px-4">
                      <p className="text-center text-gray-500 dark:text-gray-400 text-xs">
                        &copy; {new Date().getFullYear()} Try Karo. All rights
                        reserved.
                      </p>
                    </div>
                  </footer>

                  {/* Chat Box */}
                  <ChatBox />
                </div>
              </LoadingProvider>
            </CartProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

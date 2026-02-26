import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-indigo-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            to="/"
            className="text-xl font-bold tracking-wider"
            onClick={closeMenu}
          >
            🧵 Tailor<span className="text-indigo-300">Hub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/add-customer"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Add Customer
                </Link>

                {user.role === "Owner" && (
                  <Link
                    to="/manage-team"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Manage Team
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 border-t border-indigo-700">
          <div className="flex flex-col px-4 pt-2 pb-4 space-y-2">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 hover:bg-indigo-700 rounded px-2"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/add-customer"
                  className="block py-2 hover:bg-indigo-700 rounded px-2"
                  onClick={closeMenu}
                >
                  Add Customer
                </Link>

                {/* --- UPDATED: Manage Team Link (Owner Only) --- */}
                {user.role === "Owner" && (
                  <Link
                    to="/manage-team"
                    className="block py-2 hover:bg-indigo-700 rounded px-2"
                    onClick={closeMenu}
                  >
                    Manage Team
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-left w-full py-2 hover:bg-red-500 rounded px-2 text-red-100"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 hover:bg-indigo-700 rounded px-2"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 bg-indigo-600 hover:bg-indigo-500 rounded px-2 mt-2"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

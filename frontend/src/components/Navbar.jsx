import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Settings, LogOut, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
              >
                <MessageCircle className="w-5 h-5 text-primary-content" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
                ChatVerse
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {authUser ? (
              <div className="dropdown dropdown-end">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-9 h-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} />
                  </div>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                    <ul className="menu dropdown-content z-50 p-2 shadow-xl bg-base-200 rounded-xl w-56 mt-2 border border-base-300">
                      <li className="menu-title px-4 py-2">
                        <span className="text-base-content/60">Signed in as</span>
                        <span className="font-semibold text-base-content block">
                          {authUser?.fullName}
                        </span>
                      </li>
                      <li>
                        <Link
                          to="/profile"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/settings"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                      </li>
                      <div className="divider my-1" />
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-error"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to={"/login"} className="btn btn-sm btn-ghost gap-2">
                  Login
                </Link>
                <Link to={"/signup"} className="btn btn-sm btn-primary gap-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

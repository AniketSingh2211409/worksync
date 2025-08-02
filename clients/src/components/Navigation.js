// components/Navigation.js (Top section - import fixes)
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Wallet,
  ChevronDown,
  Globe,
  Briefcase,
  UserCheck,
  Settings,
  Shield,
  Plus,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { truncateAddress } from "../utils/helpers";
import { USER_TYPES } from "../utils/constants";

// Rest of the Navigation component remains the same...

// components/Navigation.js (continued)
const Navigation = () => {
  const {
    account,
    user,
    isConnected,
    connectWallet,
    disconnectWallet,
    networkId,
  } = useWeb3();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".user-menu") &&
        !event.target.closest(".wallet-menu")
      ) {
        setShowUserMenu(false);
        setShowWalletMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", path: "/", public: true },
    { name: "Jobs", path: "/jobs", public: true },
    { name: "About", path: "/about", public: true },
    { name: "Contact", path: "/contact", public: true },
  ];

  const userNavItems = user?.isRegistered
    ? [
        { name: "Dashboard", path: "/dashboard", icon: Briefcase },
        ...(user.userType === "0" || user.userType === "2"
          ? [{ name: "Post Job", path: "/post-job", icon: Plus }]
          : []),
        { name: "Profile", path: "/profile", icon: User },
      ]
    : [];

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case "0":
        return <Briefcase className="w-4 h-4" />;
      case "1":
        return <UserCheck className="w-4 h-4" />;
      case "2":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getNetworkName = (id) => {
    const networks = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      97: "BSC Testnet",
      80001: "Mumbai",
    };
    return networks[id] || "Unknown";
  };

  const getNetworkColor = (id) => {
    const colors = {
      1: "bg-blue-500",
      137: "bg-purple-500",
      56: "bg-yellow-500",
      97: "bg-yellow-400",
      80001: "bg-purple-400",
    };
    return colors[id] || "bg-gray-500";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white font-display group-hover:text-purple-300 transition-colors">
              WorkSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors relative ${
                  location.pathname === item.path
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-400"
                    layoutId="activeNav"
                  />
                )}
              </Link>
            ))}

            {userNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === item.path
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <motion.button
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </motion.button>

                {/* Network Indicator */}
                <div className="relative wallet-menu">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${getNetworkColor(
                        networkId
                      )}`}
                    ></div>
                    <span className="text-sm text-gray-300">
                      {getNetworkName(networkId)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showWalletMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <Wallet className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-white font-medium">Wallet</p>
                              <p className="text-gray-400 text-sm">
                                {truncateAddress(account)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">Network</p>
                              <p className="text-gray-400 text-sm">
                                {getNetworkName(networkId)}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-3">
                            <button
                              onClick={disconnectWallet}
                              className="flex items-center space-x-2 w-full text-left text-red-400 hover:text-red-300 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Disconnect</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-sm text-gray-300">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            {getUserTypeIcon(user?.userType)}
                            <div>
                              <p className="text-white font-medium">
                                {user?.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {USER_TYPES[user?.userType]}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-3 space-y-2">
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 w-full text-left text-gray-300 hover:text-white transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/dashboard"
                              className="flex items-center space-x-2 w-full text-left text-gray-300 hover:text-white transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Briefcase className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                            <button className="flex items-center space-x-2 w-full text-left text-gray-300 hover:text-white transition-colors">
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-sm border-t border-white/10 py-4"
            >
              <div className="flex flex-col space-y-4">
                {[...navItems, ...userNavItems].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium transition-colors flex items-center space-x-2 ${
                      location.pathname === item.path
                        ? "text-purple-400"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                ))}

                {!isConnected && (
                  <button
                    onClick={connectWallet}
                    className="btn-primary flex items-center space-x-2 w-full justify-center"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;

// pages/Dashboard.jsx (Update your existing dashboard)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import { useEffect } from "react";
import { DollarSign, Briefcase, Users, TrendingUp, Plus } from "lucide-react";
import ClientDashboard from "../components/ClientDashboard";
import FreelancerDashboard from "../components/FreelancerDashboard";
import DepositInfo from "../components/DepositInfo";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const { user, account, getUserTotalDeposits, web3, contract } = useWeb3();
  const [userStats, setUserStats] = useState({
    totalEarned: "0",
    totalSpent: "0",
    totalJobs: "0",
    reputation: "1000",
  });

  const loadUserStats = async () => {
    if (!contract || !account || !web3) {
      console.log("Missing dependencies:", {
        contract: !!contract,
        account: !!account,
        web3: !!web3,
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Loading stats for account:", account);
      const userData = await contract.methods.users(account).call();
      console.log("Contract response:", userData);

      setUserStats({
        totalEarned: web3.utils.fromWei(
          userData.totalEarned?.toString() || "0",
          "ether"
        ),
        totalSpent: web3.utils.fromWei(
          userData.totalSpent?.toString() || "0",
          "ether"
        ),
        totalJobs: userData.totalJobs?.toString() || "0",
        reputation: userData.reputation?.toString() || "1000",
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && user?.isRegistered && contract && web3) {
      loadUserStats();
    }
  }, [account, user?.isRegistered, contract, web3]);

  const isClient = user?.userType === "0" || user?.userType === "2";
  const isFreelancer = user?.userType === "1" || user?.userType === "2";

  if (!account || !user?.isRegistered) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Please connect your wallet and register
          </h2>
          <p className="text-gray-400 mb-6">
            You need to be registered to access the dashboard.
          </p>
        </div>
      </div>
    );
  }
  console.log("Debug info:", {
    account,
    contract: !!contract,
    web3: !!web3,
    userRegistered: user?.isRegistered,
    userStats,
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-blue-400">{user.name}</span>
            </h1>
            <p className="text-gray-400">
              {user.userType === "0"
                ? "Client"
                : user.userType === "1"
                ? "Freelancer"
                : "Client & Freelancer"}{" "}
              Dashboard
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              Overview
            </button>

            {isClient && (
              <button
                onClick={() => setActiveTab("client")}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  activeTab === "client"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                My Jobs
              </button>
            )}

            {isFreelancer && (
              <button
                onClick={() => setActiveTab("freelancer")}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  activeTab === "freelancer"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                Assigned Work
              </button>
            )}

            <button
              onClick={() => setActiveTab("deposits")}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === "deposits"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              Deposits
            </button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Earned</p>
                        <p className="text-2xl font-bold text-green-400">
                          {parseFloat(userStats.totalEarned).toFixed(3)} ETH
                        </p>{" "}
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Spent</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {parseFloat(userStats.totalSpent).toFixed(3)} ETH
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Jobs</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {userStats.totalJobs}
                        </p>
                      </div>
                      <Briefcase className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>

                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Reputation</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {userStats.reputation}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isClient && (
                      <button
                        onClick={() => (window.location.href = "/post-job")}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Post New Job</span>
                      </button>
                    )}

                    <button
                      onClick={() => (window.location.href = "/jobs")}
                      className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Briefcase className="w-5 h-5" />
                      <span>Browse Jobs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("deposits")}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>View Deposits</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "client" && isClient && <ClientDashboard />}
            {activeTab === "freelancer" && isFreelancer && (
              <FreelancerDashboard />
            )}
            {activeTab === "deposits" && (
              <div>
                <DepositInfo userType={user.userType} />
                <div className="glass rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Deposit Information
                  </h3>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">
                          Security deposits protect both parties
                        </p>
                        <p className="text-sm text-gray-400">
                          Deposits ensure commitment and are automatically
                          refunded
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">
                          Clients pay 5% deposit when posting jobs
                        </p>
                        <p className="text-sm text-gray-400">
                          Refunded when job is completed or cancelled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">
                          Freelancers pay 5% of bid amount
                        </p>
                        <p className="text-sm text-gray-400">
                          Non-selected freelancers get immediate refunds
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">
                          All deposits held in smart contract
                        </p>
                        <p className="text-sm text-gray-400">
                          Completely secure and automated
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

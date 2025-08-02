// components/DepositInfo.jsx
import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { DollarSign, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";

const DepositInfo = ({ jobId, userType, bidAmount }) => {
  const {
    getJobDepositInfo,
    getUserTotalDeposits,
    getSecurityDepositPercentage,
    account,
  } = useWeb3();
  const [depositInfo, setDepositInfo] = useState(null);
  const [userDeposits, setUserDeposits] = useState("0");
  const [depositPercentage, setDepositPercentage] = useState(5);

  useEffect(() => {
    const fetchDepositInfo = async () => {
      try {
        if (jobId) {
          const info = await getJobDepositInfo(jobId);
          setDepositInfo(info);
        }

        if (account) {
          const deposits = await getUserTotalDeposits(account);
          setUserDeposits(deposits);
        }

        const percentage = await getSecurityDepositPercentage();
        setDepositPercentage(percentage);
      } catch (error) {
        console.error("Error fetching deposit info:", error);
      }
    };

    fetchDepositInfo();
  }, [jobId, account, bidAmount]);

  const calculateDeposit = (amount) => {
    if (!amount) return "0";
    return ((parseFloat(amount) * depositPercentage) / 100).toFixed(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 mb-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">
          Security Deposit Information
        </h3>
      </div>

      {depositInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Job Budget:</span>
              <span className="font-medium text-white">
                {depositInfo.actualBudget} ETH
              </span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Client Deposit:</span>
              <span className="font-medium text-blue-400">
                {depositInfo.clientDeposit} ETH
              </span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Freelancer Deposits:</span>
              <span className="font-medium text-green-400">
                {depositInfo.totalFreelancerDeposits} ETH
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Your Total Deposits:</span>
          <span className="font-medium text-yellow-400">
            {userDeposits} ETH
          </span>
        </div>
      </div>

      {bidAmount && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-300 mb-2">
            Required Security Deposit
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bid Amount:</span>
              <span className="text-white">{bidAmount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                Security Deposit ({depositPercentage}%):
              </span>
              <span className="text-blue-400">
                {calculateDeposit(bidAmount)} ETH
              </span>
            </div>
            <div className="flex justify-between font-medium border-t border-gray-600 pt-1 mt-2">
              <span className="text-white">Total Required:</span>
              <span className="text-green-400">
                {(
                  parseFloat(bidAmount || 0) +
                  parseFloat(calculateDeposit(bidAmount))
                ).toFixed(6)}{" "}
                ETH
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start space-x-2 text-sm text-gray-400">
        <Info className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
        <p>
          Security deposits are held safely in the smart contract and
          automatically refunded when jobs are completed or cancelled.
          Non-selected freelancers receive their deposits back immediately.
        </p>
      </div>
    </motion.div>
  );
};

export default DepositInfo;

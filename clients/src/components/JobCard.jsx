// components/JobCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  User,
  Clock,
  Shield,
  MapPin,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import JobApplicationForm from "./JobApplicationForm";

const JobCard = ({ job, onApplicationSuccess }) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { account, user, JOB_CATEGORIES, JOB_STATUSES } = useWeb3();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      0: "bg-green-500/20 text-green-400 border-green-500/30", // Posted
      1: "bg-blue-500/20 text-blue-400 border-blue-500/30", // In Progress
      2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", // Submitted
      3: "bg-purple-500/20 text-purple-400 border-purple-500/30", // Completed
      4: "bg-red-500/20 text-red-400 border-red-500/30", // Cancelled
      5: "bg-orange-500/20 text-orange-400 border-orange-500/30", // Disputed
    };
    return colors[status] || colors["0"];
  };

  const canApply = () => {
    return (
      account &&
      user?.isRegistered &&
      (user.userType === "1" || user.userType === "2") && // Freelancer or Both
      job.status === "0" && // Posted
      job.client?.toLowerCase() !== account?.toLowerCase() // Not own job
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="glass rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span
                className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(
                  job.status
                )}`}
              >
                {JOB_STATUSES[job.status] || "Unknown"}
              </span>
              <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">
                {JOB_CATEGORIES[job.category] || "Other"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400 flex items-center">
              <DollarSign className="w-5 h-5" />
              {parseFloat(job.budget).toFixed(3)} ETH
            </div>
            {job.clientDeposit && (
              <div className="text-xs text-gray-400 flex items-center justify-end mt-1">
                <Shield className="w-3 h-3 mr-1" />+
                {parseFloat(job.clientDeposit).toFixed(6)} ETH deposit
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills && job.skills.length > 0 ? (
              job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs border border-blue-500/30"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No skills specified</span>
            )}
            {job.skills && job.skills.length > 5 && (
              <span className="text-gray-400 text-xs px-2 py-1">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {formatDate(job.deadline)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Posted: {formatDate(job.createdAt)}</span>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-gray-400">
            <User className="w-4 h-4" />
            <span className="text-xs">
              Client:{" "}
              {job.client
                ? `${job.client.slice(0, 6)}...${job.client.slice(-4)}`
                : "Unknown"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {canApply() && (
              <motion.button
                onClick={() => setShowApplicationForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Apply Now</span>
              </motion.button>
            )}

            {job.status === "0" &&
              job.client?.toLowerCase() === account?.toLowerCase() && (
                <span className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm">
                  Your Job
                </span>
              )}

            {!account && (
              <span className="text-gray-400 text-sm px-4 py-2">
                Connect wallet to apply
              </span>
            )}
          </div>
        </div>

        {/* Security Deposit Info for Posted Jobs */}
        {job.status === "0" &&
          job.totalFreelancerDeposits &&
          parseFloat(job.totalFreelancerDeposits) > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Security deposits received
                </span>
                <span className="text-yellow-400">
                  {parseFloat(job.totalFreelancerDeposits).toFixed(6)} ETH
                </span>
              </div>
            </div>
          )}
      </motion.div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            if (onApplicationSuccess) onApplicationSuccess();
            setShowApplicationForm(false);
          }}
        />
      )}
    </>
  );
};

export default JobCard;

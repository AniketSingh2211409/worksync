// components/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import {
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ClientDashboard = () => {
  const {
    getUserJobs,
    getJobApplications,
    selectFreelancer,
    completeJob,
    cancelJob,
    getAllJobs,
    web3,
    CONTRACT_ADDRESS,
    account,
    contract,
    JOB_STATUSES,
    JOB_CATEGORIES,
  } = useWeb3();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserJobs();
  }, [account]);

  const fetchUserJobs = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const userJobs = await getUserJobs(account);
      console.log("📋 Client jobs loaded:", userJobs);
      setJobs(userJobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      toast.error("Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const jobApplications = await getJobApplications(jobId);
      setApplications(jobApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    }
  };

  const handleSelectFreelancer = async (jobId, freelancerAddress) => {
    setActionLoading(true);
    try {
      await selectFreelancer(jobId, freelancerAddress);
      toast.success("Freelancer selected successfully!");
      await fetchUserJobs();
      await fetchApplications(jobId);
    } catch (error) {
      console.error("Error selecting freelancer:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Fixed validation for completing jobs
  const canCompleteJob = (job) => {
    return (
      job.status === "2" && // Must be in "Submitted" status
      job.encryptedWork &&
      job.encryptedWork.trim() !== "" &&
      job.client?.toLowerCase() === account?.toLowerCase()
    );
  };

  const handleCompleteJob = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);

    // ✅ Validate before showing confirmation
    if (!canCompleteJob(job)) {
      if (job.status !== "2") {
        toast.error(
          `Job must be in 'Submitted' status to complete. Current status: ${
            JOB_STATUSES[job.status]
          }`
        );
      } else if (!job.encryptedWork || job.encryptedWork.trim() === "") {
        toast.error("No work has been submitted for this job yet.");
      } else {
        toast.error("You can only complete your own jobs.");
      }
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to mark this job as complete? This will release payment to the freelancer."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await completeJob(jobId);
      toast.success("Job completed and payment released!");
      await fetchUserJobs();
    } catch (error) {
      console.error("Error completing job:", error);
      // Error handling is already done in the Web3Context
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelJob = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);

    // ✅ Only allow canceling jobs that are not completed
    if (job.status === "3") {
      toast.error("Cannot cancel completed jobs");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel this job? This will refund your budget and security deposits."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await cancelJob(jobId);
      toast.success("Job cancelled and funds refunded!");
      await fetchUserJobs();
    } catch (error) {
      console.error("Error cancelling job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    await fetchApplications(job.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Posted Jobs</h2>
        <div className="text-sm text-gray-400">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">You haven't posted any jobs yet.</p>
          <button
            onClick={() => (window.location.href = "/post-job")}
            className="btn-primary"
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        job.status === "0"
                          ? "bg-green-500/20 text-green-400"
                          : job.status === "1"
                          ? "bg-blue-500/20 text-blue-400"
                          : job.status === "2"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : job.status === "3"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {JOB_STATUSES[job.status]}
                    </span>
                    <span className="text-gray-400">
                      {JOB_CATEGORIES[job.category]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 flex items-center">
                    <DollarSign className="w-5 h-5" />
                    {parseFloat(job.budget).toFixed(3)} ETH
                  </div>
                  {job.clientDeposit && (
                    <div className="text-xs text-yellow-400">
                      +{parseFloat(job.clientDeposit).toFixed(6)} ETH deposit
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* ✅ Show submitted work if available */}
              {job.status === "2" && job.encryptedWork && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">
                      Work Submitted - Pending Review
                    </span>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3">
                    <div className="text-sm text-gray-300">
                      {job.encryptedWork.length > 200
                        ? job.encryptedWork.substring(0, 200) + "..."
                        : job.encryptedWork}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                  {job.assignedFreelancer &&
                    job.assignedFreelancer !==
                      "0x0000000000000000000000000000000000000000" && (
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Assigned to: {job.assignedFreelancer.slice(0, 6)}...
                        {job.assignedFreelancer.slice(-4)}
                      </span>
                    )}
                </div>
                <div className="flex space-x-2">
                  {job.status === "0" && (
                    <>
                      <button
                        onClick={() => handleViewApplications(job)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Applications</span>
                      </button>
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        disabled={actionLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {job.status === "2" && (
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      disabled={actionLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete & Pay</span>
                    </button>
                  )}

                  {job.status === "1" && (
                    <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>In Progress</span>
                    </span>
                  )}

                  {job.status === "3" && (
                    <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Applications Modal - Rest remains the same */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Applications for: {selectedJob.title}
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {applications.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No applications yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-white">
                          {app.freelancer.slice(0, 6)}...
                          {app.freelancer.slice(-4)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {parseFloat(app.bidAmount).toFixed(3)} ETH
                        </div>
                        <div className="text-xs text-yellow-400">
                          +{parseFloat(app.securityDeposit).toFixed(6)} ETH
                          deposit
                        </div>
                        <div className="text-xs text-gray-400">
                          {app.deliveryTime} days delivery
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{app.proposal}</p>

                    {selectedJob.status === "0" && app.status === "0" && (
                      <button
                        onClick={() =>
                          handleSelectFreelancer(selectedJob.id, app.freelancer)
                        }
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        Select Freelancer
                      </button>
                    )}

                    {app.isSelected && (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;

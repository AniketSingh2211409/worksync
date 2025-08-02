// components/FreelancerDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import {
  DollarSign,
  Clock,
  Upload,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

const FreelancerDashboard = () => {
  const {
    getFreelancerJobs,
    submitWork,
    account,
    JOB_STATUSES,
    JOB_CATEGORIES,
  } = useWeb3();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workSubmission, setWorkSubmission] = useState({
    jobId: null,
    work: "",
  });

  useEffect(() => {
    fetchFreelancerJobs();
  }, [account]);

  const fetchFreelancerJobs = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const freelancerJobs = await getFreelancerJobs(account);
      console.log("📋 Freelancer jobs loaded:", freelancerJobs);
      setJobs(freelancerJobs);
    } catch (error) {
      console.error("Error fetching freelancer jobs:", error);
      toast.error("Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (jobId, workDescription) => {
    if (!workDescription.trim()) {
      toast.error("Please provide work description or submission details");
      return;
    }

    setActionLoading(true);
    try {
      await submitWork(jobId, workDescription);
      toast.success("Work submitted successfully!");
      await fetchFreelancerJobs();
      setWorkSubmission({ jobId: null, work: "" });
    } catch (error) {
      console.error("Error submitting work:", error);
    } finally {
      setActionLoading(false);
    }
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
        <h2 className="text-2xl font-bold text-white">Your Assigned Jobs</h2>
        <div className="text-sm text-gray-400">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} assigned
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            You don't have any assigned jobs yet.
          </p>
          <button
            onClick={() => (window.location.href = "/jobs")}
            className="btn-primary"
          >
            Browse Available Jobs
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
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        job.status === "1"
                          ? "bg-blue-500/20 text-blue-400"
                          : job.status === "2"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : job.status === "3"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
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
                  <div className="text-xs text-gray-400">
                    Payment on completion
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{job.description}</p>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.length > 0
                    ? job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs border border-blue-500/30"
                        >
                          {skill}
                        </span>
                      ))
                    : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Started: {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* ✅ Show submitted work section - Fixed to display properly */}
              {job.encryptedWork && job.encryptedWork.trim() !== "" && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">
                      {job.status === "2"
                        ? "Work Submitted - Awaiting Review"
                        : "Work Submitted & Approved"}
                    </span>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-white mb-2">
                      Your Submission:
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {job.encryptedWork}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                      Submitted on:{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                      {job.status === "3" && job.completedAt && (
                        <span className="ml-4">
                          • Completed on:{" "}
                          {new Date(job.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Client Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-sm">
                  Client:{" "}
                  {job.client
                    ? `${job.client.slice(0, 6)}...${job.client.slice(-4)}`
                    : "Unknown"}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {job.status === "1" && ( // In Progress
                    <button
                      onClick={() =>
                        setWorkSubmission({ jobId: job.id, work: "" })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Work</span>
                    </button>
                  )}

                  {job.status === "2" && ( // Submitted
                    <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting Review</span>
                    </span>
                  )}

                  {job.status === "3" && ( // Completed
                    <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed & Paid</span>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Work Submission Modal */}
      {workSubmission.jobId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Submit Your Work
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-3">
                  Work Description / Deliverables
                </label>
                <textarea
                  value={workSubmission.work}
                  onChange={(e) =>
                    setWorkSubmission({
                      ...workSubmission,
                      work: e.target.value,
                    })
                  }
                  rows="8"
                  className="form-textarea"
                  placeholder="Describe your completed work, provide links to deliverables, or upload details here..."
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">
                  💡 Submission Tips
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Provide clear descriptions of your deliverables</li>
                  <li>• Include links to live demos, repositories, or files</li>
                  <li>• Explain how you met the project requirements</li>
                  <li>
                    • Add any additional notes or instructions for the client
                  </li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setWorkSubmission({ jobId: null, work: "" })}
                  className="flex-1 px-6 py-3 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={() =>
                    handleSubmitWork(workSubmission.jobId, workSubmission.work)
                  }
                  disabled={actionLoading || !workSubmission.work.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                  whileTap={{ scale: actionLoading ? 1 : 0.98 }}
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Submit Work</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;

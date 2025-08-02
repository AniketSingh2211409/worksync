// components/JobApplicationForm.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import { X, Send, DollarSign, Calendar, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

const JobApplicationForm = ({ job, onClose, onSuccess }) => {
  const { applyForJob, getRequiredSecurityDeposit, account } = useWeb3();
  const [formData, setFormData] = useState({
    proposal: "",
    bidAmount: "",
    deliveryTime: 7,
  });
  const [securityDeposit, setSecurityDeposit] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateDeposit = async () => {
      if (formData.bidAmount && parseFloat(formData.bidAmount) > 0) {
        try {
          const deposit = await getRequiredSecurityDeposit(formData.bidAmount);
          setSecurityDeposit(deposit);
        } catch (error) {
          console.error("Error calculating deposit:", error);
          setSecurityDeposit("0");
        }
      } else {
        setSecurityDeposit("0");
      }
    };

    calculateDeposit();
  }, [formData.bidAmount, getRequiredSecurityDeposit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await applyForJob(
        job.id,
        formData.proposal,
        formData.bidAmount,
        formData.deliveryTime
      );
      toast.success("Application submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Application failed:", error);
      // Error handling is done in the applyForJob function
    } finally {
      setLoading(false);
    }
  };

  const totalRequired =
    parseFloat(formData.bidAmount || 0) + parseFloat(securityDeposit);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Apply for Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">{job.title}</h3>
          <p className="text-gray-300 text-sm">Budget: {job.budget} ETH</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">
              <FileText className="inline w-5 h-5 mr-2" />
              Your Proposal
            </label>
            <textarea
              value={formData.proposal}
              onChange={(e) =>
                setFormData({ ...formData, proposal: e.target.value })
              }
              required
              rows="6"
              className="form-textarea"
              placeholder="Describe your approach, experience, and why you're the right fit for this project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">
                <DollarSign className="inline w-5 h-5 mr-2" />
                Your Bid Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={formData.bidAmount}
                onChange={(e) =>
                  setFormData({ ...formData, bidAmount: e.target.value })
                }
                required
                className="form-input"
                placeholder="0.1"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">
                <Calendar className="inline w-5 h-5 mr-2" />
                Delivery Time (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.deliveryTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryTime: parseInt(e.target.value),
                  })
                }
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Security Deposit Information */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-medium text-yellow-300 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bid Amount:</span>
                <span className="text-white">
                  {formData.bidAmount || "0"} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Security Deposit (5%):</span>
                <span className="text-yellow-400">{securityDeposit} ETH</span>
              </div>
              <div className="flex justify-between font-medium border-t border-gray-600 pt-2">
                <span className="text-white">Total Required:</span>
                <span className="text-green-400">
                  {totalRequired.toFixed(6)} ETH
                </span>
              </div>
            </div>
            <p className="text-xs text-yellow-300 mt-3 flex items-start space-x-2">
              <span>🔒</span>
              <span>
                Security deposit will be refunded if not selected, or returned
                when job completes.
              </span>
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !formData.bidAmount}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Applying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Apply ({totalRequired.toFixed(3)} ETH)</span>
                </div>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default JobApplicationForm;

// pages/Jobs.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import JobCard from "../components/JobCard";
import JobModal from "../components/JobModal";
import LoadingSpinner from "../components/LoadingSpinner";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get the functions and constants from Web3Context
  const { getAllJobs, JOB_CATEGORIES, isConnected } = useWeb3();

  useEffect(() => {
    loadJobs();
  }, [getAllJobs, isConnected]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading jobs...");

      const allJobs = await getAllJobs();
      console.log("📋 All jobs received:", allJobs.length);

      // Filter for posted jobs (status 0 = "Posted")
      const postedJobs = allJobs.filter((job) => {
        return job.status === "0" || job.status === 0;
      });

      console.log("📋 Posted jobs:", postedJobs.length);
      setJobs(postedJobs);
    } catch (error) {
      console.error("❌ Error loading jobs:", error);
      // Could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    try {
      setRefreshing(true);
      await loadJobs();
    } catch (error) {
      console.error("❌ Error refreshing jobs:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs]; // Create a copy to avoid mutations

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((job) => {
        const titleMatch = job.title?.toLowerCase().includes(term);
        const descriptionMatch = job.description?.toLowerCase().includes(term);
        const skillsMatch =
          job.skills && Array.isArray(job.skills)
            ? job.skills.some((skill) => skill.toLowerCase().includes(term))
            : false;

        return titleMatch || descriptionMatch || skillsMatch;
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    setFilteredJobs(filtered);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const handleJobApplied = () => {
    setShowModal(false);
    refreshJobs(); // Refresh jobs after applying
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner text="Loading jobs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 font-display"
          >
            Find Your Next{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Opportunity
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Discover amazing projects from clients worldwide. Start building
            your reputation today.
          </motion.p>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pl-12"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select pl-12 pr-8 min-w-[200px]"
              >
                <option value="" className="bg-gray-800">
                  All Categories
                </option>
                {JOB_CATEGORIES &&
                  Object.entries(JOB_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key} className="bg-gray-800">
                      {value}
                    </option>
                  ))}
              </select>
            </div>

            {/* Refresh Button */}
            <motion.button
              onClick={refreshJobs}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm text-white">Refresh</span>
            </motion.button>
          </div>

          {/* Results Count and Filters */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {filteredJobs.length === 0
                ? "No jobs found"
                : `Showing ${filteredJobs.length} job${
                    filteredJobs.length !== 1 ? "s" : ""
                  }`}
              {jobs.length !== filteredJobs.length && (
                <span className="text-gray-500"> of {jobs.length} total</span>
              )}
            </div>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Connection Warning */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-200">
                Connect your wallet to apply for jobs and access all features.
              </p>
            </div>
          </motion.div>
        )}

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id || `job-${index}`}
                  job={job}
                  index={index}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">
              {searchTerm || selectedCategory ? "🔍" : "💼"}
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm || selectedCategory
                ? "No Jobs Found"
                : "No Jobs Available"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory
                ? "Try adjusting your search filters or check back later for new opportunities."
                : "Be the first to post a job on the platform!"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm || selectedCategory ? (
                <button onClick={clearFilters} className="btn-secondary">
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => (window.location.href = "/post-job")}
                  className="btn-primary"
                >
                  Post the First Job
                </button>
              )}

              <button
                onClick={refreshJobs}
                disabled={refreshing}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh Jobs</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Job Modal */}
      <JobModal
        job={selectedJob}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApply={handleJobApplied}
      />
    </div>
  );
};

export default Jobs;

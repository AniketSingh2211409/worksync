import { useState, useEffect, useCallback, useMemo } from "react";
import Web3 from "web3";
import { toast } from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants";

export const useContract = (web3Instance, account) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      if (!web3Instance || !CONTRACT_ADDRESS) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const contractInstance = new web3Instance.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error("Error initializing contract:", err);
        setError("Failed to initialize contract");
        toast.error("Failed to initialize smart contract");
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [web3Instance]);

  // Contract method wrapper with error handling
  const callMethod = useCallback(
    async (method, params = [], options = {}) => {
      if (!contract || !account) {
        throw new Error("Contract or account not available");
      }

      try {
        if (options.value) {
          options.value = web3Instance.utils.toWei(
            options.value.toString(),
            "ether"
          );
        }

        const result = await contract.methods[method](...params).call({
          from: account,
          ...options,
        });
        return result;
      } catch (error) {
        console.error(`Error calling method ${method}:`, error);
        throw error;
      }
    },
    [contract, account, web3Instance]
  );

  // Send transaction wrapper with error handling
  const sendTransaction = useCallback(
    async (method, params = [], options = {}) => {
      if (!contract || !account) {
        throw new Error("Contract or account not available");
      }

      try {
        if (options.value) {
          options.value = web3Instance.utils.toWei(
            options.value.toString(),
            "ether"
          );
        }

        const gasEstimate = await contract.methods[method](
          ...params
        ).estimateGas({
          from: account,
          ...options,
        });

        const result = await contract.methods[method](...params).send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2), // Add 20% buffer
          ...options,
        });

        return result;
      } catch (error) {
        console.error(`Error sending transaction ${method}:`, error);
        throw error;
      }
    },
    [contract, account, web3Instance]
  );

  // Contract helper methods
  const contractMethods = useMemo(() => {
    if (!contract) return {};

    return {
      // User methods
      registerUser: async (name, email, bio, skills, avatar, userType) => {
        return sendTransaction("registerUser", [
          name,
          email,
          bio,
          skills,
          avatar,
          userType,
        ]);
      },

      getUser: async (address) => {
        return callMethod("users", [address]);
      },

      getUserRating: async (address) => {
        return callMethod("getUserRating", [address]);
      },

      // Job methods
      postJob: async (
        title,
        description,
        skills,
        deadline,
        category,
        budget
      ) => {
        return sendTransaction(
          "postJob",
          [title, description, skills, deadline, category],
          { value: budget }
        );
      },

      getAllJobs: async () => {
        return callMethod("getAllJobs");
      },

      getUserJobs: async (address) => {
        return callMethod("getUserJobs", [address]);
      },

      getFreelancerJobs: async (address) => {
        return callMethod("getFreelancerJobs", [address]);
      },

      getJob: async (jobId) => {
        return callMethod("jobs", [jobId]);
      },

      getJobsByCategory: async (category) => {
        return callMethod("getJobsByCategory", [category]);
      },

      getJobsByStatus: async (status) => {
        return callMethod("getJobsByStatus", [status]);
      },

      // Application methods
      applyForJob: async (jobId, proposal, bidAmount, deliveryTime) => {
        return sendTransaction("applyForJob", [
          jobId,
          proposal,
          bidAmount,
          deliveryTime,
        ]);
      },

      getJobApplications: async (jobId) => {
        return callMethod("getJobApplications", [jobId]);
      },

      selectFreelancer: async (jobId, freelancerAddress) => {
        return sendTransaction("selectFreelancer", [jobId, freelancerAddress]);
      },

      // Work delivery methods
      submitWork: async (jobId, encryptedWork) => {
        return sendTransaction("submitWork", [jobId, encryptedWork]);
      },

      shareDecryptionKey: async (jobId, decryptionKey) => {
        return sendTransaction("shareDecryptionKey", [jobId, decryptionKey]);
      },

      completeJob: async (jobId) => {
        return sendTransaction("completeJob", [jobId]);
      },

      cancelJob: async (jobId) => {
        return sendTransaction("cancelJob", [jobId]);
      },

      // Review methods
      submitReview: async (jobId, reviewee, rating, comment) => {
        return sendTransaction("submitReview", [
          jobId,
          reviewee,
          rating,
          comment,
        ]);
      },

      getJobReviews: async (jobId) => {
        return callMethod("getJobReviews", [jobId]);
      },

      // Platform methods
      getPlatformFee: async () => {
        return callMethod("platformFee");
      },

      getTotalJobs: async () => {
        return callMethod("getTotalJobs");
      },

      getTotalUsers: async () => {
        return callMethod("getTotalUsers");
      },
    };
  }, [contract, callMethod, sendTransaction]);

  // Event listeners
  const subscribeToEvents = useCallback(
    (eventName, callback, filter = {}) => {
      if (!contract) return null;

      const subscription = contract.events[eventName](
        {
          filter,
          fromBlock: "latest",
        },
        callback
      );

      return subscription;
    },
    [contract]
  );

  // Get past events
  const getPastEvents = useCallback(
    async (eventName, options = {}) => {
      if (!contract) return [];

      try {
        const events = await contract.getPastEvents(eventName, {
          fromBlock: 0,
          toBlock: "latest",
          ...options,
        });
        return events;
      } catch (error) {
        console.error(`Error getting past events for ${eventName}:`, error);
        return [];
      }
    },
    [contract]
  );

  // Listen to specific events with toast notifications
  useEffect(() => {
    if (!contract || !account) return;

    const subscriptions = [];

    // Job events
    const jobPostedSub = subscribeToEvents("JobPosted", (error, event) => {
      if (error) return;
      if (event.returnValues.client.toLowerCase() === account.toLowerCase()) {
        toast.success("Job posted successfully!");
      }
    });

    const jobAppliedSub = subscribeToEvents("JobApplied", (error, event) => {
      if (error) return;
      // Notify job owner of new application
      // Note: You'd need to check if the current user is the job owner
    });

    const freelancerSelectedSub = subscribeToEvents(
      "FreelancerSelected",
      (error, event) => {
        if (error) return;
        if (
          event.returnValues.freelancer.toLowerCase() === account.toLowerCase()
        ) {
          toast.success("Congratulations! You were selected for this job!");
        }
      }
    );

    const workSubmittedSub = subscribeToEvents(
      "WorkSubmitted",
      (error, event) => {
        if (error) return;
        // Notify client that work has been submitted
      }
    );

    const jobCompletedSub = subscribeToEvents(
      "JobCompleted",
      (error, event) => {
        if (error) return;
        if (
          event.returnValues.freelancer.toLowerCase() === account.toLowerCase()
        ) {
          toast.success("Payment received! Job completed successfully!");
        }
      }
    );

    const paymentReleasedSub = subscribeToEvents(
      "PaymentReleased",
      (error, event) => {
        if (error) return;
        if (
          event.returnValues.freelancer.toLowerCase() === account.toLowerCase()
        ) {
          const amount = Web3.utils.fromWei(event.returnValues.amount, "ether");
          toast.success(`Payment of ${amount} ETH received!`);
        }
      }
    );

    subscriptions.push(
      jobPostedSub,
      jobAppliedSub,
      freelancerSelectedSub,
      workSubmittedSub,
      jobCompletedSub,
      paymentReleasedSub
    );

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach((sub) => {
        if (sub && typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        }
      });
    };
  }, [contract, account, subscribeToEvents]);

  return {
    contract,
    loading,
    error,
    callMethod,
    sendTransaction,
    subscribeToEvents,
    getPastEvents,
    ...contractMethods,
  };
};

export default useContract;

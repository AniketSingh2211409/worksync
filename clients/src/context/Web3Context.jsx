import React, { createContext, useContext, useState, useEffect } from "react";
import Web3 from "web3";
import { toast } from "react-hot-toast";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkId, setNetworkId] = useState(null);

  // Updated CONTRACT_ABI to match your actual smart contract
  const CONTRACT_ABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_jobId", type: "uint256" },
        { internalType: "string", name: "_proposal", type: "string" },
        { internalType: "uint256", name: "_bidAmount", type: "uint256" },
        { internalType: "uint256", name: "_deliveryTime", type: "uint256" },
      ],
      name: "applyForJob",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
      name: "cancelJob",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
      name: "completeJob",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "_user", type: "address" }],
      name: "getUser",
      outputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "email", type: "string" },
        { internalType: "string", name: "bio", type: "string" },
        { internalType: "string", name: "skills", type: "string" },
        { internalType: "string", name: "avatar", type: "string" },
        { internalType: "uint8", name: "userType", type: "uint8" },
        { internalType: "bool", name: "isRegistered", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "_user", type: "address" }],
      name: "isUserRegistered",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllJobs",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "address", name: "client", type: "address" },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "string[]", name: "skills", type: "string[]" },
            { internalType: "uint256", name: "budget", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            {
              internalType: "address",
              name: "assignedFreelancer",
              type: "address",
            },
            { internalType: "bool", name: "isCompleted", type: "bool" },
            { internalType: "bool", name: "isPaid", type: "bool" },
            { internalType: "string", name: "encryptedWork", type: "string" },
            { internalType: "string", name: "decryptionKey", type: "string" },
            { internalType: "uint256", name: "createdAt", type: "uint256" },
            { internalType: "uint256", name: "completedAt", type: "uint256" },
            { internalType: "uint8", name: "status", type: "uint8" },
            { internalType: "uint8", name: "category", type: "uint8" },
            { internalType: "uint256", name: "clientDeposit", type: "uint256" },
            {
              internalType: "uint256",
              name: "totalSecurityDeposits",
              type: "uint256",
            },
          ],
          internalType: "struct FreelancingPlatform.Job[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
      name: "getJobApplications",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "uint256", name: "jobId", type: "uint256" },
            { internalType: "address", name: "freelancer", type: "address" },
            { internalType: "string", name: "proposal", type: "string" },
            { internalType: "uint256", name: "bidAmount", type: "uint256" },
            { internalType: "uint256", name: "deliveryTime", type: "uint256" },
            { internalType: "uint256", name: "appliedAt", type: "uint256" },
            { internalType: "bool", name: "isSelected", type: "bool" },
            { internalType: "uint8", name: "status", type: "uint8" },
            {
              internalType: "uint256",
              name: "securityDeposit",
              type: "uint256",
            },
          ],
          internalType: "struct FreelancingPlatform.Application[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "_title", type: "string" },
        { internalType: "string", name: "_description", type: "string" },
        { internalType: "string[]", name: "_skills", type: "string[]" },
        { internalType: "uint256", name: "_budget", type: "uint256" },
        { internalType: "uint256", name: "_deadline", type: "uint256" },
        { internalType: "uint8", name: "_category", type: "uint8" },
      ],
      name: "postJob",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "_name", type: "string" },
        { internalType: "string", name: "_email", type: "string" },
        { internalType: "string", name: "_bio", type: "string" },
        { internalType: "string", name: "_skills", type: "string" },
        { internalType: "string", name: "_avatar", type: "string" },
        { internalType: "uint8", name: "_userType", type: "uint8" },
      ],
      name: "registerUser",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_jobId", type: "uint256" },
        { internalType: "address", name: "_freelancer", type: "address" },
      ],
      name: "selectFreelancer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_jobId", type: "uint256" },
        { internalType: "string", name: "_encryptedWork", type: "string" },
      ],
      name: "submitWork",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "_jobId", type: "uint256" },
        { internalType: "address", name: "_reviewee", type: "address" },
        { internalType: "uint8", name: "_rating", type: "uint8" },
        { internalType: "string", name: "_comment", type: "string" },
      ],
      name: "submitReview",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      name: "getRequiredSecurityDeposit",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getUserTotalDeposits",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_jobId", type: "uint256" }],
      name: "getJobDepositInfo",
      outputs: [
        { internalType: "uint256", name: "clientDeposit", type: "uint256" },
        {
          internalType: "uint256",
          name: "totalFreelancerDeposits",
          type: "uint256",
        },
        { internalType: "uint256", name: "budget", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "_user", type: "address" }],
      name: "getUserJobs",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "address", name: "client", type: "address" },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "string[]", name: "skills", type: "string[]" },
            { internalType: "uint256", name: "budget", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            {
              internalType: "address",
              name: "assignedFreelancer",
              type: "address",
            },
            { internalType: "bool", name: "isCompleted", type: "bool" },
            { internalType: "bool", name: "isPaid", type: "bool" },
            { internalType: "string", name: "encryptedWork", type: "string" },
            { internalType: "string", name: "decryptionKey", type: "string" },
            { internalType: "uint256", name: "createdAt", type: "uint256" },
            { internalType: "uint256", name: "completedAt", type: "uint256" },
            { internalType: "uint8", name: "status", type: "uint8" },
            { internalType: "uint8", name: "category", type: "uint8" },
            { internalType: "uint256", name: "clientDeposit", type: "uint256" },
            {
              internalType: "uint256",
              name: "totalSecurityDeposits",
              type: "uint256",
            },
          ],
          internalType: "struct FreelancingPlatform.Job[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_freelancer", type: "address" },
      ],
      name: "getFreelancerJobs",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "address", name: "client", type: "address" },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "string[]", name: "skills", type: "string[]" },
            { internalType: "uint256", name: "budget", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            {
              internalType: "address",
              name: "assignedFreelancer",
              type: "address",
            },
            { internalType: "bool", name: "isCompleted", type: "bool" },
            { internalType: "bool", name: "isPaid", type: "bool" },
            { internalType: "string", name: "encryptedWork", type: "string" },
            { internalType: "string", name: "decryptionKey", type: "string" },
            { internalType: "uint256", name: "createdAt", type: "uint256" },
            { internalType: "uint256", name: "completedAt", type: "uint256" },
            { internalType: "uint8", name: "status", type: "uint8" },
            { internalType: "uint8", name: "category", type: "uint8" },
            { internalType: "uint256", name: "clientDeposit", type: "uint256" },
            {
              internalType: "uint256",
              name: "totalSecurityDeposits",
              type: "uint256",
            },
          ],
          internalType: "struct FreelancingPlatform.Job[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "securityDepositPercentage",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "platformFee",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    // ADD this to CONTRACT_ABI array around line 150:
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "users",
      outputs: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "userAddress", type: "address" },
        { internalType: "string", name: "name", type: "string" },
        { internalType: "uint256", name: "reputation", type: "uint256" },
        { internalType: "uint256", name: "totalJobs", type: "uint256" },
        { internalType: "uint256", name: "totalEarned", type: "uint256" },
        { internalType: "uint256", name: "totalSpent", type: "uint256" },
        { internalType: "bool", name: "isRegistered", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const CONTRACT_ADDRESS = "0xC9094b0971298294CFa00257983cEf4d8370eA6f";

  const SUPPORTED_NETWORKS = {
    11155111: {
      name: "Sepolia Testnet",
      currency: "ETH",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      explorerUrl: "https://sepolia.etherscan.io",
    },
    1: {
      name: "Ethereum Mainnet",
      currency: "ETH",
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      explorerUrl: "https://etherscan.io",
    },
  };

  // Contract constants for frontend use
  const JOB_STATUSES = {
    0: "Posted",
    1: "InProgress",
    2: "Submitted",
    3: "Completed",
    4: "Cancelled",
    5: "Disputed",
  };

  const JOB_CATEGORIES = {
    0: "Development",
    1: "Design",
    2: "Writing",
    3: "Marketing",
    4: "DataScience",
    5: "Other",
  };

  const USER_TYPES = {
    0: "Client",
    1: "Freelancer",
    2: "Both",
  };

  useEffect(() => {
    initWeb3();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const chainId = await web3Instance.eth.getChainId();
        setNetworkId(Number(chainId));

        console.log("🔗 Connected Chain ID:", chainId);
        console.log("📍 Expected Contract Address:", CONTRACT_ADDRESS);
        console.log("✅ Network Supported:", !!SUPPORTED_NETWORKS[chainId]);

        if (!SUPPORTED_NETWORKS[chainId]) {
          toast.error("Unsupported network. Please switch to Sepolia.");
          return;
        }

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await loadContract(web3Instance, accounts[0]);
        }
      } catch (error) {
        console.error("Web3 initialization error:", error);
        toast.error("Failed to initialize Web3");
      }
    } else {
      toast.error("Please install MetaMask");
    }
    setLoading(false);
  };

  // Add this helper function after your constants
  const calculateGasLimit = (gasEstimate) => {
    try {
      // Handle BigInt
      if (typeof gasEstimate === "bigint") {
        return Number((gasEstimate * 120n) / 100n); // 20% buffer
      }
      // Handle Web3 BN (Big Number)
      else if (web3?.utils?.isBN && web3.utils.isBN(gasEstimate)) {
        return gasEstimate.muln(120).divn(100).toNumber();
      }
      // Handle regular numbers
      else {
        return Math.floor(Number(gasEstimate) * 1.2);
      }
    } catch (error) {
      console.warn("Gas calculation fallback:", error);
      // Fallback to a reasonable default
      return Math.floor(Number(gasEstimate || 500000) * 1.2);
    }
  };

  const loadContract = async (web3Instance, account) => {
    try {
      if (!CONTRACT_ADDRESS) {
        console.error("Contract address is empty!");
        throw new Error("Contract address not configured");
      }

      const contractInstance = new web3Instance.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );
      setContract(contractInstance);
      console.log("✅ Contract loaded at:", CONTRACT_ADDRESS);

      await loadUserData(contractInstance, account);
    } catch (error) {
      console.error("❌ Contract loading error:", error);
      toast.error("Failed to load contract");
    }
  };

  // Add this helper function before the loadUserData function
  const parseUserData = (userData, account) => {
    console.log("🔍 Parsing user data:", userData);

    try {
      // Handle array format
      if (Array.isArray(userData)) {
        const [name, email, bio, skills, avatar, userType, isRegistered] =
          userData;
        return {
          name: name || "",
          email: email || "",
          bio: bio || "",
          skills: skills || "",
          avatar: avatar || "",
          userType: (userType || "0").toString(),
          isRegistered: isRegistered || false,
          address: account,
        };
      }

      // Handle object format (most common with Web3.js)
      if (typeof userData === "object" && userData !== null) {
        return {
          name: userData.name || userData["0"] || "",
          email: userData.email || userData["1"] || "",
          bio: userData.bio || userData["2"] || "",
          skills: userData.skills || userData["3"] || "",
          avatar: userData.avatar || userData["4"] || "",
          userType: (userData.userType || userData["5"] || "0").toString(),
          isRegistered:
            userData.isRegistered !== undefined
              ? userData.isRegistered
              : userData["6"] || false,
          address: account,
        };
      }

      throw new Error("Invalid userData format");
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
      return {
        name: "",
        email: "",
        bio: "",
        skills: "",
        avatar: "",
        userType: "0",
        isRegistered: false,
        address: account,
      };
    }
  };

  // Updated loadUserData function
  const loadUserData = async (contractInstance, account) => {
    console.log(`🔍 Loading user data for account: ${account}`);

    try {
      if (!contractInstance || !account) {
        console.log("❌ No contract instance or account provided");
        setUser({ isRegistered: false, address: account });
        return;
      }

      try {
        // First, try to check if user is registered using isUserRegistered
        console.log("📞 Checking if user is registered...");
        const isRegistered = await contractInstance.methods
          .isUserRegistered(account)
          .call();
        console.log("📋 User registration status:", isRegistered);

        if (isRegistered) {
          // If user is registered, get full user data
          console.log("📞 Calling getUser method...");
          const userData = await contractInstance.methods
            .getUser(account)
            .call();
          console.log("📋 Raw user data:", userData);
          console.log("📋 User data type:", typeof userData);
          console.log("📋 Is array:", Array.isArray(userData));

          // Parse user data using helper function
          const userInfo = parseUserData(userData, account);

          console.log("✅ Parsed user info:", userInfo);
          setUser(userInfo);
        } else {
          console.log("ℹ️ User is not registered");
          setUser({ isRegistered: false, address: account });
        }
      } catch (contractError) {
        console.log("⚠️ Contract call failed:", contractError.message);
        // If contract call fails, assume user is not registered
        setUser({ isRegistered: false, address: account });
      }
    } catch (error) {
      console.error("❌ Critical error in loadUserData:", error);
      setUser({ isRegistered: false, address: account });
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setUser(null);
      setContract(null);
    } else {
      setAccount(accounts[0]);
      if (web3) {
        loadContract(web3, accounts[0]);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    const newChainId = parseInt(chainId, 16);
    setNetworkId(newChainId);

    if (!SUPPORTED_NETWORKS[newChainId]) {
      toast.error("Unsupported network. Please switch to Sepolia.");
    }

    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadContract(web3, accounts[0]);
        toast.success("Wallet connected successfully");
      }
    } catch (error) {
      console.error("❌ Wallet connection error:", error);
      if (error.code === 4001) {
        toast.error("Please connect to MetaMask");
      } else {
        toast.error("Failed to connect wallet");
      }
    }
  };

  const checkUserExists = async (address = account) => {
    if (!contract || !address) return false;

    try {
      const isRegistered = await contract.methods
        .isUserRegistered(address)
        .call();
      return isRegistered;
    } catch (error) {
      console.error("Error checking user registration:", error);
      return false;
    }
  };

  const getSecurityDepositPercentage = async () => {
    try {
      if (!contract) return 5; // Default 5%
      const percentage = await contract.methods
        .securityDepositPercentage()
        .call();
      return Number(percentage) / 100; // Convert basis points to percentage
    } catch (error) {
      console.error("❌ Get security deposit percentage error:", error);
      return 5; // Default 5%
    }
  };

  const getRequiredSecurityDeposit = async (bidAmountEth) => {
    try {
      if (!contract) return "0";
      const bidAmountWei = web3.utils.toWei(bidAmountEth.toString(), "ether");
      const depositWei = await contract.methods
        .getRequiredSecurityDeposit(bidAmountWei)
        .call();
      return web3.utils.fromWei(depositWei, "ether");
    } catch (error) {
      console.error("❌ Get required security deposit error:", error);
      const percentage = await getSecurityDepositPercentage();
      return ((parseFloat(bidAmountEth) * percentage) / 100).toString();
    }
  };

  const getUserTotalDeposits = async (userAddress = account) => {
    try {
      if (!contract || !userAddress) return "0";
      const depositsWei = await contract.methods
        .getUserTotalDeposits(userAddress)
        .call();
      return web3.utils.fromWei(depositsWei, "ether");
    } catch (error) {
      console.error("❌ Get user total deposits error:", error);
      return "0";
    }
  };

  const getAllJobs = async () => {
    try {
      if (!contract) {
        console.log("❌ No contract available");
        return [];
      }

      console.log("📞 Fetching all jobs...");
      const jobs = await contract.methods.getAllJobs().call();
      console.log("📋 Raw jobs data:", jobs);

      if (!jobs || jobs.length === 0) {
        console.log("ℹ️ No jobs found");
        return [];
      }

      return jobs.map((job) => {
        try {
          return {
            id: job.id.toString(),
            client: job.client,
            title: job.title,
            description: job.description,
            skills: Array.isArray(job.skills) ? job.skills : [],
            budget: web3.utils.fromWei(job.budget.toString(), "ether"),
            deadline: new Date(Number(job.deadline) * 1000), // Convert BigInt to Number
            assignedFreelancer: job.assignedFreelancer,
            isCompleted: job.isCompleted,
            isPaid: job.isPaid,
            encryptedWork: job.encryptedWork || "",
            decryptionKey: job.decryptionKey || "",
            createdAt: new Date(Number(job.createdAt) * 1000), // Convert BigInt to Number
            completedAt:
              Number(job.completedAt) > 0
                ? new Date(Number(job.completedAt) * 1000)
                : null,
            status: job.status.toString(),
            category: job.category.toString(),
            // Deposit information - handle BigInt properly
            clientDeposit: web3.utils.fromWei(
              job.clientDeposit.toString(),
              "ether"
            ),
            totalFreelancerDeposits: web3.utils.fromWei(
              job.totalSecurityDeposits.toString(),
              "ether"
            ),
            // Additional computed fields for frontend use
            statusText: JOB_STATUSES[job.status.toString()] || "Unknown",
            categoryText: JOB_CATEGORIES[job.category.toString()] || "Other",
            isExpired: new Date() > new Date(Number(job.deadline) * 1000),
            hasAssignedFreelancer:
              job.assignedFreelancer !==
              "0x0000000000000000000000000000000000000000",
          };
        } catch (jobError) {
          console.error(
            "❌ Error processing job:",
            job.id?.toString(),
            jobError
          );
          // Return a fallback job object to prevent breaking the entire list
          return {
            id: job.id?.toString() || "unknown",
            client: job.client || "",
            title: job.title || "Unknown Job",
            description: job.description || "",
            skills: [],
            budget: "0",
            deadline: new Date(),
            assignedFreelancer: "",
            isCompleted: false,
            isPaid: false,
            encryptedWork: "",
            decryptionKey: "",
            createdAt: new Date(),
            completedAt: null,
            status: "0",
            category: "0",
            clientDeposit: "0",
            totalFreelancerDeposits: "0",
            statusText: "Unknown",
            categoryText: "Other",
            isExpired: false,
            hasAssignedFreelancer: false,
          };
        }
      });
    } catch (error) {
      console.error("❌ Get all jobs error:", error);

      // Provide more specific error messages
      if (error.message.includes("execution reverted")) {
        toast.error("Failed to fetch jobs from blockchain");
      } else if (error.message.includes("network")) {
        toast.error("Network error while fetching jobs");
      } else {
        toast.error("Unable to load jobs");
      }

      return [];
    }
  };

  const getJobDepositInfo = async (jobId) => {
    try {
      if (!contract)
        return {
          clientDeposit: "0",
          totalFreelancerDeposits: "0",
          budget: "0",
        };
      const info = await contract.methods.getJobDepositInfo(jobId).call();
      return {
        clientDeposit: web3.utils.fromWei(info.clientDeposit, "ether"),
        totalFreelancerDeposits: web3.utils.fromWei(
          info.totalFreelancerDeposits,
          "ether"
        ),
        budget: web3.utils.fromWei(info.budget, "ether"),
      };
    } catch (error) {
      console.error("❌ Get job deposit info error:", error);
      return { clientDeposit: "0", totalFreelancerDeposits: "0", budget: "0" };
    }
  };

  const registerUser = async (userData) => {
    if (!account) {
      throw new Error("Please connect your wallet first");
    }

    if (!contract) {
      throw new Error("Contract not available");
    }

    try {
      // Check if user is already registered
      const isAlreadyRegistered = await checkUserExists(account);

      if (isAlreadyRegistered) {
        toast.error(
          "This wallet is already registered. Please use a different wallet or go to your dashboard."
        );
        return { success: false, error: "User already registered" };
      }

      console.log("🚀 Proceeding with registration...");

      const gasEstimate = await contract.methods
        .registerUser(
          userData.name,
          userData.email,
          userData.bio,
          userData.skills,
          userData.avatar,
          parseInt(userData.userType)
        )
        .estimateGas({ from: account });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods
        .registerUser(
          userData.name,
          userData.email,
          userData.bio,
          userData.skills,
          userData.avatar,
          parseInt(userData.userType)
        )
        .send({
          from: account,
          gas: gasLimit, // ✅ Fixed
        });

      console.log(
        "✅ Registration transaction successful:",
        tx.transactionHash
      );
      await refreshUserData();
      toast.success("Registration successful! Welcome to the platform!");
      return { success: true, transaction: tx };
    } catch (error) {
      console.error("❌ Registration error:", error);

      if (error.message.includes("User already registered")) {
        toast.error("This wallet is already registered.");
        return { success: false, error: "User already registered" };
      } else if (error.code === 4001) {
        toast.error("Transaction rejected by user");
        return { success: false, error: "Transaction rejected" };
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds to complete registration");
        return { success: false, error: "Insufficient funds" };
      } else {
        toast.error("Registration failed. Please try again.");
        throw error;
      }
    }
  };

  const postJob = async (jobData) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      // Get security deposit percentage
      const depositPercentage = await getSecurityDepositPercentage();
      const budget = parseFloat(jobData.budget);
      const securityDeposit = (budget * depositPercentage) / 100;

      console.log(`💰 Job Budget: ${budget} ETH`);
      console.log(
        `🔒 Security Deposit: ${securityDeposit} ETH (${depositPercentage}%)`
      );

      const budgetWei = web3.utils.toWei(budget.toString(), "ether");
      const securityDepositWei = web3.utils.toWei(
        securityDeposit.toString(),
        "ether"
      );
      const deadlineTimestamp = Math.floor(
        new Date(jobData.deadline).getTime() / 1000
      );

      // Convert skills from comma-separated string to array
      const skillsArray = jobData.skills
        .split(",")
        .map((skill) => skill.trim());

      // Show confirmation to user about the security deposit
      const confirmMessage =
        `You are about to post a job with:\n` +
        `• Budget: ${budget} ETH\n` +
        `• Security Deposit: ${securityDeposit} ETH\n` +
        `• Total Required: ${securityDeposit} ETH\n\n` +
        `The security deposit will be refunded when the job is completed or cancelled.`;

      if (!window.confirm(confirmMessage)) {
        throw new Error("Job posting cancelled by user");
      }

      console.log("🚀 Posting job with data:", {
        title: jobData.title,
        description: jobData.description,
        skills: skillsArray,
        budget: budgetWei,
        deadline: deadlineTimestamp,
        category: parseInt(jobData.category),
        securityDeposit: securityDepositWei,
      });

      const gasEstimate = await contract.methods
        .postJob(
          jobData.title,
          jobData.description,
          skillsArray,
          budgetWei,
          deadlineTimestamp,
          parseInt(jobData.category)
        )
        .estimateGas({ from: account, value: securityDepositWei });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods
        .postJob(
          jobData.title,
          jobData.description,
          skillsArray,
          budgetWei,
          deadlineTimestamp,
          parseInt(jobData.category)
        )
        .send({
          from: account,
          value: securityDepositWei,
          gas: gasLimit, // ✅ Fixed
        });

      console.log("✅ Job posted successfully:", tx.transactionHash);
      toast.success(
        `Job posted successfully! Security deposit: ${securityDeposit} ETH`
      );
      return tx;
    } catch (error) {
      console.error("❌ Post job error:", error);
      if (error.message === "Job posting cancelled by user") {
        toast.info("Job posting cancelled");
      } else {
        toast.error("Failed to post job");
      }
      throw error;
    }
  };

  const applyForJob = async (
    jobId,
    proposal,
    bidAmount = "0",
    deliveryTime = 7
  ) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      if (!bidAmount || parseFloat(bidAmount) <= 0) {
        throw new Error("Please enter a valid bid amount");
      }

      const bidAmountWei = web3.utils.toWei(bidAmount.toString(), "ether");
      const deliveryTimeSeconds = deliveryTime * 24 * 60 * 60; // Convert days to seconds

      // Calculate required security deposit
      const securityDepositEth = await getRequiredSecurityDeposit(bidAmount);
      const securityDepositWei = web3.utils.toWei(securityDepositEth, "ether");

      console.log(`💼 Job Application Details:`);
      console.log(`• Bid Amount: ${bidAmount} ETH`);
      console.log(`• Security Deposit Required: ${securityDepositEth} ETH`);
      console.log(`• Delivery Time: ${deliveryTime} days`);

      // Show confirmation to user about the security deposit
      const confirmMessage =
        `You are about to apply for this job with:\n` +
        `• Bid Amount: ${bidAmount} ETH\n` +
        `• Security Deposit: ${securityDepositEth} ETH\n` +
        `• Total Required: ${(
          parseFloat(bidAmount) + parseFloat(securityDepositEth)
        ).toFixed(6)} ETH\n\n` +
        `The security deposit will be refunded if you're not selected, or returned when the job is completed.`;

      if (!window.confirm(confirmMessage)) {
        throw new Error("Job application cancelled by user");
      }

      console.log("🚀 Applying for job:", {
        jobId,
        proposal,
        bidAmount: bidAmountWei,
        deliveryTime: deliveryTimeSeconds,
        securityDeposit: securityDepositWei,
      });

      const gasEstimate = await contract.methods
        .applyForJob(jobId, proposal, bidAmountWei, deliveryTimeSeconds)
        .estimateGas({ from: account, value: securityDepositWei });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods
        .applyForJob(jobId, proposal, bidAmountWei, deliveryTimeSeconds)
        .send({
          from: account,
          value: securityDepositWei,
          gas: gasLimit, // ✅ Fixed
        });

      console.log("✅ Application submitted successfully:", tx.transactionHash);
      toast.success(
        `Application submitted! Security deposit: ${securityDepositEth} ETH`
      );
      return tx;
    } catch (error) {
      console.error("❌ Apply for job error:", error);
      if (error.message === "Job application cancelled by user") {
        toast.info("Job application cancelled");
      } else {
        toast.error("Failed to apply for job");
      }
      throw error;
    }
  };

  const getJobApplications = async (jobId) => {
    try {
      if (!contract) return [];

      console.log("📞 Fetching applications for job:", jobId);
      const applications = await contract.methods
        .getJobApplications(jobId)
        .call();
      console.log("📋 Raw applications data:", applications);

      return applications.map((app) => ({
        id: app.id.toString(),
        jobId: app.jobId.toString(),
        freelancer: app.freelancer,
        proposal: app.proposal,
        bidAmount: web3.utils.fromWei(app.bidAmount.toString(), "ether"), // ✅ Convert BigInt to string
        deliveryTime: Math.floor(Number(app.deliveryTime) / (24 * 60 * 60)), // ✅ Convert BigInt to Number
        appliedAt: new Date(Number(app.appliedAt) * 1000), // ✅ Convert BigInt to Number
        isSelected: app.isSelected,
        status: app.status.toString(),
        securityDeposit: web3.utils.fromWei(
          app.securityDeposit.toString(),
          "ether"
        ), // ✅ Convert BigInt to string
      }));
    } catch (error) {
      console.error("❌ Get job applications error:", error);
      return [];
    }
  };

  const selectFreelancer = async (jobId, freelancerAddress) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      console.log("🚀 Selecting freelancer:", { jobId, freelancerAddress });

      const gasEstimate = await contract.methods
        .selectFreelancer(jobId, freelancerAddress)
        .estimateGas({ from: account });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods
        .selectFreelancer(jobId, freelancerAddress)
        .send({
          from: account,
          gas: gasLimit, // ✅ Fixed
        });

      console.log("✅ Freelancer selected successfully:", tx.transactionHash);
      toast.success("Freelancer selected successfully!");
      return tx;
    } catch (error) {
      console.error("❌ Select freelancer error:", error);
      toast.error("Failed to select freelancer");
      throw error;
    }
  };

  const submitWork = async (jobId, encryptedWork) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      console.log("🚀 Submitting work for job:", jobId);

      const gasEstimate = await contract.methods
        .submitWork(jobId, encryptedWork)
        .estimateGas({ from: account });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods.submitWork(jobId, encryptedWork).send({
        from: account,
        gas: gasLimit, // ✅ Fixed
      });

      console.log("✅ Work submitted successfully:", tx.transactionHash);
      toast.success("Work submitted successfully!");
      return tx;
    } catch (error) {
      console.error("❌ Submit work error:", error);
      toast.error("Failed to submit work");
      throw error;
    }
  };

  // In your completeJob function, fix the getBalance call:
  const completeJob = async (jobId) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      console.log("🚀 Attempting to complete job:", jobId);

      // Get fresh job data
      const freshJobs = await getAllJobs();
      const job = freshJobs.find((j) => j.id === jobId.toString());

      if (!job) {
        throw new Error("Job not found");
      }

      // ✅ Fix balance check - ensure CONTRACT_ADDRESS is properly defined
      let contractBalance, balanceETH;
      try {
        contractBalance = await web3.eth.getBalance(CONTRACT_ADDRESS);
        balanceETH = parseFloat(web3.utils.fromWei(contractBalance, "ether"));
      } catch (balanceError) {
        console.error("Balance check error:", balanceError);
        // Skip balance check if it fails
        balanceETH = 999; // Assume sufficient balance
      }

      const jobBudget = parseFloat(job.budget);

      console.log("💰 Contract Balance Check:", {
        contractBalance: balanceETH + " ETH",
        jobBudget: jobBudget + " ETH",
        sufficient: balanceETH >= jobBudget,
      });

      if (balanceETH < jobBudget && balanceETH !== 999) {
        throw new Error(
          `Insufficient contract balance. Has: ${balanceETH} ETH, Needs: ${jobBudget} ETH`
        );
      }

      // Rest of your validation logic...
      if (job.client.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Only job client can complete this job");
      }

      if (job.status !== "2") {
        throw new Error(
          `Job must be 'Submitted'. Current status: ${JOB_STATUSES[job.status]}`
        );
      }

      if (job.isPaid) {
        throw new Error("Job already completed and paid");
      }

      if (!job.encryptedWork || job.encryptedWork.trim() === "") {
        throw new Error("No work has been submitted yet");
      }

      console.log("✅ All validations passed, executing transaction...");

      const tx = await contract.methods.completeJob(jobId).send({
        from: account,
        gas: 500000,
      });

      console.log("✅ Job completed successfully:", tx.transactionHash);
      toast.success("Job completed and payment released!");
      return tx;
    } catch (error) {
      console.error("❌ Complete job error:", error);

      if (error.message.includes("Insufficient contract balance")) {
        toast.error(
          "❌ Contract needs more funds! Click 'Fund Contract' first."
        );
      } else {
        toast.error("Failed to complete job: " + error.message);
      }
      throw error;
    }
  };

  // Add this to your Web3Context for testing
  const fundContract = async (amount) => {
    try {
      await web3.eth.sendTransaction({
        from: account,
        to: CONTRACT_ADDRESS,
        value: web3.utils.toWei(amount.toString(), "ether"),
        gas: 21000,
      });
      toast.success(`Contract funded with ${amount} ETH`);
    } catch (error) {
      toast.error("Failed to fund contract");
      console.error("Fund contract error:", error);
    }
  };

  const cancelJob = async (jobId) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      console.log("🚀 Cancelling job:", jobId);

      const gasEstimate = await contract.methods
        .cancelJob(jobId)
        .estimateGas({ from: account });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods.cancelJob(jobId).send({
        from: account,
        gas: gasLimit, // ✅ Fixed
      });

      console.log("✅ Job cancelled successfully:", tx.transactionHash);
      toast.success("Job cancelled and funds refunded!");
      return tx;
    } catch (error) {
      console.error("❌ Cancel job error:", error);
      toast.error("Failed to cancel job");
      throw error;
    }
  };

  const submitReview = async (jobId, revieweeAddress, rating, comment) => {
    if (!account) throw new Error("Please connect your wallet first");
    if (!contract) throw new Error("Contract not available");

    try {
      console.log("🚀 Submitting review:", {
        jobId,
        revieweeAddress,
        rating,
        comment,
      });

      const gasEstimate = await contract.methods
        .submitReview(jobId, revieweeAddress, rating, comment)
        .estimateGas({ from: account });

      const gasLimit = calculateGasLimit(gasEstimate); // ✅ Use helper function

      const tx = await contract.methods
        .submitReview(jobId, revieweeAddress, rating, comment)
        .send({
          from: account,
          gas: gasLimit, // ✅ Fixed
        });

      console.log("✅ Review submitted successfully:", tx.transactionHash);
      toast.success("Review submitted successfully!");
      return tx;
    } catch (error) {
      console.error("❌ Submit review error:", error);
      toast.error("Failed to submit review");
      throw error;
    }
  };

  const getUserJobs = async (userAddress = account) => {
    try {
      if (!contract || !userAddress) return [];

      console.log("📞 Fetching user jobs for:", userAddress);
      const jobs = await contract.methods.getUserJobs(userAddress).call();

      return jobs.map((job) => ({
        id: job.id.toString(),
        client: job.client,
        title: job.title,
        description: job.description,
        skills: Array.isArray(job.skills) ? job.skills : [],
        budget: web3.utils.fromWei(job.budget.toString(), "ether"), // Handle BigInt
        deadline: new Date(Number(job.deadline) * 1000), // Handle BigInt
        assignedFreelancer: job.assignedFreelancer,
        isCompleted: job.isCompleted,
        isPaid: job.isPaid,
        encryptedWork: job.encryptedWork,
        decryptionKey: job.decryptionKey,
        createdAt: new Date(Number(job.createdAt) * 1000), // Handle BigInt
        completedAt:
          Number(job.completedAt) > 0
            ? new Date(Number(job.completedAt) * 1000)
            : null,
        status: job.status.toString(),
        category: job.category.toString(),
        clientDeposit: web3.utils.fromWei(
          job.clientDeposit.toString(),
          "ether"
        ), // Handle BigInt
        totalFreelancerDeposits: web3.utils.fromWei(
          job.totalSecurityDeposits.toString(),
          "ether"
        ), // Handle BigInt
        // Additional computed fields
        statusText: JOB_STATUSES[job.status.toString()] || "Unknown",
        categoryText: JOB_CATEGORIES[job.category.toString()] || "Other",
        isExpired: new Date() > new Date(Number(job.deadline) * 1000),
        hasAssignedFreelancer:
          job.assignedFreelancer !==
          "0x0000000000000000000000000000000000000000",
      }));
    } catch (error) {
      console.error("❌ Get user jobs error:", error);
      return [];
    }
  };

  const getFreelancerJobs = async (freelancerAddress = account) => {
    try {
      if (!contract || !freelancerAddress) return [];

      console.log("📞 Fetching freelancer jobs for:", freelancerAddress);
      const jobs = await contract.methods
        .getFreelancerJobs(freelancerAddress)
        .call();

      return jobs.map((job) => ({
        id: job.id.toString(),
        client: job.client,
        title: job.title,
        description: job.description,
        skills: Array.isArray(job.skills) ? job.skills : [],
        budget: web3.utils.fromWei(job.budget.toString(), "ether"), // Handle BigInt
        deadline: new Date(Number(job.deadline) * 1000), // Handle BigInt
        assignedFreelancer: job.assignedFreelancer,
        isCompleted: job.isCompleted,
        isPaid: job.isPaid,
        encryptedWork: job.encryptedWork,
        decryptionKey: job.decryptionKey,
        createdAt: new Date(Number(job.createdAt) * 1000), // Handle BigInt
        completedAt:
          Number(job.completedAt) > 0
            ? new Date(Number(job.completedAt) * 1000)
            : null,
        status: job.status.toString(),
        category: job.category.toString(),
        clientDeposit: web3.utils.fromWei(
          job.clientDeposit.toString(),
          "ether"
        ), // Handle BigInt
        totalFreelancerDeposits: web3.utils.fromWei(
          job.totalSecurityDeposits.toString(),
          "ether"
        ), // Handle BigInt
        // Additional computed fields
        statusText: JOB_STATUSES[job.status.toString()] || "Unknown",
        categoryText: JOB_CATEGORIES[job.category.toString()] || "Other",
        isExpired: new Date() > new Date(Number(job.deadline) * 1000),
        hasAssignedFreelancer:
          job.assignedFreelancer !==
          "0x0000000000000000000000000000000000000000",
      }));
    } catch (error) {
      console.error("❌ Get freelancer jobs error:", error);
      return [];
    }
  };

  const refreshUserData = async () => {
    if (account && contract) {
      await loadUserData(contract, account);
    }
  };

  const switchNetwork = async (chainId) => {
    if (!SUPPORTED_NETWORKS[chainId]) {
      toast.error("Unsupported network");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error("Network switch error:", error);
        toast.error("Failed to switch network");
      }
    }
  };

  const addNetwork = async (chainId) => {
    const network = SUPPORTED_NETWORKS[chainId];
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: 18,
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorerUrl],
          },
        ],
      });
    } catch (error) {
      console.error("Add network error:", error);
      toast.error("Failed to add network");
    }
  };

  const getCurrentNetwork = () => SUPPORTED_NETWORKS[networkId];

  const getTransactionUrl = (txHash) => {
    const network = getCurrentNetwork();
    return network ? `${network.explorerUrl}/tx/${txHash}` : "";
  };
  // Temporary debugging function - add this and remove after testing
  const debugUserData = async () => {
    if (!contract || !account) return;

    try {
      const userData = await contract.methods.getUser(account).call();
      console.log("🐛 DEBUG - Full userData:", userData);
      console.log("🐛 DEBUG - userData keys:", Object.keys(userData));
      console.log("🐛 DEBUG - userData values:", Object.values(userData));
      console.log("🐛 DEBUG - typeof userData:", typeof userData);
      console.log(
        "🐛 DEBUG - Array.isArray(userData):",
        Array.isArray(userData)
      );

      // Try accessing by index
      for (let i = 0; i < 10; i++) {
        console.log(`🐛 DEBUG - userData[${i}]:`, userData[i]);
      }

      // Try accessing by property name
      const props = [
        "name",
        "email",
        "bio",
        "skills",
        "avatar",
        "userType",
        "isRegistered",
      ];
      props.forEach((prop) => {
        console.log(`🐛 DEBUG - userData.${prop}:`, userData[prop]);
      });
    } catch (error) {
      console.error("🐛 DEBUG - Error:", error);
    }
  };

  // Add this function to Web3Context:
  const getUserStats = async (userAddress = account) => {
    try {
      if (!contract || !userAddress) return null;
      const userData = await contract.methods.users(userAddress).call();
      return {
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
      };
    } catch (error) {
      console.error("Get user stats error:", error);
      return null;
    }
  };

  const value = {
    // State
    web3,
    account,
    contract,
    user,
    loading,
    networkId,

    // Wallet functions
    connectWallet,
    disconnectWallet: () => {
      setAccount(null);
      setUser(null);
      setContract(null);
      toast.success("Wallet disconnected");
    },

    // Network functions
    switchNetwork,
    addNetwork,
    getCurrentNetwork,
    getUserStats,
    getTransactionUrl,

    // User functions
    registerUser,
    checkUserExists,
    refreshUserData,
    debugUserData,

    // Job functions
    postJob,
    getAllJobs,
    getUserJobs,
    getFreelancerJobs,
    applyForJob,
    getJobApplications,
    selectFreelancer,
    submitWork,
    completeJob,
    cancelJob,
    fundContract,

    // Review functions
    submitReview,

    // Deposit functions
    getSecurityDepositPercentage,
    getRequiredSecurityDeposit,
    getUserTotalDeposits,
    getJobDepositInfo,

    // Utility
    isConnected: !!account,
    isRegistered: user?.isRegistered || false,
    supportedNetworks: SUPPORTED_NETWORKS,

    // Constants for frontend
    JOB_STATUSES,
    JOB_CATEGORIES,
    USER_TYPES,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

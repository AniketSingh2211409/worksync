// utils/constants.js
export const JOB_CATEGORIES = {
  0: "Development",
  1: "Design",
  2: "Writing",
  3: "Marketing",
  4: "DataScience",
  5: "Other",
};

export const JOB_STATUSES = {
  0: "Posted",
  1: "InProgress",
  2: "Submitted",
  3: "Completed",
  4: "Cancelled",
  5: "Disputed",
};

export const USER_TYPES = {
  0: "Client",
  1: "Freelancer",
  2: "Both",
};

export const APPLICATION_STATUSES = {
  0: "Pending",
  1: "Accepted",
  2: "Rejected",
};

// Network configurations
export const NETWORKS = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  56: "BSC Mainnet",
  97: "BSC Testnet",
};

export const SUPPORTED_NETWORKS = [1, 5, 11155111, 137, 80001, 56, 97];

// Platform settings
export const PLATFORM_FEE = 0.025; // 2.5%
export const SECURITY_DEPOSIT_PERCENTAGE = 0.05; // 5%

// Extended job categories for frontend display
export const EXTENDED_JOB_CATEGORIES = {
  0: "Web Development",
  1: "Mobile Development",
  2: "UI/UX Design",
  3: "Content Writing",
  4: "Digital Marketing",
  5: "Data Science",
  6: "Blockchain Development",
  7: "Graphic Design",
  8: "Video Editing",
  9: "Translation",
  10: "Photography",
  11: "Music & Audio",
  12: "Animation",
  13: "Game Development",
  14: "DevOps & Cloud",
  15: "AI & Machine Learning",
};

// Skill categories for filtering and suggestions
export const SKILL_CATEGORIES = {
  Programming: [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "PHP",
    "Ruby",
    "Solidity",
    "Rust",
  ],
  Design: [
    "UI/UX",
    "Graphic Design",
    "Web Design",
    "Logo Design",
    "Photoshop",
    "Figma",
    "Sketch",
    "Adobe XD",
  ],
  Marketing: [
    "SEO",
    "Social Media",
    "Content Marketing",
    "Email Marketing",
    "PPC",
    "Google Ads",
    "Facebook Ads",
  ],
  Writing: [
    "Content Writing",
    "Copywriting",
    "Technical Writing",
    "Blog Writing",
    "Creative Writing",
  ],
  Data: [
    "Data Analysis",
    "Machine Learning",
    "SQL",
    "Python",
    "R",
    "Excel",
    "Tableau",
    "Power BI",
  ],
  Other: [
    "Virtual Assistant",
    "Customer Service",
    "Project Management",
    "Translation",
    "Video Editing",
  ],
};

export const EXPERIENCE_LEVELS = {
  entry: "Entry Level",
  intermediate: "Intermediate",
  expert: "Expert",
};

export const JOB_DURATION = {
  short: "Less than 1 month",
  medium: "1-3 months",
  long: "3-6 months",
  ongoing: "More than 6 months",
};

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  1: "0x...", // Ethereum Mainnet
  5: "0x...", // Goerli
  11155111: "0xC9094b0971298294CFa00257983cEf4d8370eA6f", // Sepolia
  137: "0x...", // Polygon
  80001: "0x...", // Mumbai
  56: "0x...", // BSC Mainnet
  97: "0x...", // BSC Testnet
};

// RPC URLs for different networks
export const RPC_URLS = {
  1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
  5: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
  11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  137: "https://polygon-rpc.com/",
  80001: "https://rpc-mumbai.maticvigil.com/",
  56: "https://bsc-dataseed.binance.org/",
  97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
};

// Block explorer URLs
export const EXPLORER_URLS = {
  1: "https://etherscan.io",
  5: "https://goerli.etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  137: "https://polygonscan.com",
  80001: "https://mumbai.polygonscan.com",
  56: "https://bscscan.com",
  97: "https://testnet.bscscan.com",
};

// Gas settings
export const DEFAULT_GAS_LIMIT = 500000;
export const GAS_PRICE_MULTIPLIER = 1.2;

// Message types for notifications
export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Status colors for UI
export const STATUS_COLORS = {
  Posted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  InProgress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Submitted: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Completed: "bg-green-500/20 text-green-300 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  Disputed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export const USER_TYPE_COLORS = {
  Client: "bg-blue-500/20 text-blue-300",
  Freelancer: "bg-green-500/20 text-green-300",
  Both: "bg-purple-500/20 text-purple-300",
};

// Default values
export const DEFAULT_VALUES = {
  PAGINATION_LIMIT: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
  ],
  MIN_BID_AMOUNT: 0.001, // ETH
  MAX_BID_AMOUNT: 1000, // ETH
  MIN_DEADLINE_HOURS: 24,
  MAX_DEADLINE_DAYS: 365,
};

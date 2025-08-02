// utils/helpers.js
import Web3 from "web3";

// ETH/Wei conversion utilities
export const formatEther = (wei) => {
  if (!wei) return "0";

  // If it's already a string that looks like ETH (contains decimal), return as is
  if (
    typeof wei === "string" &&
    (wei.includes(".") || parseFloat(wei) < 1000)
  ) {
    return parseFloat(wei).toString();
  }

  // If it's a number less than 1000, assume it's already in ETH
  if (typeof wei === "number" && wei < 1000) {
    return wei.toString();
  }

  try {
    // Only use fromWei for actual Wei values (big numbers)
    return Web3.utils.fromWei(wei.toString(), "ether");
  } catch (error) {
    console.warn("formatEther conversion failed:", error);
    return wei.toString();
  }
};

export const formatWei = (ether) => {
  if (!ether) return "0";
  try {
    return Web3.utils.toWei(ether.toString(), "ether");
  } catch (error) {
    console.warn("formatWei conversion failed:", error);
    return "0";
  }
};

// Currency formatting
export const formatCurrency = (amount, currency = "ETH", decimals = 4) => {
  if (!amount) return `0 ${currency}`;

  let numericAmount;
  if (typeof amount === "string") {
    numericAmount = parseFloat(amount);
  } else {
    numericAmount = amount;
  }

  if (isNaN(numericAmount)) return `0 ${currency}`;

  return `${numericAmount.toFixed(decimals)} ${currency}`;
};

// Time formatting utilities
export const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const time =
    typeof timestamp === "string"
      ? parseInt(timestamp) * 1000
      : new Date(timestamp).getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  let date;
  if (typeof timestamp === "string" && !isNaN(timestamp)) {
    date = new Date(parseInt(timestamp) * 1000);
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return "";

  let date;
  if (typeof timestamp === "string" && !isNaN(timestamp)) {
    date = new Date(parseInt(timestamp) * 1000);
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDeadline = (timestamp) => {
  if (!timestamp) return "No deadline";

  let date;
  if (typeof timestamp === "string" && !isNaN(timestamp)) {
    date = new Date(parseInt(timestamp) * 1000);
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diff = date - now;

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
  return "Less than 1 hour left";
};

// Text formatting utilities
export const truncateAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const truncateText = (text, length = 100) => {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatName = (name) => {
  if (!name) return "Unknown";
  return name
    .split(" ")
    .map((word) => capitalizeFirst(word.toLowerCase()))
    .join(" ");
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateEthereumAddress = (address) => {
  try {
    return Web3.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

export const validateAmount = (amount, min = 0, max = Infinity) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateDeadline = (deadline) => {
  const date = new Date(deadline);
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return date > minDate;
};

// Calculation utilities
export const calculatePlatformFee = (amount, feePercentage = 0.025) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0";
  return (numAmount * feePercentage).toFixed(6);
};

export const calculateSecurityDeposit = (amount, percentage = 0.05) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0";
  return (numAmount * percentage).toFixed(6);
};

export const calculateTotal = (
  amount,
  platformFee = 0,
  securityDeposit = 0
) => {
  const numAmount = parseFloat(amount) || 0;
  const numFee = parseFloat(platformFee) || 0;
  const numDeposit = parseFloat(securityDeposit) || 0;

  return (numAmount + numFee + numDeposit).toFixed(6);
};

// UI utility functions
export const getJobStatusColor = (status) => {
  const statusColors = {
    0: "bg-blue-500/20 text-blue-300 border-blue-500/30", // Posted
    1: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", // InProgress
    2: "bg-orange-500/20 text-orange-300 border-orange-500/30", // Submitted
    3: "bg-green-500/20 text-green-300 border-green-500/30", // Completed
    4: "bg-red-500/20 text-red-300 border-red-500/30", // Cancelled
    5: "bg-purple-500/20 text-purple-300 border-purple-500/30", // Disputed
    Posted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    InProgress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    Submitted: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Completed: "bg-green-500/20 text-green-300 border-green-500/30",
    Cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    Disputed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  return (
    statusColors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  );
};

export const getUserTypeColor = (userType) => {
  const typeColors = {
    0: "bg-blue-500/20 text-blue-300", // Client
    1: "bg-green-500/20 text-green-300", // Freelancer
    2: "bg-purple-500/20 text-purple-300", // Both
    Client: "bg-blue-500/20 text-blue-300",
    Freelancer: "bg-green-500/20 text-green-300",
    Both: "bg-purple-500/20 text-purple-300",
  };

  return typeColors[userType] || "bg-gray-500/20 text-gray-300";
};

export const getNetworkColor = (networkId) => {
  const colors = {
    1: "bg-blue-500",
    5: "bg-blue-400",
    11155111: "bg-blue-400",
    137: "bg-purple-500",
    80001: "bg-purple-400",
    56: "bg-yellow-500",
    97: "bg-yellow-400",
  };
  return colors[networkId] || "bg-gray-500";
};

// Utility functions for data manipulation
export const sortByDate = (array, key = "createdAt", descending = true) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return descending ? dateB - dateA : dateA - dateB;
  });
};

export const filterByStatus = (array, status) => {
  return array.filter(
    (item) => item.status === status || item.status === status.toString()
  );
};

export const groupByCategory = (array, key = "category") => {
  return array.reduce((groups, item) => {
    const category = item[key];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing from localStorage:", error);
    return false;
  }
};

// Clipboard utilities
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error("Failed to copy text: ", fallbackErr);
      return false;
    }
  }
};

// Random ID generation
export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// URL utilities
export const buildURL = (base, params = {}) => {
  const url = new URL(base);
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
};

// Array utilities
export const removeDuplicates = (array, key = null) => {
  if (key) {
    return array.filter(
      (item, index, self) =>
        index === self.findIndex((obj) => obj[key] === item[key])
    );
  }
  return [...new Set(array)];
};

export const chunk = (array, size) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
    array.slice(i * size, i * size + size)
  );
};

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Object utilities
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error("Deep clone failed:", error);
    return obj;
  }
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

// Async utilities
export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async (fn, attempts = 3, delayMs = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await delay(delayMs);
    }
  }
};

// Error handling utilities
export const handleError = (error, context = "Unknown") => {
  console.error(`Error in ${context}:`, error);

  let message = "An unexpected error occurred";

  if (error.message) {
    if (error.message.includes("User rejected")) {
      message = "Transaction was rejected by user";
    } else if (error.message.includes("insufficient funds")) {
      message = "Insufficient funds for transaction";
    } else if (error.message.includes("execution reverted")) {
      message = "Transaction failed - please check the details and try again";
    } else {
      message = error.message;
    }
  }

  return {
    message,
    code: error.code || "UNKNOWN_ERROR",
    context,
  };
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Form validation utilities
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && isEmpty(value)) {
      errors[field] = `${field} is required`;
      return;
    }

    if (rule.min && value && value.length < rule.min) {
      errors[field] = `${field} must be at least ${rule.min} characters`;
      return;
    }

    if (rule.max && value && value.length > rule.max) {
      errors[field] = `${field} must be no more than ${rule.max} characters`;
      return;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
      return;
    }

    if (rule.custom && value) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Export default object with all utilities
export default {
  // Formatting
  formatEther,
  formatWei,
  formatCurrency,
  formatTimeAgo,
  formatDate,
  formatDateTime,
  formatDeadline,
  formatFileSize,
  formatName,

  // Text manipulation
  truncateAddress,
  truncateText,
  capitalizeFirst,

  // Validation
  validateEmail,
  validateEthereumAddress,
  validateAmount,
  validateDeadline,
  validateForm,

  // Calculations
  calculatePlatformFee,
  calculateSecurityDeposit,
  calculateTotal,

  // UI helpers
  getJobStatusColor,
  getUserTypeColor,
  getNetworkColor,

  // Data manipulation
  sortByDate,
  filterByStatus,
  groupByCategory,
  removeDuplicates,
  chunk,
  shuffle,

  // Storage
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,

  // Utilities
  copyToClipboard,
  generateRandomId,
  generateUUID,
  delay,
  retry,
  debounce,
  throttle,
  handleError,
  deepClone,
  isEmpty,
  pick,
  omit,

  // File helpers
  getFileExtension,
  isImageFile,

  // URL helpers
  buildURL,
  getQueryParams,
};

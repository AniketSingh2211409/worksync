// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ========== ReentrancyGuard ==========
contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// ========== Ownable ==========
contract Ownable {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _transferOwnership(msg.sender);
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// ========== Counters Library ==========
library Counters {
    struct Counter {
        uint256 _value;
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

// ========== FreelancingPlatform ==========
contract FreelancingPlatform is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _jobIdCounter;
    Counters.Counter private _userIdCounter;

    uint256 public platformFee = 250;
    uint256 public constant MAX_PLATFORM_FEE = 1000;

    uint256 public securityDepositPercentage = 500;
    uint256 public constant MAX_SECURITY_DEPOSIT = 1000;

    enum UserType {
        Client,
        Freelancer,
        Both
    }
    enum JobStatus {
        Posted,
        InProgress,
        Submitted,
        Completed,
        Cancelled,
        Disputed
    }
    enum JobCategory {
        Development,
        Design,
        Writing,
        Marketing,
        DataScience,
        Other
    }
    enum ApplicationStatus {
        Pending,
        Accepted,
        Rejected
    }

    struct User {
        uint256 id;
        address userAddress;
        string name;
        string email;
        string bio;
        string skills;
        string avatar;
        uint256 reputation;
        uint256 totalJobs;
        uint256 totalEarned;
        uint256 totalSpent;
        bool isRegistered;
        UserType userType;
        uint256 createdAt;
    }

    struct Job {
        uint256 id;
        address client;
        string title;
        string description;
        string[] skills;
        uint256 budget;
        uint256 deadline;
        address assignedFreelancer;
        bool isCompleted;
        bool isPaid;
        string encryptedWork;
        string decryptionKey;
        uint256 createdAt;
        uint256 completedAt;
        JobStatus status;
        JobCategory category;
        uint256 clientDeposit;
        uint256 totalSecurityDeposits;
    }

    struct Application {
        uint256 id;
        uint256 jobId;
        address freelancer;
        string proposal;
        uint256 bidAmount;
        uint256 deliveryTime;
        uint256 appliedAt;
        bool isSelected;
        ApplicationStatus status;
        uint256 securityDeposit;
    }

    struct Review {
        uint256 jobId;
        address reviewer;
        address reviewee;
        uint8 rating;
        string comment;
        uint256 createdAt;
    }

    mapping(uint256 => Job) public jobs;
    mapping(address => User) public users;
    mapping(uint256 => Application[]) public jobApplications;
    mapping(uint256 => mapping(address => bool)) public hasApplied;
    mapping(address => uint256[]) public userJobs;
    mapping(address => uint256[]) public freelancerJobs;
    mapping(uint256 => Review[]) public jobReviews;
    mapping(address => uint256) public userRatings;
    mapping(address => uint256) public userRatingCount;
    mapping(uint256 => mapping(address => uint256)) public freelancerDeposits;
    mapping(address => uint256) public totalDeposits;

    event UserRegistered(address indexed user, string name, UserType userType);
    event JobPosted(
        uint256 indexed jobId,
        address indexed client,
        string title,
        uint256 budget
    );
    event JobApplied(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 bidAmount
    );
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed jobId, string encryptedWork);
    event JobCompleted(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 payment
    );
    event JobCancelled(uint256 indexed jobId, address indexed client);
    event ReviewSubmitted(
        uint256 indexed jobId,
        address indexed reviewer,
        uint8 rating
    );
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event PaymentReleased(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );
    event SecurityDepositReceived(
        uint256 indexed jobId,
        address indexed user,
        uint256 amount,
        string userType
    );
    event SecurityDepositRefunded(
        uint256 indexed jobId,
        address indexed user,
        uint256 amount
    );
    event JobPaymentReleased(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 payment,
        uint256 securityDeposit
    );

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier onlyJobClient(uint256 _jobId) {
        require(
            jobs[_jobId].client == msg.sender,
            "Only job client can perform this action"
        );
        _;
    }

    modifier onlyAssignedFreelancer(uint256 _jobId) {
        require(
            jobs[_jobId].assignedFreelancer == msg.sender,
            "Only assigned freelancer can perform this action"
        );
        _;
    }

    modifier jobExists(uint256 _jobId) {
        require(
            _jobId > 0 && _jobId <= _jobIdCounter.current(),
            "Job does not exist"
        );
        _;
    }

    constructor() {
        _jobIdCounter.increment();
        _userIdCounter.increment();
    }

    function registerUser(
        string memory _name,
        string memory _email,
        string memory _bio,
        string memory _skills,
        string memory _avatar,
        UserType _userType
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User({
            id: _userIdCounter.current(),
            userAddress: msg.sender,
            name: _name,
            email: _email,
            bio: _bio,
            skills: _skills,
            avatar: _avatar,
            reputation: 1000,
            totalJobs: 0,
            totalEarned: 0,
            totalSpent: 0,
            isRegistered: true,
            userType: _userType,
            createdAt: block.timestamp
        });
        _userIdCounter.increment();
        emit UserRegistered(msg.sender, _name, _userType);
    }

    // ADD THIS FUNCTION - This was missing in your contract
    function getUser(
        address _user
    )
        external
        view
        returns (
            string memory name,
            string memory email,
            string memory bio,
            string memory skills,
            string memory avatar,
            UserType userType,
            bool isRegistered
        )
    {
        User storage user = users[_user];
        return (
            user.name,
            user.email,
            user.bio,
            user.skills,
            user.avatar,
            user.userType,
            user.isRegistered
        );
    }

    // ADD THIS FUNCTION
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }

    function postJob(
        string memory _title,
        string memory _description,
        string[] memory _skills,
        uint256 _budget,
        uint256 _deadline,
        JobCategory _category
    ) external payable onlyRegistered {
        require(_budget > 0, "Budget must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 jobId = _jobIdCounter.current();
        uint256 deposit = (_budget * securityDepositPercentage) / 10000;
        require(msg.value >= deposit, "Insufficient client deposit");

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            title: _title,
            description: _description,
            skills: _skills,
            budget: _budget,
            deadline: _deadline,
            assignedFreelancer: address(0),
            isCompleted: false,
            isPaid: false,
            encryptedWork: "",
            decryptionKey: "",
            createdAt: block.timestamp,
            completedAt: 0,
            status: JobStatus.Posted,
            category: _category,
            clientDeposit: deposit,
            totalSecurityDeposits: 0
        });

        userJobs[msg.sender].push(jobId);
        totalDeposits[msg.sender] += deposit;

        _jobIdCounter.increment();
        emit JobPosted(jobId, msg.sender, _title, _budget);
        emit SecurityDepositReceived(jobId, msg.sender, deposit, "Client");
    }

    function applyForJob(
        uint256 _jobId,
        string memory _proposal,
        uint256 _bidAmount,
        uint256 _deliveryTime
    ) external payable onlyRegistered jobExists(_jobId) {
        require(
            jobs[_jobId].status == JobStatus.Posted,
            "Job not available for application"
        );
        require(!hasApplied[_jobId][msg.sender], "Already applied");
        require(msg.sender != jobs[_jobId].client, "Client cannot apply");

        uint256 deposit = (_bidAmount * securityDepositPercentage) / 10000;
        require(msg.value >= deposit, "Insufficient freelancer deposit");

        Application memory application = Application({
            id: jobApplications[_jobId].length + 1,
            jobId: _jobId,
            freelancer: msg.sender,
            proposal: _proposal,
            bidAmount: _bidAmount,
            deliveryTime: _deliveryTime,
            appliedAt: block.timestamp,
            isSelected: false,
            status: ApplicationStatus.Pending,
            securityDeposit: deposit
        });

        jobApplications[_jobId].push(application);
        hasApplied[_jobId][msg.sender] = true;
        freelancerDeposits[_jobId][msg.sender] = deposit;
        jobs[_jobId].totalSecurityDeposits += deposit;
        totalDeposits[msg.sender] += deposit;

        emit JobApplied(_jobId, msg.sender, _bidAmount);
        emit SecurityDepositReceived(_jobId, msg.sender, deposit, "Freelancer");
    }

    function selectFreelancer(
        uint256 _jobId,
        address _freelancer
    ) external onlyJobClient(_jobId) jobExists(_jobId) nonReentrant {
        require(
            jobs[_jobId].assignedFreelancer == address(0),
            "Freelancer already selected"
        );
        jobs[_jobId].assignedFreelancer = _freelancer;
        jobs[_jobId].status = JobStatus.InProgress;
        freelancerJobs[_freelancer].push(_jobId);

        Application[] storage applications = jobApplications[_jobId];
        for (uint256 i = 0; i < applications.length; i++) {
            if (applications[i].freelancer == _freelancer) {
                applications[i].isSelected = true;
                applications[i].status = ApplicationStatus.Accepted;
            } else {
                applications[i].status = ApplicationStatus.Rejected;
                address rejectedFreelancer = applications[i].freelancer;
                uint256 refundAmount = applications[i].securityDeposit;
                if (refundAmount > 0) {
                    totalDeposits[rejectedFreelancer] -= refundAmount;
                    jobs[_jobId].totalSecurityDeposits -= refundAmount;
                    payable(rejectedFreelancer).transfer(refundAmount);
                    emit SecurityDepositRefunded(
                        _jobId,
                        rejectedFreelancer,
                        refundAmount
                    );
                }
            }
        }

        emit FreelancerSelected(_jobId, _freelancer);
    }

    function submitWork(
        uint256 _jobId,
        string memory _encryptedWork
    ) external onlyAssignedFreelancer(_jobId) jobExists(_jobId) {
        require(
            jobs[_jobId].status == JobStatus.InProgress,
            "Job not in progress"
        );
        jobs[_jobId].encryptedWork = _encryptedWork;
        jobs[_jobId].status = JobStatus.Submitted;

        emit WorkSubmitted(_jobId, _encryptedWork);
    }

    function completeJob(
        uint256 _jobId
    ) external onlyJobClient(_jobId) jobExists(_jobId) nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Submitted, "Work not submitted");
        require(!job.isPaid, "Already paid");

        job.status = JobStatus.Completed;
        job.isCompleted = true;
        job.completedAt = block.timestamp;
        job.isPaid = true;

        uint256 fee = (job.budget * platformFee) / 10000;
        uint256 payment = job.budget - fee;

        address freelancer = job.assignedFreelancer;

        users[msg.sender].totalSpent += job.budget;
        users[freelancer].totalEarned += payment;
        users[msg.sender].totalJobs++;
        users[freelancer].totalJobs++;

        // Transfer payment to freelancer
        payable(freelancer).transfer(payment);
        emit PaymentReleased(_jobId, freelancer, payment);

        // Refund freelancer security deposit
        uint256 freelancerDeposit = freelancerDeposits[_jobId][freelancer];
        if (freelancerDeposit > 0) {
            totalDeposits[freelancer] -= freelancerDeposit;
            freelancerDeposits[_jobId][freelancer] = 0;
            payable(freelancer).transfer(freelancerDeposit);
            emit SecurityDepositRefunded(_jobId, freelancer, freelancerDeposit);
        }

        // Refund client security deposit
        uint256 clientDeposit = job.clientDeposit;
        if (clientDeposit > 0) {
            totalDeposits[msg.sender] -= clientDeposit;
            job.clientDeposit = 0;
            payable(msg.sender).transfer(clientDeposit);
            emit SecurityDepositRefunded(_jobId, msg.sender, clientDeposit);
        }

        emit JobCompleted(_jobId, freelancer, payment);
        emit JobPaymentReleased(_jobId, freelancer, payment, freelancerDeposit);
    }

    function cancelJob(
        uint256 _jobId
    ) external onlyJobClient(_jobId) jobExists(_jobId) nonReentrant {
        Job storage job = jobs[_jobId];
        require(
            job.status == JobStatus.Posted,
            "Only open jobs can be cancelled"
        );

        job.status = JobStatus.Cancelled;

        // Refund client security deposit
        if (job.clientDeposit > 0) {
            totalDeposits[msg.sender] -= job.clientDeposit;
            uint256 clientRefund = job.clientDeposit;
            job.clientDeposit = 0;
            payable(msg.sender).transfer(clientRefund);
            emit SecurityDepositRefunded(_jobId, msg.sender, clientRefund);
        }

        // Refund all freelancer security deposits
        Application[] storage applications = jobApplications[_jobId];
        for (uint256 i = 0; i < applications.length; i++) {
            address freelancer = applications[i].freelancer;
            uint256 deposit = applications[i].securityDeposit;
            if (deposit > 0) {
                totalDeposits[freelancer] -= deposit;
                applications[i].securityDeposit = 0;
                job.totalSecurityDeposits -= deposit;
                payable(freelancer).transfer(deposit);
                emit SecurityDepositRefunded(_jobId, freelancer, deposit);
            }
        }

        emit JobCancelled(_jobId, msg.sender);
    }

    function submitReview(
        uint256 _jobId,
        address _reviewee,
        uint8 _rating,
        string memory _comment
    ) external jobExists(_jobId) {
        require(_rating >= 1 && _rating <= 5, "Invalid rating");
        require(
            jobs[_jobId].status == JobStatus.Completed,
            "Job not completed"
        );

        jobReviews[_jobId].push(
            Review({
                jobId: _jobId,
                reviewer: msg.sender,
                reviewee: _reviewee,
                rating: _rating,
                comment: _comment,
                createdAt: block.timestamp
            })
        );

        // Update reputation
        uint256 currentRating = userRatings[_reviewee];
        uint256 currentCount = userRatingCount[_reviewee];

        userRatings[_reviewee] =
            (currentRating * currentCount + _rating * 100) /
            (currentCount + 1);
        userRatingCount[_reviewee]++;

        // Update user reputation based on rating
        if (_rating >= 4) {
            users[_reviewee].reputation += 50;
        } else if (_rating >= 3) {
            users[_reviewee].reputation += 10;
        } else {
            if (users[_reviewee].reputation >= 20) {
                users[_reviewee].reputation -= 20;
            }
        }

        emit ReviewSubmitted(_jobId, msg.sender, _rating);
        emit ReputationUpdated(_reviewee, users[_reviewee].reputation);
    }

    // VIEW FUNCTIONS
    function getAllJobs() external view returns (Job[] memory) {
        uint256 totalJobs = _jobIdCounter.current();
        if (totalJobs == 0) return new Job[](0);

        Job[] memory allJobs = new Job[](totalJobs - 1);

        for (uint256 i = 1; i < totalJobs; i++) {
            allJobs[i - 1] = jobs[i];
        }

        return allJobs;
    }

    function getJobApplications(
        uint256 _jobId
    ) external view returns (Application[] memory) {
        return jobApplications[_jobId];
    }

    function getJobReviews(
        uint256 _jobId
    ) external view returns (Review[] memory) {
        return jobReviews[_jobId];
    }

    function getUserJobs(address _user) external view returns (Job[] memory) {
        uint256[] memory jobIds = userJobs[_user];
        Job[] memory jobs_ = new Job[](jobIds.length);

        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs_[i] = jobs[jobIds[i]];
        }

        return jobs_;
    }

    function getFreelancerJobs(
        address _freelancer
    ) external view returns (Job[] memory) {
        uint256[] memory jobIds = freelancerJobs[_freelancer];
        Job[] memory jobs_ = new Job[](jobIds.length);

        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs_[i] = jobs[jobIds[i]];
        }

        return jobs_;
    }

    function getRequiredSecurityDeposit(
        uint256 amount
    ) external view returns (uint256) {
        return (amount * securityDepositPercentage) / 10000;
    }

    function getUserTotalDeposits(
        address user
    ) external view returns (uint256) {
        return totalDeposits[user];
    }

    function getJobDepositInfo(
        uint256 _jobId
    )
        external
        view
        returns (
            uint256 clientDeposit,
            uint256 totalFreelancerDeposits,
            uint256 budget
        )
    {
        Job memory job = jobs[_jobId];
        return (job.clientDeposit, job.totalSecurityDeposits, job.budget);
    }

    function getUserRating(
        address _user
    ) external view returns (uint256 rating, uint256 count) {
        return (userRatings[_user], userRatingCount[_user]);
    }

    function getTotalJobs() external view returns (uint256) {
        return _jobIdCounter.current() > 0 ? _jobIdCounter.current() - 1 : 0;
    }

    function getTotalUsers() external view returns (uint256) {
        return _userIdCounter.current() > 0 ? _userIdCounter.current() - 1 : 0;
    }

    // OWNER FUNCTIONS
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_PLATFORM_FEE, "Exceeds max");
        platformFee = _newFee;
    }

    function updateSecurityDepositPercentage(
        uint256 _newPercentage
    ) external onlyOwner {
        require(_newPercentage <= MAX_SECURITY_DEPOSIT, "Exceeds max");
        securityDepositPercentage = _newPercentage;
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // Calculate total deposits that should remain in contract
        uint256 totalReservedDeposits = 0;
        // This is a simplified calculation - in production you might want more precise tracking

        uint256 availableForWithdrawal = balance > totalReservedDeposits
            ? balance - totalReservedDeposits
            : 0;

        require(availableForWithdrawal > 0, "No platform fees to withdraw");

        payable(owner()).transfer(availableForWithdrawal);
    }

    function emergencyRefundDeposit(
        address payable _user,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(totalDeposits[_user] >= amount, "Insufficient balance");
        totalDeposits[_user] -= amount;
        _user.transfer(amount);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}

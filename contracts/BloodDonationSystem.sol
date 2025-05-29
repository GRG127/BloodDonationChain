// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BloodDonationSystem is AccessControl, Pausable {
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Donor {
        address walletAddress;
        string bloodGroup;
        uint256 lastDonationTime;
        uint256 rewardPoints;
        bool isRegistered;
    }

    struct BloodRequest {
        address recipient;
        string bloodGroup;
        uint256 requestTime;
        string status; // "PENDING", "APPROVED", "FULFILLED", "REJECTED"
        address hospital;
    }

    struct Hospital {
        string name;
        string location;
        bool isVerified;
    }

    struct BloodInventory {
        string bloodGroup;
        uint256 quantity;
    }

    struct ScheduledDonation {
        uint256 timestamp;
        string hospital;
        string notes;
        bool completed;
    }

    mapping(address => Donor) public donors;
    mapping(address => Hospital) public hospitals;
    mapping(uint256 => BloodRequest) public bloodRequests;
    mapping(address => mapping(string => uint256)) public hospitalInventory;
    
    mapping(address => ScheduledDonation[]) private donorScheduledDonations;
    mapping(address => uint256) private donorScheduledDonationCount;
    
    uint256 public requestCount;
    uint256 public constant MINIMUM_DONATION_INTERVAL = 90 days;
    uint256 public constant POINTS_PER_DONATION = 10;

    event DonorRegistered(address indexed donor, string bloodGroup);
    event BloodDonated(address indexed donor, address indexed hospital, string bloodGroup);
    event BloodRequested(uint256 indexed requestId, address indexed recipient, string bloodGroup);
    event RequestStatusUpdated(uint256 indexed requestId, string status);
    event RewardPointsAdded(address indexed donor, uint256 points);
    event HospitalRegistered(address indexed hospital, string name);
    event DonationScheduled(address indexed donor, uint256 timestamp, string hospital);
    event DonationCompleted(address indexed donor, uint256 scheduledTimestamp, string bloodGroup);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyHospital() {
        require(hasRole(HOSPITAL_ROLE, msg.sender), "Caller is not a hospital");
        _;
    }

    function registerDonor(string memory _bloodGroup) external {
        require(!donors[msg.sender].isRegistered, "Donor already registered");
        donors[msg.sender] = Donor({
            walletAddress: msg.sender,
            bloodGroup: _bloodGroup,
            lastDonationTime: 0,
            rewardPoints: 0,
            isRegistered: true
        });
        emit DonorRegistered(msg.sender, _bloodGroup);
    }

    function registerHospital(address _hospital, string memory _name, string memory _location) 
        external onlyRole(ADMIN_ROLE) {
        require(!hospitals[_hospital].isVerified, "Hospital already registered");
        hospitals[_hospital] = Hospital({
            name: _name,
            location: _location,
            isVerified: true
        });
        _setupRole(HOSPITAL_ROLE, _hospital);
        emit HospitalRegistered(_hospital, _name);
    }

    function recordBloodDonation(address _donor, string memory _bloodGroup) 
        external onlyHospital whenNotPaused {
        require(donors[_donor].isRegistered, "Donor not registered");
        require(
            block.timestamp >= donors[_donor].lastDonationTime + MINIMUM_DONATION_INTERVAL,
            "Must wait between donations"
        );

        donors[_donor].lastDonationTime = block.timestamp;
        hospitalInventory[msg.sender][_bloodGroup]++;
        
        // Award points
        donors[_donor].rewardPoints += POINTS_PER_DONATION;
        
        emit BloodDonated(_donor, msg.sender, _bloodGroup);
        emit RewardPointsAdded(_donor, POINTS_PER_DONATION);
    }

    function requestBlood(string memory _bloodGroup) external whenNotPaused {
        bloodRequests[requestCount] = BloodRequest({
            recipient: msg.sender,
            bloodGroup: _bloodGroup,
            requestTime: block.timestamp,
            status: "PENDING",
            hospital: address(0)
        });
        
        emit BloodRequested(requestCount, msg.sender, _bloodGroup);
        requestCount++;
    }

    function updateRequestStatus(uint256 _requestId, string memory _status) 
        external onlyHospital whenNotPaused {
        require(_requestId < requestCount, "Invalid request ID");
        BloodRequest storage request = bloodRequests[_requestId];
        request.status = _status;
        request.hospital = msg.sender;
        
        if (keccak256(bytes(_status)) == keccak256(bytes("FULFILLED"))) {
            hospitalInventory[msg.sender][request.bloodGroup]--;
        }
        
        emit RequestStatusUpdated(_requestId, _status);
    }

    function getDonorInfo(address _donor) external view returns (
        string memory bloodGroup,
        uint256 lastDonationTime,
        uint256 rewardPoints,
        bool isRegistered
    ) {
        Donor memory donor = donors[_donor];
        return (
            donor.bloodGroup,
            donor.lastDonationTime,
            donor.rewardPoints,
            donor.isRegistered
        );
    }

    function getHospitalInventory(address _hospital, string memory _bloodGroup) 
        external view returns (uint256) {
        return hospitalInventory[_hospital][_bloodGroup];
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function scheduleDonation(string memory hospital, string memory notes) public {
        require(donors[msg.sender].isRegistered, "Not a registered donor");
        
        // Create new scheduled donation
        ScheduledDonation memory newDonation = ScheduledDonation({
            timestamp: block.timestamp,
            hospital: hospital,
            notes: notes,
            completed: false
        });
        
        // Add to donor's scheduled donations
        donorScheduledDonations[msg.sender].push(newDonation);
        donorScheduledDonationCount[msg.sender]++;
        
        emit DonationScheduled(msg.sender, block.timestamp, hospital);
    }

    function getScheduledDonations(address donor) public view returns (
        uint256[] memory timestamps,
        string[] memory hospitals,
        string[] memory notes,
        bool[] memory completed
    ) {
        uint256 count = donorScheduledDonationCount[donor];
        timestamps = new uint256[](count);
        hospitals = new string[](count);
        notes = new string[](count);
        completed = new bool[](count);
        
        for (uint256 i = 0; i < count; i++) {
            ScheduledDonation storage donation = donorScheduledDonations[donor][i];
            timestamps[i] = donation.timestamp;
            hospitals[i] = donation.hospital;
            notes[i] = donation.notes;
            completed[i] = donation.completed;
        }
    }

    function completeScheduledDonation(uint256 scheduledTimestamp) public {
        require(donors[msg.sender].isRegistered, "Not a registered donor");
        
        uint256 count = donorScheduledDonationCount[msg.sender];
        bool found = false;
        
        for (uint256 i = 0; i < count; i++) {
            ScheduledDonation storage donation = donorScheduledDonations[msg.sender][i];
            if (donation.timestamp == scheduledTimestamp && !donation.completed) {
                donation.completed = true;
                found = true;
                
                // Record the actual donation
                recordBloodDonation(msg.sender, donors[msg.sender].bloodGroup);
                
                emit DonationCompleted(msg.sender, scheduledTimestamp, donors[msg.sender].bloodGroup);
                break;
            }
        }
        
        require(found, "Scheduled donation not found or already completed");
    }

    function getBloodRequestsByRecipient(address _recipient) public view returns (BloodRequest[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < requestCount; i++) {
            if (bloodRequests[i].recipient == _recipient) {
                count++;
            }
        }

        BloodRequest[] memory result = new BloodRequest[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < requestCount; i++) {
            if (bloodRequests[i].recipient == _recipient) {
                result[index] = bloodRequests[i];
                index++;
            }
        }

        return result;
    }
} 
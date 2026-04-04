// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, ebool, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract VeilShield {
    using SafeERC20 for IERC20;

    enum TriggerDirection {
        GTE,
        LTE
    }

    enum PolicyStatus {
        Active,
        PendingDecision,
        Triggered,
        Settled,
        Expired,
        Cancelled
    }

    struct Policy {
        address insured;
        address beneficiary;
        euint64 encCoverage;
        euint64 encPremium;
        euint64 encThreshold;
        bytes32 oracleFeedId;
        TriggerDirection direction;
        uint64 expiryTimestamp;
        PolicyStatus status;
        uint256 createdAt;
        ebool pendingTrigger;
        euint64 pendingPayout;
        uint64 coverageAmount;
        uint64 premiumAmount;
    }

    struct Pool {
        euint64 encTotalDeposits;
        euint64 encTotalReserved;
        uint256 tokenLiquidity;
        uint256 tokenReserved;
        uint256 totalLpShares;
        uint256 lpCount;
        bool active;
    }

    error NotOwner();
    error NotOracle();
    error PoolInactive();
    error InvalidBeneficiary();
    error InvalidOracle();
    error InvalidAsset();
    error InvalidExpiry();
    error InvalidAmount();
    error PolicyNotFound();
    error PolicyNotActive();
    error PolicyNotPending();
    error PolicyNotTriggered();
    error NotAuthorized();
    error FeedNotInitialized();
    error InsufficientAvailableLiquidity();

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed insured,
        bytes32 indexed oracleFeedId,
        uint64 coverageAmount,
        uint64 premiumAmount
    );
    event PolicyEvaluationRequested(uint256 indexed policyId);
    event PolicyEvaluationFinalized(uint256 indexed policyId, bool triggered);
    event PolicySettled(uint256 indexed policyId, uint64 payoutAmount);
    event PolicyExpired(uint256 indexed policyId);
    event PolicyCancelled(uint256 indexed policyId);
    event OracleUpdated(bytes32 indexed feedId);
    event LiquidityDeposited(address indexed lp, uint64 amount);
    event LiquidityWithdrawn(address indexed lp, uint64 actualAmount, bool fullAmountWithdrawn);

    address public owner;
    address public oracle;
    IERC20 public immutable asset;
    uint256 public policyCount;

    mapping(uint256 => Policy) public policies;
    mapping(address => euint64) public lpBalances;
    mapping(address => bool) private lpInitialized;
    mapping(address => uint256) public lpPrincipalBalances;
    mapping(address => uint256) public lpShares;
    mapping(bytes32 => euint64) public oracleValues;
    mapping(bytes32 => bool) public oracleFeedInitialized;

    Pool public pool;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOracle() {
        if (msg.sender != oracle) revert NotOracle();
        _;
    }

    constructor(address _oracle, address _asset) {
        if (_oracle == address(0)) revert InvalidOracle();
        if (_asset == address(0)) revert InvalidAsset();

        owner = msg.sender;
        oracle = _oracle;
        asset = IERC20(_asset);

        pool.encTotalDeposits = FHE.asEuint64(0);
        FHE.allowThis(pool.encTotalDeposits);

        pool.encTotalReserved = FHE.asEuint64(0);
        FHE.allowThis(pool.encTotalReserved);

        pool.active = true;
    }

    function depositLiquidity(uint64 amount) external {
        if (!pool.active) revert PoolInactive();
        if (amount == 0) revert InvalidAmount();

        bool isNewLp = _ensureLpBalance(msg.sender);
        uint256 sharesBefore = lpShares[msg.sender];
        uint256 mintedShares = _previewMintShares(amount);
        if (mintedShares == 0) revert InvalidAmount();

        asset.safeTransferFrom(msg.sender, address(this), amount);

        euint64 encryptedAmount = FHE.asEuint64(amount);

        pool.encTotalDeposits = FHE.add(pool.encTotalDeposits, encryptedAmount);
        FHE.allowThis(pool.encTotalDeposits);

        lpBalances[msg.sender] = FHE.add(lpBalances[msg.sender], encryptedAmount);
        FHE.allowThis(lpBalances[msg.sender]);
        FHE.allow(lpBalances[msg.sender], msg.sender);

        lpPrincipalBalances[msg.sender] += amount;
        lpShares[msg.sender] += mintedShares;
        pool.tokenLiquidity += amount;
        pool.totalLpShares += mintedShares;

        if (isNewLp || sharesBefore == 0) {
            pool.lpCount++;
        }

        emit LiquidityDeposited(msg.sender, amount);
    }

    function withdrawLiquidity(uint64 amount) external {
        _ensureLpBalance(msg.sender);
        if (amount == 0) revert InvalidAmount();

        uint256 withdrawable = _previewRedeem(lpShares[msg.sender]);
        bool canWithdrawPublic = amount <= getAvailableLiquidityTokens() && amount <= withdrawable;
        uint64 actualPublicAmount = canWithdrawPublic ? amount : 0;

        ebool canWithdraw = FHE.asEbool(canWithdrawPublic);
        euint64 zero = FHE.asEuint64(0);
        uint256 principalReduction = canWithdrawPublic ? _previewPrincipalReduction(msg.sender, amount, withdrawable) : 0;
        euint64 encryptedAmount = FHE.asEuint64(uint64(principalReduction));
        euint64 actualAmount = FHE.select(canWithdraw, encryptedAmount, zero);

        pool.encTotalDeposits = FHE.sub(pool.encTotalDeposits, actualAmount);
        FHE.allowThis(pool.encTotalDeposits);

        lpBalances[msg.sender] = FHE.sub(lpBalances[msg.sender], actualAmount);
        FHE.allowThis(lpBalances[msg.sender]);
        FHE.allow(lpBalances[msg.sender], msg.sender);

        if (actualPublicAmount > 0) {
            uint256 sharesToBurn = _previewBurnShares(actualPublicAmount);
            if (sharesToBurn > lpShares[msg.sender]) {
                sharesToBurn = lpShares[msg.sender];
            }

            lpPrincipalBalances[msg.sender] -= principalReduction;
            lpShares[msg.sender] -= sharesToBurn;
            pool.totalLpShares -= sharesToBurn;
            pool.tokenLiquidity -= actualPublicAmount;
            asset.safeTransfer(msg.sender, actualPublicAmount);

            if (lpShares[msg.sender] == 0) {
                pool.lpCount--;
            }
        }

        emit LiquidityWithdrawn(msg.sender, actualPublicAmount, canWithdrawPublic);
    }

    function createPolicy(
        uint64 coverageAmount,
        uint64 premiumAmount,
        InEuint64 calldata encThreshold,
        bytes32 oracleFeedId,
        TriggerDirection direction,
        uint64 expiryTimestamp,
        address beneficiary
    ) external returns (uint256 policyId) {
        if (!pool.active) revert PoolInactive();
        if (coverageAmount == 0 || premiumAmount == 0) revert InvalidAmount();
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        if (expiryTimestamp <= block.timestamp) revert InvalidExpiry();
        if (getAvailableLiquidityTokens() < coverageAmount) revert InsufficientAvailableLiquidity();

        asset.safeTransferFrom(msg.sender, address(this), premiumAmount);

        policyId = policyCount++;

        Policy storage p = policies[policyId];
        p.insured = msg.sender;
        p.beneficiary = beneficiary;
        p.encCoverage = FHE.asEuint64(coverageAmount);
        p.encPremium = FHE.asEuint64(premiumAmount);
        p.encThreshold = FHE.asEuint64(encThreshold);
        p.oracleFeedId = oracleFeedId;
        p.direction = direction;
        p.expiryTimestamp = expiryTimestamp;
        p.status = PolicyStatus.Active;
        p.createdAt = block.timestamp;
        p.pendingTrigger = FHE.asEbool(false);
        p.pendingPayout = FHE.asEuint64(0);
        p.coverageAmount = coverageAmount;
        p.premiumAmount = premiumAmount;

        FHE.allowThis(p.encCoverage);
        FHE.allowThis(p.encPremium);
        FHE.allowThis(p.encThreshold);
        FHE.allowThis(p.pendingTrigger);
        FHE.allowThis(p.pendingPayout);

        FHE.allow(p.encCoverage, msg.sender);
        FHE.allow(p.encPremium, msg.sender);
        FHE.allow(p.encThreshold, msg.sender);
        FHE.allow(p.encCoverage, beneficiary);

        pool.encTotalReserved = FHE.add(pool.encTotalReserved, p.encCoverage);
        FHE.allowThis(pool.encTotalReserved);

        pool.tokenReserved += coverageAmount;
        pool.tokenLiquidity += premiumAmount;

        emit PolicyCreated(policyId, msg.sender, oracleFeedId, coverageAmount, premiumAmount);
    }

    function submitOracleReading(bytes32 feedId, InEuint64 calldata encValue) external onlyOracle {
        oracleValues[feedId] = FHE.asEuint64(encValue);
        oracleFeedInitialized[feedId] = true;

        FHE.allowThis(oracleValues[feedId]);
        FHE.allow(oracleValues[feedId], msg.sender);

        emit OracleUpdated(feedId);
    }

    function requestPolicyEvaluation(uint256 policyId) external {
        Policy storage p = _getExistingPolicy(policyId);
        if (p.status != PolicyStatus.Active) revert PolicyNotActive();

        if (block.timestamp > p.expiryTimestamp) {
            _expirePolicy(policyId, p);
            return;
        }

        if (!oracleFeedInitialized[p.oracleFeedId]) revert FeedNotInitialized();

        euint64 oracleValue = oracleValues[p.oracleFeedId];
        ebool triggered = p.direction == TriggerDirection.GTE
            ? FHE.gte(oracleValue, p.encThreshold)
            : FHE.lte(oracleValue, p.encThreshold);

        euint64 zero = FHE.asEuint64(0);
        p.pendingTrigger = triggered;
        p.pendingPayout = FHE.select(triggered, p.encCoverage, zero);

        FHE.allowThis(p.pendingTrigger);
        FHE.allowThis(p.pendingPayout);
        FHE.allow(p.pendingPayout, p.insured);
        FHE.allow(p.pendingPayout, p.beneficiary);

        FHE.decrypt(p.pendingTrigger);
        p.status = PolicyStatus.PendingDecision;

        emit PolicyEvaluationRequested(policyId);
    }

    function finalizePolicyEvaluation(uint256 policyId) external returns (bool ready, bool triggered) {
        Policy storage p = _getExistingPolicy(policyId);
        if (p.status != PolicyStatus.PendingDecision) revert PolicyNotPending();

        (bool result, bool decrypted) = FHE.getDecryptResultSafe(p.pendingTrigger);
        if (!decrypted) {
            return (false, false);
        }

        ready = true;
        triggered = result;
        p.status = triggered ? PolicyStatus.Triggered : PolicyStatus.Active;

        emit PolicyEvaluationFinalized(policyId, triggered);
    }

    function settleTriggeredPolicy(uint256 policyId) external {
        Policy storage p = _getExistingPolicy(policyId);
        if (p.status != PolicyStatus.Triggered) revert PolicyNotTriggered();
        if (msg.sender != p.beneficiary && msg.sender != owner) revert NotAuthorized();

        FHE.decrypt(p.pendingPayout);

        pool.encTotalReserved = FHE.sub(pool.encTotalReserved, p.encCoverage);
        FHE.allowThis(pool.encTotalReserved);

        pool.encTotalDeposits = FHE.sub(pool.encTotalDeposits, p.pendingPayout);
        FHE.allowThis(pool.encTotalDeposits);

        pool.tokenReserved -= p.coverageAmount;
        pool.tokenLiquidity -= p.coverageAmount;

        asset.safeTransfer(p.beneficiary, p.coverageAmount);

        p.status = PolicyStatus.Settled;
        emit PolicySettled(policyId, p.coverageAmount);
    }

    function cancelPolicy(uint256 policyId) external {
        Policy storage p = _getExistingPolicy(policyId);
        if (p.status != PolicyStatus.Active) revert PolicyNotActive();
        if (msg.sender != p.insured) revert NotAuthorized();

        pool.encTotalReserved = FHE.sub(pool.encTotalReserved, p.encCoverage);
        FHE.allowThis(pool.encTotalReserved);
        pool.tokenReserved -= p.coverageAmount;

        p.status = PolicyStatus.Cancelled;
        emit PolicyCancelled(policyId);
    }

    function expirePolicy(uint256 policyId) external {
        Policy storage p = _getExistingPolicy(policyId);
        if (p.status != PolicyStatus.Active) revert PolicyNotActive();
        if (block.timestamp <= p.expiryTimestamp) revert InvalidExpiry();
        _expirePolicy(policyId, p);
    }

    function getPolicyStatus(uint256 policyId) external view returns (PolicyStatus) {
        return _getExistingPolicy(policyId).status;
    }

    function getPolicyInsured(uint256 policyId) external view returns (address) {
        return _getExistingPolicy(policyId).insured;
    }

    function getPolicyBeneficiary(uint256 policyId) external view returns (address) {
        return _getExistingPolicy(policyId).beneficiary;
    }

    function getPolicyExpiry(uint256 policyId) external view returns (uint64) {
        return _getExistingPolicy(policyId).expiryTimestamp;
    }

    function getPolicyFeed(uint256 policyId) external view returns (bytes32) {
        return _getExistingPolicy(policyId).oracleFeedId;
    }

    function getPolicyTokenTerms(uint256 policyId) external view returns (uint64 coverageAmount, uint64 premiumAmount) {
        Policy storage p = _getExistingPolicy(policyId);
        return (p.coverageAmount, p.premiumAmount);
    }

    function getAvailableLiquidityTokens() public view returns (uint256) {
        return pool.tokenLiquidity - pool.tokenReserved;
    }

    function getMyPolicyTerms(uint256 policyId) external view returns (euint64, euint64, euint64) {
        Policy storage p = _getExistingPolicy(policyId);
        if (msg.sender != p.insured) revert NotAuthorized();
        return (p.encCoverage, p.encPremium, p.encThreshold);
    }

    function getMyPendingPayout(uint256 policyId) external view returns (euint64) {
        Policy storage p = _getExistingPolicy(policyId);
        if (msg.sender != p.beneficiary && msg.sender != p.insured) revert NotAuthorized();
        return p.pendingPayout;
    }

    function getMyLpBalance() external view returns (euint64) {
        _ensurePolicyIndependentReadAccess(msg.sender);
        return lpBalances[msg.sender];
    }

    function getMyLpTokenBalance() external view returns (uint256) {
        return _previewRedeem(lpShares[msg.sender]);
    }

    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert InvalidOracle();
        oracle = _oracle;
    }

    function setPoolActive(bool _active) external onlyOwner {
        pool.active = _active;
    }

    function _expirePolicy(uint256 policyId, Policy storage p) internal {
        pool.encTotalReserved = FHE.sub(pool.encTotalReserved, p.encCoverage);
        FHE.allowThis(pool.encTotalReserved);
        pool.tokenReserved -= p.coverageAmount;

        p.status = PolicyStatus.Expired;
        emit PolicyExpired(policyId);
    }

    function _getExistingPolicy(uint256 policyId) internal view returns (Policy storage p) {
        if (policyId >= policyCount) revert PolicyNotFound();
        p = policies[policyId];
    }

    function _ensureLpBalance(address lp) internal returns (bool isNewLp) {
        if (lpInitialized[lp]) {
            return false;
        }

        lpBalances[lp] = FHE.asEuint64(0);
        lpInitialized[lp] = true;

        FHE.allowThis(lpBalances[lp]);
        FHE.allow(lpBalances[lp], lp);

        return true;
    }

    function _ensurePolicyIndependentReadAccess(address lp) internal view {
        if (!lpInitialized[lp]) revert NotAuthorized();
    }

    function _previewMintShares(uint256 assets) internal view returns (uint256) {
        if (pool.totalLpShares == 0 || pool.tokenLiquidity == 0) {
            return assets;
        }

        return (assets * pool.totalLpShares) / pool.tokenLiquidity;
    }

    function _previewBurnShares(uint256 assets) internal view returns (uint256) {
        if (assets == 0 || pool.totalLpShares == 0 || pool.tokenLiquidity == 0) {
            return 0;
        }

        return ((assets * pool.totalLpShares) + pool.tokenLiquidity - 1) / pool.tokenLiquidity;
    }

    function _previewRedeem(uint256 shares) internal view returns (uint256) {
        if (shares == 0 || pool.totalLpShares == 0) {
            return 0;
        }

        return (shares * pool.tokenLiquidity) / pool.totalLpShares;
    }

    function _previewPrincipalReduction(address lp, uint256 assets, uint256 withdrawable) internal view returns (uint256) {
        uint256 principal = lpPrincipalBalances[lp];
        if (principal == 0 || assets == 0 || withdrawable == 0) {
            return 0;
        }

        if (assets >= withdrawable) {
            return principal;
        }

        uint256 principalReduction = ((assets * principal) + withdrawable - 1) / withdrawable;
        if (principalReduction > principal) {
            return principal;
        }

        return principalReduction;
    }
}

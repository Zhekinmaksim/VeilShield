import { expect } from "chai";
import hre, { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const MOCK_ZK_VERIFIER_ADDRESS = "0x0000000000000000000000000000000000001000";

async function encryptUint64(signer: HardhatEthersSigner, value: bigint) {
  const zkVerifier = await ethers.getContractAt(
    "MockZkVerifier",
    MOCK_ZK_VERIFIER_ADDRESS,
    signer
  );
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const encrypted = await zkVerifier.zkVerify.staticCall(
    value,
    5,
    signer.address,
    0,
    chainId
  );

  await (await zkVerifier.zkVerify(value, 5, signer.address, 0, chainId)).wait();

  return {
    ctHash: encrypted.ctHash,
    securityZone: encrypted.securityZone,
    utype: encrypted.utype,
    signature: encrypted.signature,
  };
}

async function approveAndEncrypt(
  signer: HardhatEthersSigner,
  token: { approve: (spender: string, amount: bigint) => Promise<unknown> },
  spender: string,
  amount: bigint
) {
  const tx = await token.approve(spender, amount);
  await (tx as { wait: () => Promise<unknown> }).wait();
  return encryptUint64(signer, amount);
}

async function deployFixture() {
  const [owner, oracle, insured, beneficiary, lp] = await ethers.getSigners();
  const token = await ethers.deployContract("VeilShieldDemoToken", [owner.address]);
  await token.waitForDeployment();

  const veilShield = await ethers.deployContract("VeilShield", [
    oracle.address,
    await token.getAddress(),
  ]);
  await veilShield.waitForDeployment();

  for (const user of [insured, beneficiary, lp]) {
    await (await token.connect(user).faucet()).wait();
  }

  return { owner, oracle, insured, beneficiary, lp, token, veilShield };
}

async function advanceDecryptWindow() {
  await ethers.provider.send("evm_increaseTime", [11]);
  await ethers.provider.send("evm_mine", []);
}

async function futureExpiry() {
  const latest = await ethers.provider.getBlock("latest");
  return BigInt((latest?.timestamp ?? Math.floor(Date.now() / 1000)) + 86_400);
}

describe("VeilShield", function () {
  it("tracks encrypted LP deposits and withdrawals with ERC-20 transfers", async function () {
    const { lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 1_000n);
    await (await veilShield.connect(lp).depositLiquidity(1_000n)).wait();

    expect(await token.balanceOf(veilShieldAddress)).to.equal(1_000n);
    expect(await veilShield.connect(lp).getMyLpTokenBalance()).to.equal(1_000n);
    expect(await veilShield.getAvailableLiquidityTokens()).to.equal(1_000n);
    await hre.cofhe.mocks.expectPlaintext(await veilShield.connect(lp).getMyLpBalance(), 1_000n);
    await hre.cofhe.mocks.expectPlaintext((await veilShield.pool()).encTotalDeposits, 1_000n);

    await (await veilShield.connect(lp).withdrawLiquidity(250n)).wait();

    expect(await token.balanceOf(veilShieldAddress)).to.equal(750n);
    expect(await veilShield.connect(lp).getMyLpTokenBalance()).to.equal(750n);
    expect(await veilShield.getAvailableLiquidityTokens()).to.equal(750n);
    await hre.cofhe.mocks.expectPlaintext(await veilShield.connect(lp).getMyLpBalance(), 750n);
    await hre.cofhe.mocks.expectPlaintext((await veilShield.pool()).encTotalDeposits, 750n);
  });

  it("creates a policy with encrypted terms and transfers the premium token", async function () {
    const { insured, beneficiary, lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 5_000n);
    await (await veilShield.connect(lp).depositLiquidity(5_000n)).wait();

    await (await token.connect(insured).approve(veilShieldAddress, 100n)).wait();

    const tx = await veilShield.connect(insured).createPolicy(
      1_000n,
      100n,
      await encryptUint64(insured, 3_000n),
      ethers.encodeBytes32String("ETH/USD"),
      0,
      await futureExpiry(),
      beneficiary.address
    );
    await tx.wait();

    expect(await veilShield.policyCount()).to.equal(1n);
    expect(await veilShield.getPolicyStatus(0)).to.equal(0n);
    expect(await token.balanceOf(veilShieldAddress)).to.equal(5_100n);

    const pool = await veilShield.pool();
    expect(pool.tokenLiquidity).to.equal(5_100n);
    expect(pool.tokenReserved).to.equal(1_000n);
    expect(await veilShield.getAvailableLiquidityTokens()).to.equal(4_100n);

    const [coverage, premium, threshold] = await veilShield.connect(insured).getMyPolicyTerms(0);
    const [coverageAmount, premiumAmount] = await veilShield.getPolicyTokenTerms(0);
    expect(coverageAmount).to.equal(1_000n);
    expect(premiumAmount).to.equal(100n);
    await hre.cofhe.mocks.expectPlaintext(coverage, 1_000n);
    await hre.cofhe.mocks.expectPlaintext(premium, 100n);
    await hre.cofhe.mocks.expectPlaintext(threshold, 3_000n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalReserved, 1_000n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalDeposits, 5_000n);
    expect(await veilShield.connect(lp).getMyLpTokenBalance()).to.equal(5_100n);
  });

  it("finalizes and settles a triggered policy with token payout", async function () {
    const { oracle, insured, beneficiary, lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 5_000n);
    await (await veilShield.connect(lp).depositLiquidity(5_000n)).wait();
    await (await token.connect(insured).approve(veilShieldAddress, 100n)).wait();

    await (
      await veilShield.connect(insured).createPolicy(
        1_000n,
        100n,
        await encryptUint64(insured, 3_000n),
        ethers.encodeBytes32String("ETH/USD"),
        0,
        await futureExpiry(),
        beneficiary.address
      )
    ).wait();

    await (
      await veilShield
        .connect(oracle)
        .submitOracleReading(
          ethers.encodeBytes32String("ETH/USD"),
          await encryptUint64(oracle, 3_500n)
        )
    ).wait();

    await (await veilShield.requestPolicyEvaluation(0)).wait();
    expect(await veilShield.getPolicyStatus(0)).to.equal(1n);

    await hre.cofhe.mocks.expectPlaintext(
      await veilShield.connect(beneficiary).getMyPendingPayout(0),
      1_000n
    );

    await advanceDecryptWindow();
    await (await veilShield.finalizePolicyEvaluation(0)).wait();
    expect(await veilShield.getPolicyStatus(0)).to.equal(2n);

    const beneficiaryBefore = await token.balanceOf(beneficiary.address);
    await (await veilShield.connect(beneficiary).settleTriggeredPolicy(0)).wait();

    const pool = await veilShield.pool();
    expect(await veilShield.getPolicyStatus(0)).to.equal(3n);
    expect(await token.balanceOf(beneficiary.address)).to.equal(beneficiaryBefore + 1_000n);
    expect(await token.balanceOf(veilShieldAddress)).to.equal(4_100n);
    expect(pool.tokenLiquidity).to.equal(4_100n);
    expect(pool.tokenReserved).to.equal(0n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalReserved, 0n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalDeposits, 4_000n);
  });

  it("returns a non-triggered policy to active state while keeping reserves locked", async function () {
    const { oracle, insured, beneficiary, lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 5_000n);
    await (await veilShield.connect(lp).depositLiquidity(5_000n)).wait();
    await (await token.connect(insured).approve(veilShieldAddress, 100n)).wait();

    await (
      await veilShield.connect(insured).createPolicy(
        1_000n,
        100n,
        await encryptUint64(insured, 3_000n),
        ethers.encodeBytes32String("ETH/USD"),
        0,
        await futureExpiry(),
        beneficiary.address
      )
    ).wait();

    await (
      await veilShield
        .connect(oracle)
        .submitOracleReading(
          ethers.encodeBytes32String("ETH/USD"),
          await encryptUint64(oracle, 2_500n)
        )
    ).wait();

    await (await veilShield.requestPolicyEvaluation(0)).wait();
    await hre.cofhe.mocks.expectPlaintext(
      await veilShield.connect(beneficiary).getMyPendingPayout(0),
      0n
    );

    await advanceDecryptWindow();
    await (await veilShield.finalizePolicyEvaluation(0)).wait();

    const pool = await veilShield.pool();
    expect(await veilShield.getPolicyStatus(0)).to.equal(0n);
    expect(await token.balanceOf(veilShieldAddress)).to.equal(5_100n);
    expect(pool.tokenLiquidity).to.equal(5_100n);
    expect(pool.tokenReserved).to.equal(1_000n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalReserved, 1_000n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalDeposits, 5_000n);
  });

  it("lets LPs withdraw premium gains through share accounting", async function () {
    const { insured, beneficiary, lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 5_000n);
    await (await veilShield.connect(lp).depositLiquidity(5_000n)).wait();
    await (await token.connect(insured).approve(veilShieldAddress, 100n)).wait();

    await (
      await veilShield.connect(insured).createPolicy(
        1_000n,
        100n,
        await encryptUint64(insured, 3_000n),
        ethers.encodeBytes32String("ETH/USD"),
        0,
        await futureExpiry(),
        beneficiary.address
      )
    ).wait();

    expect(await veilShield.connect(lp).getMyLpTokenBalance()).to.equal(5_100n);
    await (await veilShield.connect(insured).cancelPolicy(0)).wait();
    await (await veilShield.connect(lp).withdrawLiquidity(5_100n)).wait();

    expect(await token.balanceOf(veilShieldAddress)).to.equal(0n);
    expect(await veilShield.connect(lp).getMyLpTokenBalance()).to.equal(0n);
    expect(await veilShield.getAvailableLiquidityTokens()).to.equal(0n);
    await hre.cofhe.mocks.expectPlaintext(await veilShield.connect(lp).getMyLpBalance(), 0n);
    await hre.cofhe.mocks.expectPlaintext((await veilShield.pool()).encTotalDeposits, 0n);
  });

  it("releases reserved liquidity through the explicit expiry path", async function () {
    const { insured, beneficiary, lp, token, veilShield } = await deployFixture();
    const veilShieldAddress = await veilShield.getAddress();

    await approveAndEncrypt(lp, token.connect(lp), veilShieldAddress, 5_000n);
    await (await veilShield.connect(lp).depositLiquidity(5_000n)).wait();
    await (await token.connect(insured).approve(veilShieldAddress, 100n)).wait();

    const latest = await ethers.provider.getBlock("latest");
    const expiry = BigInt((latest?.timestamp ?? Math.floor(Date.now() / 1000)) + 5);

    await (
      await veilShield.connect(insured).createPolicy(
        1_000n,
        100n,
        await encryptUint64(insured, 3_000n),
        ethers.encodeBytes32String("ETH/USD"),
        0,
        expiry,
        beneficiary.address
      )
    ).wait();

    expect((await veilShield.pool()).tokenReserved).to.equal(1_000n);

    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine", []);
    await (await veilShield.expirePolicy(0)).wait();

    const pool = await veilShield.pool();
    expect(await veilShield.getPolicyStatus(0)).to.equal(4n);
    expect(pool.tokenReserved).to.equal(0n);
    expect(await veilShield.getAvailableLiquidityTokens()).to.equal(5_100n);
    await hre.cofhe.mocks.expectPlaintext(pool.encTotalReserved, 0n);
  });
});

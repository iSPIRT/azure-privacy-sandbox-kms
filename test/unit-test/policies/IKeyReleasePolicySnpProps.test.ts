// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Use the CCF polyfill to mock-up all key-value map functionality for unit-test
import "@microsoft/ccf-app/polyfill.js";
import { describe, expect, test } from "@jest/globals";
import { KeyReleasePolicy } from "../../../src/policies/KeyReleasePolicy";
import { Logger, LogLevel } from "../../../src/utils/Logger";
import { IKeyReleasePolicySnpProps } from "../../../src";
import { IAttestationReport } from "../../../src/attestation/ISnpAttestationReport";
import { IKeyReleasePolicy } from "../../../src/policies/IKeyReleasePolicy";

describe("Test Key Release Policy properties", () => {
  test("Should get all data successfully", () => {
    // Arrange
    const policy: IKeyReleasePolicySnpProps = {};

    // Act
    policy["x-ms-attestation-type"] = ["sevsnpvm", "none"];

    // Assert
    expect(policy["x-ms-attestation-type"]).toContain("sevsnpvm");
    expect(policy["x-ms-attestation-type"]).toContain("none");
  });

  test("Should validate successfully", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: IKeyReleasePolicy = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
    };
    const attestationClaims: IAttestationReport = {
      "x-ms-attestation-type": "sevsnpvm",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(true);
  });
  test("Should validate successfully Key Release Policy properties with operator gte", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gte: { "x-ms-number": 8.6 },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": 8.6,
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(true);
  });

  test("Should fail validation Key Release Policy properties with operator gte, attestation is smaller", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gte: { "x-ms-number": 8.6 },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": 8,
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(false);
  });

  test("Should fail validation Key Release Policy properties with operator gte, missing gte claim", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gte: { "x-ms-number": 8.6 },
    };
    const attestationClaims: IAttestationReport = {
      "x-ms-attestation-type": "sevsnpvm",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(false);
  });

  test("Should fail validation Key Release Policy properties with claims, missing claim", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gte: { "x-ms-number": 8.6 },
    };
    const attestationClaims: IAttestationReport = {
      "x-ms-attestation-type": "",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(false);
  });

  test("Should validate successfully Key Release Policy properties with operator gt", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gt: { "x-ms-number": 8.6 },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": 9.5,
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(true);
  });

  test("Should validate successfully Key Release Policy properties with operator gt", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gt: { "x-ms-number": 8.6 },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": "9.5",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(true);
  });

  test("Should validate successfully Key Release Policy properties with operator gt", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gt: { "x-ms-number": "8.6" },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": "9.5",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(true);
  });

  test("Should fail validation Key Release Policy properties with operator gt, attestation is equal", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gt: { "x-ms-number": 8.6 },
    };
    const attestationClaims: any = {
      "x-ms-attestation-type": "sevsnpvm",
      "x-ms-number": 8.6,
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(false);
  });

  test("Should fail validation Key Release Policy properties with operator gt, missing gt claim", () => {
    // Arrange
    Logger.setLogLevel(LogLevel.DEBUG);
    const policy: any = {
      type: "",
      claims: { "x-ms-attestation-type": ["sevsnpvm"] },
      gt: { "x-ms-number": 8.6 },
    };
    const attestationClaims: IAttestationReport = {
      "x-ms-attestation-type": "sevsnpvm",
    };

    // Act
    const validationResult = KeyReleasePolicy.validateKeyReleasePolicy(
      policy,
      attestationClaims,
    );

    // Assert
    expect(validationResult.success).toBe(false);
  });
});

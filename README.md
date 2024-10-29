# Privacy Sandbox Key Management System (KMS) for Azure

## Privacy Sandbox

The Google Privacy Sandbox initiative aims to establish web standards that allow user data access while preserving privacy. It seeks to eliminate third-party cookies and reduce covert tracking, replacing them with privacy-centric tools for online advertising and analytics. Developed collaboratively in public forums with industry stakeholders, these proposals undergo rigorous testing and refinement based on community feedback.

## Key Management System (KMS)

Central to the Privacy Sandbox is robust encryption, ensuring that browsers no longer rely on third-party cookies or share user information directly. Instead, browsers join 'interest groups' during web navigation. These groups, devoid of personal data, tag interests for privacy-conscious ad targeting.

In this ecosystem, ad space on websites is auctioned in real-time, with the browser's encrypted interest groups being key to this process. The KMS plays a pivotal role here, providing essential encryption keys to browsers, auction sites, and bidding servers. This setup ensures that interest group data is shared securely, safeguarding user privacy.

## Security

The security of the Privacy Sandbox hinges on encrypting interest groups and decrypting them only within dedicated bidding and auction services. These services operate in [Confidential Computing TEEs](https://learn.microsoft.com/en-us/azure/confidential-computing/trusted-execution-environment), offering strong guarantees that interest group data and private keys used for decryption remain confidential and are not leaked outside the TEEs. Even Azure, as the service operator, cannot access or alter this confidential information.

The Azure KMS, also running within TEEs, upholds stringent confidentiality and integrity standards, ensuring that keys generated by the KMS remain secure. The KMS provides non-repudiable guarantees through [receipts](https://microsoft.github.io/CCF/main/audit/receipts.html), allowing third parties to verify the authenticity of the generated keys.

Bidding and auction services, as KMS clients, can request encryption keys but must undergo an attestation process. This [attestation](https://learn.microsoft.com/en-us/azure/attestation/overview) serves as proof that the client is running the specified software stack on approved hardware, allowing the KMS to verify that these services operate within TEEs.

KMS operates on a distributed trust model, requiring consensus among Privacy Sandbox coordinators for policy and code changes. This distributed trust ensures that a cloud operator, such as Azure, cannot alter encryption keys or other critical elements without breaching the established trust.

# Disclamer

This version of KMS can only be used for testing and not for production.

E.g. we dump keys in logs to facilitate testing and the solution has not gone through the necessary security evaluation, needed for production.

Because of integration testing we have not yet fully secured the endpoints. This is work to be done before production.

# Guidance

See [TypeScript Application](https://microsoft.github.io/CCF/main/build_apps/js_app_ts.html#typescript-application), [ccf-app-samples
/data-reconciliation-app](https://github.com/microsoft/ccf-app-samples/tree/main/data-reconciliation-app)

# Shortcuts

Key endpoints are unauthenticated for testing

# Setup local test environment

```bash
npm install
```

If you want to test KMS manually, you need [tinkey](https://developers.google.com/tink/install-tinkey) to see the content of tink keyset.

```bash
TINKEY_VERSION=tinkey-1.10.1
curl -O https://storage.googleapis.com/tinkey/$TINKEY_VERSION.tar.gz
tar -xzvf $TINKEY_VERSION.tar.gz
sudo cp tinkey /usr/bin/
sudo cp tinkey_deploy.jar /usr/bin/
sudo rm tinkey tinkey_deploy.jar tinkey.bat $TINKEY_VERSION.tar.gz

# Tinkey uses java
sudo apt install default-jre -y

tinkey help
```

# Setup mCCF test environment

The script can be edited to fit the local directories such KEYS_DIR.
Also the CCF_NAME can be edited to match the name of the mCCF service.

```
. ./scripts/setup_mCCF.sh
```

# Build/run local demo

## Getting started

This demo can work against the Sandbox or CCF running in a docker image with very little ceremony. As long as you have a terminal in the `kms` path, you can run `make demo` to run in the Sandbox, or `make demo-docker` to run in a virtual enclave inside docker.

## Part 1: Startup

Start the demo and e22 tests by running `make demo` in the `kms` path.

This part of the demo has started the network and deployed the app. The network is running with 3 members and 1 user, and the app is deployed with the constitution defined [here](../governance/constitution/), which means that all members have equal votes on decisions, and a majority of approval votes is required to advance proposals. All members have been activated.

```bash
export KMS_WORKSPACE=${PWD}/workspace
make demo
▶️ Starting sandbox...
💤 Waiting for sandbox . . . (23318)
📂 Working directory (for certificates): ./workspace/sandbox_common
💤 Waiting for the app frontend...
Running TypeScript flow...
```

## Start KMS and IDP in sandbox

```
export KMS_WORKSPACE=${PWD}/workspace
make start-host-idp

# Setup additional vars used in the manual tests
. ./scripts/setup_local.sh
```

## Propose and vote new key release policy

### Add claims

```
make propose-add-key-release-policy
```

### Remove claims

```
make propose-rm-key-release-policy
```

## Propose and vote new settings policy

change governance/policies/settings-policy.json and change make debug=false.
Use the following make command to change the settings.

```
make propose-settings-policy
```

### Remove claims

```
make propose-rm-key-release-policy
```

### Script to setup policies and generate a key

```
make setup
```

## Manual tests

```
# Testing with hearthbeat: Use user certs
curl ${KMS_URL}/app/hearthbeat --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/user0_cert.pem --key ${KEYS_DIR}/user0_privk.pem -H "Content-Type: application/json" -w '\n' | jq

# Testing with hearthbeat: Use member certs
curl ${KMS_URL}/app/hearthbeat --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/member0_cert.pem --key ${KEYS_DIR}/member0_privk.pem -H "Content-Type: application/json" -w '\n' | jq

# Testing with hearthbeat: Use JWT
curl ${KMS_URL}/app/hearthbeat --cacert ${KEYS_DIR}/service_cert.pem  -H "Content-Type: application/json" -H "Authorization:$AUTHORIZATION"  -w '\n' | jq

# Generate a new key item
curl ${KMS_URL}/app/refresh -X POST --cacert ${KEYS_DIR}/service_cert.pem  -H "Content-Type: application/json" -i  -w '\n'

# Get the latest public key
curl ${KMS_URL}/app/pubkey --cacert ${KEYS_DIR}/service_cert.pem  -H "Content-Type: application/json" -i  -w '\n'
# Get the latest public key in tink format
curl ${KMS_URL}/app/pubkey?fmt=tink --cacert ${KEYS_DIR}/service_cert.pem  -H "Content-Type: application/json" -i  -w '\n'

# Get list of public keys
curl ${KMS_URL}/app/listpubkeys --cacert ${KEYS_DIR}/service_cert.pem  -H "Content-Type: application/json" -i  -w '\n'

# Get the latest private key (JWT)
wrapped_resp=$(curl $KMS_URL/app/key -X POST --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/member0_cert.pem --key ${KEYS_DIR}/member0_privk.pem -H "Content-Type: application/json" -d "{\"attestation\":$ATTESTATION, \"wrappingKey\":$WRAPPING_KEY}"  | jq)
echo $wrapped_resp
kid=$(echo $wrapped_resp | jq '.wrappedKid' -r)
echo $kid
wrapped=$(echo $wrapped_resp | jq '.wrapped' -r)
echo $wrapped

# Unwrap key with attestation (JWT)
curl $KMS_URL/app/unwrapKey -X POST --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/user0_cert.pem --key ${KEYS_DIR}/user0_privk.pem -H "Content-Type: application/json" -d "{\"attestation\":$ATTESTATION, \"wrappingKey\":$WRAPPING_KEY, \"wrapped\":\"$wrapped\", \"wrappedKid\":\"$kid\"}" | jq

# Get the latest private key (Tink)
wrapped_resp=$(curl $KMS_URL/app/key?fmt=tink -X POST --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/member0_cert.pem --key ${KEYS_DIR}/member0_privk.pem -H "Content-Type: application/json" -d "{\"attestation\":$ATTESTATION, \"wrappingKey\":$WRAPPING_KEY}" | jq)
echo $wrapped_resp
key=$(echo $wrapped_resp | jq -r '.wrapped' | jq -R 'fromjson' | jq '.keys[0]')
# It has a format of "azu-kms://<kid>" like "azu-kms://tGe-cVHzNyim2Z0PzHO4y0ClXCa5J6x-bh7GmGJTr3c".
key_encryption_key_uri=$(echo $key | jq '.keyData[0].keyEncryptionKeyUri' -r)
kid=$(echo $key_encryption_key_uri | awk -F/ '{print $NF}')
echo $kid
keyMaterial=$(echo $key | jq '.keyData[0].keyMaterial' -r)
wrapped=$(echo $keyMaterial | jq '.encryptedKeyset' -r)
echo $wrapped

# Unwrap key with attestation (Tink)
curl $KMS_URL/app/unwrapKey?fmt=tink -X POST --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/member0_cert.pem --key ${KEYS_DIR}/member0_privk.pem -H "Content-Type: application/json" -d "{\"attestation\":$ATTESTATION, \"wrappingKey\":$WRAPPING_KEY, \"wrapped\":\"$wrapped\", \"wrappedKid\":\"$kid\"}" | jq

# Get key release policy
curl $KMS_URL/app/keyReleasePolicy --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/member0_cert.pem --key ${KEYS_DIR}/member0_privk.pem -H "Content-Type: application/json" | jq

# Get receipt
curl $KMS_URL/receipt?transaction_id=2.20 --cacert ${KEYS_DIR}/service_cert.pem --cert ${KEYS_DIR}/user0_cert.pem --key ${KEYS_DIR}/user0_privk.pem -H "Content-Type: application/json" -i  -w '\n'
```
## Run end to end system tests
```
pytest -s test/system-test
```

## Access Tokens

The manual curl test work with certificates. In this section we will use access tokens.

### Start sample identity provider and kms

```
export KMS_WORKSPACE=${PWD}/workspace
make start-host-idp
```

### Test identity provier in seperate terminal

```
export AadEndpoint=http://localhost:3000/token
./scripts/generate_access_token.sh
```

# Privacy Sandbox

## Signing

Curve ECC_NIST_P256
Algorithm ECDSA_SHA_256

## Symmetric encryption AEAD

AES128_GCM

## HPKE

DHKEM_X25519_HKDF_SHA256_HKDF_SHA256_AES_256_GCM

# Other

## Debugging unit tests

Open the command palette and start Debug: JavaScript Debug Terminal.
Run tests in that terminal in a Watch mode using npm test --watch

# Generating protobuf files

```
cd src/endpoint/proto
```

## Failed experiment protobuf-compiler/out1

CCF could not load the generated files even if they were turned into a package

```
sudo apt install  -y protobuf-compiler
npm install -g ts-protoc-gen
which protoc-gen-ts
./compile_proto.sh -i . -o ./out1
```

## Maintain protobuf

We are using [protobuf-es](https://github.com/bufbuild/protobuf-es) to use protobuf.
When you want to update protobuf generated code run `npm run build-proto`.

# Contributing

To take administrator actions such as adding users as contributors, please refer to [engineering hub](https://eng.ms/docs/initiatives/open-source-at-microsoft/github/opensource/repos/jit)

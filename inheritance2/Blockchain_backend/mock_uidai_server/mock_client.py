import requests

UID = "999941057058"
BASE = "http://127.0.0.1:8000"

# Step 1: Generate OTP
otp_resp = requests.post(
    f"{BASE}/uidotp/2.5/9/9",
    data={"uid": UID}
)

print("OTP Response:", otp_resp.text)

# 🔴 Enter OTP printed in server console
otp = input("Enter OTP: ")

# Step 2: e-KYC
kyc_resp = requests.post(
    f"{BASE}/uidkyc/kyc/2.5/9/9",
    data={"uid": UID, "otp": otp}
)

print("\n--- e-KYC RESPONSE ---")
print(kyc_resp.text)

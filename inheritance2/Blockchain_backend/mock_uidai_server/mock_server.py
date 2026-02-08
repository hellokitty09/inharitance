from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Sandbox test UID database - Add more test users for development
USERS = {
    "999941057058": {
        "name": "Shivshankar Choudhury",
        "dob": "1968-05-13",
        "gender": "M",
        "email": "s****y@dummyemail.com",
        "mobile": "******6979",
        "otp": None
    },
    "123456789012": {
        "name": "Priya Sharma",
        "dob": "1990-08-25",
        "gender": "F",
        "email": "p****a@email.com",
        "mobile": "******1234",
        "otp": None
    },
    "987654321098": {
        "name": "Rajesh Kumar",
        "dob": "1985-03-15",
        "gender": "M",
        "email": "r****h@email.com",
        "mobile": "******5678",
        "otp": None
    }
}

# ============ JSON ENDPOINTS (for Frontend) ============

@app.route("/api/otp/request", methods=["POST"])
def request_otp_json():
    """Request OTP for Aadhaar verification (JSON)"""
    data = request.get_json() or {}
    uid = data.get("aadhaar") or data.get("uid")
    
    if not uid:
        return jsonify({
            "success": False,
            "error": "Aadhaar number is required",
            "code": "UID_REQUIRED"
        }), 400

    # Auto-register if not exists (Dynamic User Generation)
    if uid not in USERS:
        import random
        names = ["Aarav Patel", "Vihaan Singh", "Aditya Sharma", "Sai Kumar", "Reyansh Gupta"]
        USERS[uid] = {
            "name": f"{random.choice(names)}",
            "dob": f"{random.randint(1970, 2000)}-01-01",
            "gender": random.choice(["M", "F"]),
            "email": f"user{uid[:4]}@example.com",
            "mobile": f"******{uid[-4:]}",
            "otp": None
        }
        print(f"[AUTO-REGISTERED] New Mock Profile for {uid}")
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    USERS[uid]["otp"] = otp
    
    print(f"[OTP GENERATED] Aadhaar={uid} OTP={otp}")
    
    return jsonify({
        "success": True,
        "message": "OTP sent to registered mobile number",
        "hint": f"For testing, OTP is: {otp}"  # Remove in production!
    })


@app.route("/api/otp/verify", methods=["POST"])
def verify_otp_json():
    """Verify OTP and return KYC data (JSON)"""
    data = request.get_json() or {}
    uid = data.get("aadhaar") or data.get("uid")
    otp = data.get("otp")
    
    if not uid or uid not in USERS:
        return jsonify({
            "success": False,
            "error": "Invalid Aadhaar number",
            "code": "UID_INVALID"
        }), 400
    
    if USERS[uid]["otp"] != otp:
        return jsonify({
            "success": False,
            "error": "Invalid OTP",
            "code": "OTP_INVALID"
        }), 400
    
    user = USERS[uid]
    
    return jsonify({
        "success": True,
        "verified": True,
        "kyc": {
            "name": user["name"],
            "dob": user["dob"],
            "gender": user["gender"],
            "email": user["email"],
            "mobile": user["mobile"],
            "aadhaar_masked": f"XXXX-XXXX-{uid[-4:]}"
        }
    })


# ============ XML ENDPOINTS (Original UIDAI format) ============

@app.route("/uidotp/2.5/<d1>/<d2>", methods=["POST"])
def generate_otp(d1, d2):
    uid = request.form.get("uid")
    # Auto-register for XML endpoint too
    if uid not in USERS:
        USERS[uid] = {
            "name": "Dynamic User",
            "dob": "1990-01-01",
            "gender": "M",
            "email": "dynamic@example.com",
            "mobile": f"******{uid[-4:] if uid else '0000'}",
            "otp": None
        }

    otp = str(random.randint(100000, 999999))
    USERS[uid]["otp"] = otp

    print(f"[OTP GENERATED] UID={uid} OTP={otp}")

    return Response("<OtpRes ret='y'/>", mimetype="application/xml")


@app.route("/uidkyc/kyc/2.5/<d1>/<d2>", methods=["POST"])
def ekyc(d1, d2):
    uid = request.form.get("uid")
    otp = request.form.get("otp")

    if uid not in USERS or USERS[uid]["otp"] != otp:
        return Response("<KycRes ret='n' err='OTP_INVALID'/>", 400)

    u = USERS[uid]

    xml = f"""
<KycRes ret="y" ts="{datetime.utcnow()}">
  <UidData>
    <Poi name="{u['name']}" dob="{u['dob']}" gender="{u['gender']}"/>
    <Contact email="{u['email']}" mobile="{u['mobile']}"/>
  </UidData>
</KycRes>
"""
    return Response(xml.strip(), mimetype="application/xml")


# ============ HEALTH CHECK ============

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Mock UIDAI Server"})


if __name__ == "__main__":
    print("=" * 50)
    print("Mock UIDAI Server Running")
    print("=" * 50)
    print("Test Aadhaar Numbers:")
    for uid, data in USERS.items():
        print(f"  {uid} - {data['name']}")
    print("=" * 50)
    app.run(port=5001, debug=True)

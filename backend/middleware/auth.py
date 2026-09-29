from flask import request, jsonify
import jwt
from functools import wraps


# =========================
# JWT TOKEN CHECK
# =========================

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "message": "Token is missing"
            }), 401

        # Safely extract token irrespective of 'Bearer ' casing or spaces
        parts = auth_header.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        elif len(parts) == 1:
            token = parts[0]
        else:
            return jsonify({
                "message": "Invalid token header format"
            }), 401

        try:
            data = jwt.decode(
                token,
                "homespot-secret-key",
                algorithms=["HS256"]
            )

        except jwt.ExpiredSignatureError:
            return jsonify({
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "message": "Invalid token"
            }), 401

        return f(data, *args, **kwargs)

    return decorated


# =========================
# ADMIN CHECK
# =========================

def admin_required(f):

    @wraps(f)
    def decorated(user_data, *args, **kwargs):

        role = str(user_data.get("Role") or user_data.get("role") or "").lower().strip()

        if role != "admin":
            return jsonify({
                "message": "Admin access required"
            }), 403

        return f(user_data, *args, **kwargs)

    return decorated
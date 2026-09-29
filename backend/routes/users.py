from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
from utils.helpers import db
from middleware.auth import token_required, admin_required

users_bp = Blueprint("users", __name__)


# =========================
# ADD USER (REGISTRATION)
# =========================

@users_bp.route("/users", methods=["POST"])
def add_user():
    data = request.get_json() or {}

    name = data.get("name") or data.get("Name")
    email = data.get("Email") or data.get("email")
    raw_password = data.get("Password") or data.get("password")
    role = data.get("Role") or data.get("role") or "Client"

    if not name or not email or not raw_password:
        return jsonify({
            "message": "Name, Email, and Password are required."
        }), 400

    cursor = db.cursor(dictionary=True)

    # Check if email already exists
    cursor.execute("SELECT UserID FROM users WHERE Email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        return jsonify({
            "message": "Email is already registered."
        }), 409

    # Password Hash
    hashed_password = generate_password_hash(raw_password)

    query = """
        INSERT INTO users (name, Email, Password, Role)
        VALUES (%s, %s, %s, %s)
    """
    values = (name, email, hashed_password, role)

    cursor.execute(query, values)
    db.commit()
    cursor.close()

    return jsonify({
        "message": "User registered successfully!"
    }), 201


# =========================
# GET ALL USERS (ADMIN ONLY)
# =========================

@users_bp.route("/admin/users", methods=["GET"])
@token_required
@admin_required
def admin_users(user_data):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT UserID, name, Email, Role
        FROM users
        ORDER BY UserID DESC
    """)
    users = cursor.fetchall()
    cursor.close()

    return jsonify(users), 200


# =========================
# UPDATE USER (ADMIN ONLY)
# =========================

@users_bp.route("/users/<int:user_id>", methods=["PUT"])
@token_required
@admin_required
def update_user(user_data, user_id):
    data = request.get_json() or {}

    name = data.get("name") or data.get("Name")
    email = data.get("Email") or data.get("email")
    raw_password = data.get("Password") or data.get("password")
    role = data.get("Role") or data.get("role") or "Client"

    if not name or not email:
        return jsonify({
            "message": "Name and Email are required."
        }), 400

    cursor = db.cursor()

    if raw_password:
        hashed_password = generate_password_hash(raw_password)
        query = """
            UPDATE users
            SET name = %s,
                Email = %s,
                Password = %s,
                Role = %s
            WHERE UserID = %s
        """
        values = (name, email, hashed_password, role, user_id)
    else:
        query = """
            UPDATE users
            SET name = %s,
                Email = %s,
                Role = %s
            WHERE UserID = %s
        """
        values = (name, email, role, user_id)

    cursor.execute(query, values)
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({
            "message": "User not found"
        }), 404

    cursor.close()

    return jsonify({
        "message": "User updated successfully!"
    }), 200


# =========================
# DELETE USER (ADMIN ONLY)
# =========================

@users_bp.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_user(user_data, user_id):
    cursor = db.cursor()

    query = """
        DELETE FROM users
        WHERE UserID = %s
    """
    cursor.execute(query, (user_id,))
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({
            "message": "User not found"
        }), 404

    cursor.close()

    return jsonify({
        "message": "User deleted successfully!"
    }), 200


# =========================
# LOGIN
# =========================

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("Email") or data.get("email")
    password = data.get("Password") or data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and Password are required."
        }), 400

    cursor = db.cursor(dictionary=True)

    query = """
        SELECT *
        FROM users
        WHERE Email = %s
    """
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    cursor.close()

    if user is None:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(user["Password"], password):
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    # =========================
    # GENERATE JWT TOKEN
    # =========================

    token = jwt.encode(
        {
            "UserID": user["UserID"],
            "name": user.get("name", "User"),
            "Email": user["Email"],
            "Role": user["Role"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        "homespot-secret-key",
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user["UserID"],
            "name": user.get("name", "User"),
            "email": user["Email"],
            "role": user["Role"]
        }
    }), 200


# =========================
# PROFILE
# =========================

@users_bp.route("/profile", methods=["GET"])
@token_required
def profile(user_data):
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT UserID, name, Email, Role FROM users WHERE UserID = %s",
        (user_data["UserID"],)
    )
    user_record = cursor.fetchone()
    cursor.close()

    if not user_record:
        return jsonify({
            "UserID": user_data["UserID"],
            "name": user_data.get("name", "User"),
            "Email": user_data["Email"],
            "Role": user_data["Role"]
        }), 200

    return jsonify({
        "message": "Access granted!",
        "UserID": user_record["UserID"],
        "name": user_record["name"],
        "Email": user_record["Email"],
        "Role": user_record["Role"]
    }), 200
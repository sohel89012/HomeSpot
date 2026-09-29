from flask import Blueprint, request, jsonify
from datetime import datetime
from utils.helpers import db
from middleware.auth import token_required, admin_required

enquiries_bp = Blueprint("enquiries", __name__)


# =========================
# ADD ENQUIRY
# =========================

@enquiries_bp.route("/enquiries", methods=["POST"])
@token_required
def add_enquiry(user_data):
    data = request.get_json() or {}

    property_id = data.get("PropertyID")
    message = data.get("Message")

    if not property_id or not message:
        return jsonify({"message": "PropertyID and Message are required."}), 400

    user_id = user_data.get("UserID") or user_data.get("id")
    if not user_id:
        return jsonify({"message": "Invalid user session."}), 401

    cursor = db.cursor()

    query = """
        INSERT INTO enquiries
        (UserID, PropertyID, Message, EnquiryDate)
        VALUES (%s, %s, %s, %s)
    """

    values = (
        int(user_id),
        int(property_id),
        str(message).strip(),
        datetime.now().strftime('%Y-%m-%d')
    )

    cursor.execute(query, values)
    db.commit()
    cursor.close()

    return jsonify({
        "message": "Enquiry sent successfully!"
    }), 201


# =========================
# GET MY ENQUIRIES (USER SPECIFIC)
# =========================

@enquiries_bp.route("/enquiries", methods=["GET"])
@token_required
def get_my_enquiries(user_data):
    user_id = user_data.get("UserID") or user_data.get("id")
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT 
            e.EnquiryID,
            e.UserID,
            e.PropertyID,
            e.Message,
            DATE_FORMAT(e.EnquiryDate, '%Y-%m-%d') AS EnquiryDate,
            e.AdminReply,
            COALESCE(p.Title, 'Architectural Residence') AS PropertyTitle,
            COALESCE(p.Location, 'Location Unspecified') AS PropertyLocation
        FROM enquiries e
        LEFT JOIN properties p 
            ON e.PropertyID = p.PropertyID
        WHERE e.UserID = %s
        ORDER BY e.EnquiryID DESC
    """

    cursor.execute(query, (int(user_id),))
    enquiries = cursor.fetchall()
    cursor.close()

    return jsonify(enquiries), 200


# =========================
# GET ALL ENQUIRIES (ADMIN ONLY)
# =========================

@enquiries_bp.route("/admin/enquiries", methods=["GET"])
@token_required
@admin_required
def get_all_enquiries(user_data):
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT
            e.EnquiryID,
            e.Message,
            DATE_FORMAT(e.EnquiryDate, '%Y-%m-%d') AS EnquiryDate,
            e.AdminReply,
            e.UserID,
            COALESCE(u.name, 'Customer') AS UserName,
            COALESCE(u.Email, 'No email') AS Email,
            e.PropertyID,
            COALESCE(p.Title, 'Architectural Residence') AS PropertyTitle,
            COALESCE(p.Location, 'Location Unspecified') AS PropertyLocation
        FROM enquiries e
        LEFT JOIN users u
            ON e.UserID = u.UserID
        LEFT JOIN properties p
            ON e.PropertyID = p.PropertyID
        ORDER BY e.EnquiryID DESC
    """

    cursor.execute(query)
    enquiries = cursor.fetchall()
    cursor.close()

    return jsonify(enquiries), 200


# =========================
# REPLY TO ENQUIRY (ADMIN ONLY)
# =========================

@enquiries_bp.route("/admin/enquiries/<int:enquiry_id>/reply", methods=["PUT"])
@token_required
@admin_required
def reply_enquiry(user_data, enquiry_id):
    data = request.get_json() or {}
    reply_text = data.get("reply", "").strip()

    if not reply_text:
        return jsonify({"message": "Reply message cannot be empty."}), 400

    cursor = db.cursor()

    query = """
        UPDATE enquiries
        SET AdminReply = %s
        WHERE EnquiryID = %s
    """

    cursor.execute(query, (reply_text, enquiry_id))
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({"message": "Enquiry not found"}), 404

    cursor.close()

    return jsonify({
        "message": "Reply sent successfully!",
        "reply": reply_text
    }), 200


# =========================
# DELETE ENQUIRY (ADMIN ONLY)
# =========================

@enquiries_bp.route("/enquiries/<int:enquiry_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_enquiry(user_data, enquiry_id):
    cursor = db.cursor()

    query = """
        DELETE FROM enquiries
        WHERE EnquiryID = %s
    """

    cursor.execute(query, (enquiry_id,))
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({
            "message": "Enquiry not found"
        }), 404

    cursor.close()

    return jsonify({
        "message": "Enquiry deleted successfully!"
    }), 200
from flask import Blueprint, request, jsonify
from utils.helpers import db
from middleware.auth import token_required, admin_required

properties_bp = Blueprint("properties", __name__)


# =========================
# ADD PROPERTY
# ADMIN ONLY
# =========================

@properties_bp.route("/properties", methods=["POST"])
@token_required
@admin_required
def add_property(user_data):

    data = request.get_json() or {}

    title = data.get("Title") or data.get("title")
    location = data.get("Location") or data.get("location")
    price = data.get("Price") or data.get("price")
    bhk = data.get("BHK") or data.get("bhk")
    property_type = data.get("PropertyType") or data.get("propertyType") or data.get("property_type")
    description = data.get("Description") or data.get("description", "")
    image = data.get("Image") or data.get("image", "")

    # Always securely use logged-in Admin's UserID from JWT token
    owner_id = user_data.get("UserID") or user_data.get("id") or data.get("OwnerID")

    if not all([title, location, price, bhk, property_type]):
        return jsonify({
            "message": "Title, Location, Price, BHK, and PropertyType are required fields."
        }), 400

    cursor = db.cursor()

    query = """
        INSERT INTO properties
        (Title, Location, Price, BHK, PropertyType, Description, Image, OwnerID)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        title,
        location,
        price,
        bhk,
        property_type,
        description,
        image,
        owner_id
    )

    cursor.execute(query, values)
    db.commit()
    cursor.close()

    return jsonify({
        "message": "Property added successfully!"
    }), 201


# =========================
# GET ALL PROPERTIES
# =========================

@properties_bp.route("/properties", methods=["GET"])
def get_properties():

    cursor = db.cursor(dictionary=True)

    query = """
        SELECT *
        FROM properties
        ORDER BY PropertyID DESC
    """

    cursor.execute(query)
    properties = cursor.fetchall()
    cursor.close()

    return jsonify(properties), 200


# =========================
# GET SINGLE PROPERTY
# =========================

@properties_bp.route("/properties/<int:property_id>", methods=["GET"])
def get_property(property_id):

    cursor = db.cursor(dictionary=True)

    query = """
        SELECT *
        FROM properties
        WHERE PropertyID = %s
    """

    cursor.execute(query, (property_id,))
    property_data = cursor.fetchone()
    cursor.close()

    if property_data is None:
        return jsonify({
            "message": "Property not found"
        }), 404

    return jsonify(property_data), 200


# =========================
# UPDATE PROPERTY
# ADMIN ONLY
# =========================

@properties_bp.route("/properties/<int:property_id>", methods=["PUT"])
@token_required
@admin_required
def update_property(user_data, property_id):

    data = request.get_json() or {}

    title = data.get("Title") or data.get("title")
    location = data.get("Location") or data.get("location")
    price = data.get("Price") or data.get("price")
    bhk = data.get("BHK") or data.get("bhk")
    property_type = data.get("PropertyType") or data.get("propertyType") or data.get("property_type")
    description = data.get("Description") or data.get("description", "")
    image = data.get("Image") or data.get("image", "")
    owner_id = user_data.get("UserID") or user_data.get("id") or data.get("OwnerID")

    if not all([title, location, price, bhk, property_type]):
        return jsonify({
            "message": "Title, Location, Price, BHK, and PropertyType are required fields."
        }), 400

    cursor = db.cursor()

    query = """
        UPDATE properties
        SET Title = %s,
            Location = %s,
            Price = %s,
            BHK = %s,
            PropertyType = %s,
            Description = %s,
            Image = %s,
            OwnerID = %s
        WHERE PropertyID = %s
    """

    values = (
        title,
        location,
        price,
        bhk,
        property_type,
        description,
        image,
        owner_id,
        property_id
    )

    cursor.execute(query, values)
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({
            "message": "Property not found"
        }), 404

    cursor.close()

    return jsonify({
        "message": "Property updated successfully!"
    }), 200


# =========================
# DELETE PROPERTY
# ADMIN ONLY
# =========================

@properties_bp.route("/properties/<int:property_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_property(user_data, property_id):

    cursor = db.cursor()

    query = """
        DELETE FROM properties
        WHERE PropertyID = %s
    """

    cursor.execute(query, (property_id,))
    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        return jsonify({
            "message": "Property not found"
        }), 404

    cursor.close()

    return jsonify({
        "message": "Property deleted successfully!"
    }), 200
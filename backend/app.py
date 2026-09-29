from flask import Flask
from routes.users import users_bp
from flask_cors import CORS
from routes.properties import properties_bp
from routes.enquiries import enquiries_bp
from utils.helpers import close_db


#===================================================================================================================================================
#===================================================================================================================================================


app = Flask(__name__)

# Enable CORS for React frontend
CORS(app)

# Auto-cleanup: Har request complete hone par connection release ho jayega
app.teardown_appcontext(close_db)

app.register_blueprint(users_bp)
app.register_blueprint(properties_bp)
app.register_blueprint(enquiries_bp)

# 32+ bytes secret key to eliminate InsecureKeyLengthWarning
app.config["SECRET_KEY"] = "homespot-super-secret-jwt-key-2026-production-grade-32bytes"



# =========================
# HOME
# =========================

@app.route("/")
def home():

    return "Vihaan your Backend + MySQL Database is Connected!"



# =========================
# RUN FLASK
# =========================

if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)
import mysql.connector
from flask import g

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "HomeSpot"
}

def get_db():
    # Flask context ke andar har thread/request ko alag connection assign hota hai
    if 'db' not in g:
        g.db = mysql.connector.connect(**db_config)
    else:
        try:
            if not g.db.is_connected():
                g.db.ping(reconnect=True, attempts=2, delay=1)
        except Exception:
            g.db = mysql.connector.connect(**db_config)
    return g.db

def close_db(e=None):
    # Request complete hote hi socket safely release ho jata hai
    db = g.pop('db', None)
    if db is not None and db.is_connected():
        try:
            db.close()
        except Exception:
            pass

class DatabaseProxy:
    def cursor(self, *args, **kwargs):
        conn = get_db()
        return conn.cursor(*args, **kwargs)

    def commit(self):
        conn = get_db()
        return conn.commit()

    def rollback(self):
        conn = get_db()
        return conn.rollback()

    def close(self):
        close_db()

# Backward-compatible db object (existing code unaltered rahega)
db = DatabaseProxy()
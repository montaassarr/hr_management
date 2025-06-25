from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    def __init__(self, db):
        self.collection = db.users

    def create_user(self, username, password, phone, role='user', is_active=True, is_verified=False, verification_code=None):
        user = {
            'username': username,
            'password_hash': generate_password_hash(password),
            'phone': phone,
            'role': role,
            'is_active': is_active,
            'is_verified': is_verified,
            'verification_code': verification_code,
            'created_at': datetime.utcnow()
        }
        return self.collection.insert_one(user)

    def find_by_username(self, username):
        return self.collection.find_one({'username': username})

    def verify_password(self, user, password):
        return check_password_hash(user['password_hash'], password)

    def set_verified(self, username):
        return self.collection.update_one({'username': username}, {'$set': {'is_verified': True}})

    def set_active(self, username, active=True):
        return self.collection.update_one({'username': username}, {'$set': {'is_active': active}})

    def get_by_id(self, user_id):
        return self.collection.find_one({'_id': user_id})

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from models import User
import os
from functools import wraps
from datetime import datetime
import io

app = Flask(__name__)
CORS(app)

# Configuration MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/hr_db"
mongo = PyMongo(app)

# JWT and Token Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
jwt = JWTManager(app)
serializer = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])

user_model = User(mongo.db)

API_KEY = os.environ.get('API_KEY', 'your_super_secret_api_key')

def require_api_key(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Allow requests from localhost without API key
        if request.remote_addr in ('127.0.0.1', 'localhost'):
            return fn(*args, **kwargs)
        key = request.headers.get('x-api-key')
        if key != API_KEY:
            return jsonify({'error': 'Unauthorized: Invalid or missing API key'}), 401
        return fn(*args, **kwargs)
    return wrapper

# --- Helpers ---
def to_json(data):
    """Convert MongoDB object to a JSON-serializable format."""
    if isinstance(data, list):
        return [to_json(item) for item in data]
    if isinstance(data, dict):
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
        for key, value in data.items():
            data[key] = to_json(value)
    return data

# --- CRUD Employés ---

@app.route("/api/employes", methods=["GET"])
@require_api_key
def get_employes():
    # Pagination params
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search = request.args.get("search", "").strip()

    query = {}
    if search:
        # Search by nom or email (case-insensitive)
        query["$or"] = [
            {"nom": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    total = mongo.db.employes.count_documents(query)
    employes = list(
        mongo.db.employes.find(query)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )

    # Only return required fields for the list
    for emp in employes:
        emp["id"] = str(emp.pop("_id"))
        emp["departement"] = emp.get("departement", "")
        emp["role"] = emp.get("role", "")
        emp["nom"] = emp.get("nom", "")
        emp["prenom"] = emp.get("prenom", "")
        emp["email"] = emp.get("email", "")

    return jsonify({
        "total": total,
        "page": page,
        "per_page": per_page,
        "employes": employes
    })

@app.route("/api/employes/<id>", methods=["GET"])
@require_api_key
def get_employe(id):
    emp = mongo.db.employes.find_one({"_id": ObjectId(id)})
    if emp:
        emp["id"] = str(emp.pop("_id"))
        # Ensure all required fields are present
        emp["departement"] = emp.get("departement", "")
        emp["role"] = emp.get("role", "")
        emp["nom"] = emp.get("nom", "")
        emp["prenom"] = emp.get("prenom", "")
        emp["email"] = emp.get("email", "")
        emp["date_embauche"] = emp.get("date_embauche", "")
        emp["salaire"] = emp.get("salaire", "")
        return jsonify(emp)
    return jsonify({"error": "Employé non trouvé"}), 404

@app.route("/api/employes", methods=["POST"])
@require_api_key
def add_employe():
    data = request.json
    # Ensure department exists if provided
    if data.get("departement"):
        dep = mongo.db.departements.find_one({"nom": data["departement"]})
        if not dep:
            return jsonify({"error": f"Département '{data['departement']}' non trouvé"}), 400
            
    emp_id = mongo.db.employes.insert_one(data).inserted_id
    new_emp = mongo.db.employes.find_one({"_id": emp_id})
    return jsonify(to_json(new_emp)), 201

@app.route("/api/employes/<id>", methods=["PUT"])
@require_api_key
def update_employe(id):
    data = request.json
    # Ensure department exists if provided
    if data.get("departement"):
        dep = mongo.db.departements.find_one({"nom": data["departement"]})
        if not dep:
            return jsonify({"error": f"Département '{data['departement']}' non trouvé"}), 400

    mongo.db.employes.update_one({"_id": ObjectId(id)}, {"$set": data})
    emp = mongo.db.employes.find_one({"_id": ObjectId(id)})
    return jsonify(to_json(emp))

@app.route("/api/employes/<id>", methods=["DELETE"])
@require_api_key
def delete_employe(id):
    result = mongo.db.employes.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"result": "Employé supprimé"})
    return jsonify({"error": "Employé non trouvé"}), 404

# --- CRUD Départements ---

@app.route("/api/departements", methods=["POST"])
@require_api_key
def add_departement():
    data = request.json
    if not data.get("nom"):
        return jsonify({"error": "Le nom du département est requis"}), 400
    
    existing = mongo.db.departements.find_one({"nom": data["nom"]})
    if existing:
        return jsonify({"error": "Ce département existe déjà"}), 409
        
    dep_id = mongo.db.departements.insert_one({"nom": data["nom"]}).inserted_id
    new_dep = mongo.db.departements.find_one({"_id": dep_id})
    return jsonify(to_json(new_dep)), 201

@app.route("/api/departements", methods=["GET"])
@require_api_key
def get_departements():
    departements = list(mongo.db.departements.find())
    for dep in departements:
        # For each department, count the employees
        employee_count = mongo.db.employes.count_documents({"departement": dep["nom"]})
        dep["nombre_employes"] = employee_count
    return jsonify(to_json(departements))

@app.route("/api/departements/<id>", methods=["GET"])
@require_api_key
def get_departement_details(id):
    dep = mongo.db.departements.find_one({"_id": ObjectId(id)})
    if not dep:
        return jsonify({"error": "Département non trouvé"}), 404
    
    # Find employees in that department
    employees_in_dep = list(mongo.db.employes.find({"departement": dep["nom"]}))
    dep["employes"] = employees_in_dep
    return jsonify(to_json(dep))

@app.route("/api/departements/<id>", methods=["PUT"])
@require_api_key
def update_departement(id):
    data = request.json
    if not data.get("nom"):
        return jsonify({"error": "Le nom du département est requis"}), 400

    old_dep = mongo.db.departements.find_one({"_id": ObjectId(id)})
    if not old_dep:
        return jsonify({"error": "Département non trouvé"}), 404
        
    # Update department name
    mongo.db.departements.update_one({"_id": ObjectId(id)}, {"$set": {"nom": data["nom"]}})
    
    # Update all employees in the old department
    mongo.db.employes.update_many(
        {"departement": old_dep["nom"]},
        {"$set": {"departement": data["nom"]}}
    )
    
    updated_dep = mongo.db.departements.find_one({"_id": ObjectId(id)})
    return jsonify(to_json(updated_dep))

@app.route("/api/departements/<id>", methods=["DELETE"])
@require_api_key
def delete_departement(id):
    dep = mongo.db.departements.find_one({"_id": ObjectId(id)})
    if not dep:
        return jsonify({"error": "Département non trouvé"}), 404

    # Prevent deletion if employees are assigned to this department
    employee_count = mongo.db.employes.count_documents({"departement": dep["nom"]})
    if employee_count > 0:
        return jsonify({"error": "Impossible de supprimer le département, des employés y sont affectés"}), 400
        
    mongo.db.departements.delete_one({"_id": ObjectId(id)})
    return jsonify({"result": "Département supprimé"})

# --- CRUD Rôles ---

@app.route("/api/roles", methods=["POST"])
@require_api_key
def add_role():
    data = request.json
    if not data.get("nom") or not data.get("description"):
        return jsonify({"error": "Le nom et la description du rôle sont requis"}), 400

    existing = mongo.db.roles.find_one({"nom": data["nom"]})
    if existing:
        return jsonify({"error": "Ce rôle existe déjà"}), 409

    role_id = mongo.db.roles.insert_one({
        "nom": data["nom"],
        "description": data["description"]
    }).inserted_id
    new_role = mongo.db.roles.find_one({"_id": role_id})
    return jsonify(to_json(new_role)), 201

@app.route("/api/roles", methods=["GET"])
@require_api_key
def get_roles():
    roles = list(mongo.db.roles.find())
    return jsonify(to_json(roles))

@app.route("/api/roles/<id>", methods=["GET"])
@require_api_key
def get_role_details(id):
    role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    if not role:
        return jsonify({"error": "Rôle non trouvé"}), 404
    return jsonify(to_json(role))

@app.route("/api/roles/<id>", methods=["PUT"])
@require_api_key
def update_role(id):
    data = request.json
    if not data.get("nom") or not data.get("description"):
        return jsonify({"error": "Le nom et la description du rôle sont requis"}), 400

    old_role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    if not old_role:
        return jsonify({"error": "Rôle non trouvé"}), 404

    mongo.db.roles.update_one({"_id": ObjectId(id)}, {"$set": {
        "nom": data["nom"],
        "description": data["description"]
    }})
    updated_role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    return jsonify(to_json(updated_role))

@app.route("/api/roles/<id>", methods=["DELETE"])
@require_api_key
def delete_role(id):
    role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    if not role:
        return jsonify({"error": "Rôle non trouvé"}), 404

    mongo.db.roles.delete_one({"_id": ObjectId(id)})
    return jsonify({"result": "Rôle supprimé"})

# --- CRUD Users ---

@app.route('/api/users', methods=['GET'])
@require_api_key
def get_users():
    users = list(mongo.db.users.find())
    for user in users:
        user.pop('password_hash', None)
    return jsonify({'users': to_json(users)})

@app.route('/api/users/<id>', methods=['GET'])
@require_api_key
def get_user(id):
    user = mongo.db.users.find_one({'_id': ObjectId(id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.pop('password_hash', None)
    return jsonify(to_json(user))

@app.route('/api/users', methods=['POST'])
@require_api_key
def add_user():
    data = request.json
    if not data.get('name') or not data.get('email') or not data.get('role'):
        return jsonify({'error': 'Name, email, and role are required'}), 400
    # You may want to check for duplicate email or username here
    user = {
        'name': data['name'],
        'email': data['email'],
        'role': data['role'],
        'created_at': datetime.utcnow(),
        'is_active': True
    }
    user_id = mongo.db.users.insert_one(user).inserted_id
    new_user = mongo.db.users.find_one({'_id': user_id})
    return jsonify(to_json(new_user)), 201

@app.route('/api/users/<id>', methods=['PUT'])
@require_api_key
def update_user(id):
    data = request.json
    update_fields = {k: v for k, v in data.items() if k in ['name', 'email', 'role']}
    if not update_fields:
        return jsonify({'error': 'No valid fields to update'}), 400
    mongo.db.users.update_one({'_id': ObjectId(id)}, {'$set': update_fields})
    user = mongo.db.users.find_one({'_id': ObjectId(id)})
    user.pop('password_hash', None)
    return jsonify(to_json(user))

@app.route('/api/users/<id>', methods=['DELETE'])
@require_api_key
def delete_user(id):
    result = mongo.db.users.delete_one({'_id': ObjectId(id)})
    if result.deleted_count:
        return jsonify({'result': 'User deleted'})
    return jsonify({'error': 'User not found'}), 404

# --- Auth Endpoints ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role', 'user')

    if not username or not password or not phone:
        return jsonify({'error': 'All fields are required'}), 400
    if user_model.find_by_username(username):
        return jsonify({'error': 'Username already exists'}), 409

    user_model.create_user(username, password, phone, role, is_active=True)
    return jsonify({'message': 'User registered successfully.'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = user_model.find_by_username(username)
    if not user or not user_model.verify_password(user, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user.get('is_active', True):
        return jsonify({'error': 'Account is inactive'}), 403
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({'access_token': access_token, 'user': {'username': user['username'], 'phone': user['phone'], 'role': user['role']}})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = user_model.get_by_id(ObjectId(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.pop('password_hash', None)
    user['id'] = str(user['_id'])
    user.pop('_id', None)
    return jsonify({'user': user})

@app.route('/api/employees/upload-txt', methods=['POST'])
def upload_employees_txt():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.txt'):
        return jsonify({'error': 'Invalid file type'}), 400

    content = file.read().decode('utf-8')
    lines = content.strip().split('\n')
    added = 0
    for line in lines:
        parts = [p.strip() for p in line.split(',')]
        if len(parts) < 4:
            continue  # skip invalid lines
        nom, prenom, email, departement = parts[:4]
        employee = {
            'nom': nom,
            'prenom': prenom,
            'email': email,
            'departement': departement
        }
        mongo.db.employes.insert_one(employee)
        added += 1
    return jsonify({'status': 'success', 'added': added})

if __name__ == "__main__":
    app.run(debug=True)
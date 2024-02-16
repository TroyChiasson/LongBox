from firebase_functions import https_fn
from firebase_admin import initialize_app
from firebase_admin import firestore
from firebase_admin import auth
from firebase_admin import credentials
from flask import jsonify
import firebase_admin
from google.cloud import firestore
import os
from google.cloud.firestore_v1.base_query import FieldFilter

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

credentials_path = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

initialize_app(credentials.Certificate(credentials_path))

db = firestore.Client()

def add_card(data, context):
    # Check if user is authenticated
    if not context.auth:
        return jsonify({"error": "unauthenticated", "message": "User is not authenticated."}), 403

    userId = context.auth.uid
    user_cards_ref = db.collection('Users').document(userId).collection('All_User_cards')

    collectorsNumber = data.get('collectorsNumber')
    cardName = data.get('cardName')
    color = data.get('color')
    manaCost = data.get('manaCost')

    try:
        doc_ref = user_cards_ref.add({
            'collectorsNumber': collectorsNumber,
            'cardName': cardName,
            'color': color,
            'manaCost': manaCost,
            # Add other card details as needed
        })

        return jsonify({"message": "Card added successfully", "docId": doc_ref.id}), 200
    except Exception as e:
        return jsonify({"error": "internal", "message": "Error adding card", "details": str(e)}), 500

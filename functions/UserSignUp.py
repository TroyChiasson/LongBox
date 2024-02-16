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

# Cloud Function to handle user sign-up

def handle_signup(event, context):
    # Get user data from the event
    user_data = event['data']
    email = user_data['email']
    user_id = user_data['uid']

    # Log user information
    print(f"New user signed up: {email}, UID: {user_id}")

# Cloud Function trigger
def signup_listener(event, context):
    event_type = event['eventType']
    if event_type == 'providers/firebase.auth/eventTypes/user.create':
        handle_signup(event['data'], context)

# Call the signup_listener function
signup_listener(None, None)
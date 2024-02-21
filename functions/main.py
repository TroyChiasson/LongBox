# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, options

from firebase_admin import firestore, initialize_app, db, auth

from flask import jsonify

initialize_app()

db = firestore.Client()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello world!")

@https_fn.on_request(cors=options.CorsOptions(cors_origins=["*"]))
def add_card(req: https_fn.Request) -> https_fn.Response:
    # Your Cloud Function logic here

    # Create response headers
    headers = {
        'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
        'Access-Control-Allow-Methods': 'POST',  # Allow POST requests
        'Access-Control-Allow-Headers': 'Content-Type'  # Allow Content-Type header
    }

    # Return response with headers
    return https_fn.Response("Your response message", status=200, headers=headers)


    
# @https_fn.on_request()
# def add_card(req: https_fn.Request) -> https_fn.Response:
#     # Check if the request method is POST
#     if req.method == 'POST':
#         # Extract JSON data from the POST request body
#         data = req.get_json()

#         # Extract card details from the JSON data
#         card_name = data.get('cardName')
#         mana_value = data.get('manaValue')
#         color = data.get('color')
#         user_id = data.get('userId')

#         # Check if user ID is present
#         if user_id:
#             try:
#                 # Get a reference to the user's collection in Firestore
#                 user_collection_ref = db.collection('users').document(user_id).collection('cards')

#                 # Add the card details to the user's collection
#                 user_collection_ref.add({
#                     'cardName': card_name,
#                     'manaValue': mana_value,
#                     'color': color
#                 })

#                 # Return a success response with CORS headers
#                 headers = {
#                     'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
#                     'Access-Control-Allow-Methods': 'POST',  # Allow POST requests
#                     'Access-Control-Allow-Headers': 'Content-Type'  # Allow Content-Type header
#                 }
#                 return https_fn.Response("Card added successfully", status=200, headers=headers)
#             except Exception as e:
#                 # Return an error response if any exception occurs
#                 return https_fn.Response(f"Error: {str(e)}", status=500)
#         else:
#             # Return an error response if user ID is not present
#             return https_fn.Response("User not authenticated", status=401)
#     else:
#         # Return a method not allowed response for non-POST requests
#         return https_fn.Response("Method Not Allowed", status=405)
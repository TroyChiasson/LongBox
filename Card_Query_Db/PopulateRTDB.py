import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# need sdk key and its locatin to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/troy/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-3236cfb663.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sinuous-vortex-411619-default-rtdb.firebaseio.com'
})

with open("cardData/cardsPertData.csv", 'r') as all_cards_file:
    all_cards = all_cards_file.read()


cardName = ""
colors = ""
manaCost = ""
uuid = ""
setCode = ""

def upload_to_firestore(cards):
    cards = cards.split("\n")[1:3]
    print(cards[1])

    for card in cards:
        card = card.split(",")
        cardName = card[0].lower()
        setCode = card[1]
        uuid = card[2]
        colors = card[3]
        colorIdentity = card[4]
        manaCost = card[5]
        manaValue = card[6]

        first_letter = cardName[0]
        print(first_letter)


        ref = db.reference(f"/mtg_names/{first_letter}/cards/{cardName}")
        ref.set({
            "name": cardName,
            "setCode": setCode,
            "id": uuid,
            "color": colors,
            "colorIdentity": colorIdentity,
            "mana_cost": manaCost
        })

        print(f"Uploaded {cardName} to Firestore under TEST/{first_letter}/cards.")


if __name__ == "__main__":
    upload_to_firestore(all_cards)
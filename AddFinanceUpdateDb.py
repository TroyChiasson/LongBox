from google.cloud import firestore
import requests
import os
from firebase_admin import credentials, initialize_app

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

cred = credentials.ApplicationDefault()
initialize_app(cred)

firestore_client = firestore.Client()

base_api_url = "https://api.scryfall.com/cards/search?q=cmc%3D{cmc}&page={page}"

cards_inserted_count = 0
winners = []
losers = []

color_mapping = {
    'W': 'White',
    'U': 'Blue',
    'B': 'Black',
    'R': 'Red',
    'G': 'Green',
    'WU': 'Azorius',
    'UB': 'Dimir',
    'BR': 'Rakdos',
    'RG': 'Gruul',
    'GW': 'Selesnya',
    'WB': 'Orzhov',
    'UR': 'Izzet',
    'BG': 'Golgari',
    'RW': 'Boros',
    'UG': 'Simic',
    'WUG': 'Bant',
    'WUB': 'Esper',
    'UBR': 'Grixis',
    'BRG': 'Jund',
    'RGW': 'Naya',
    'GWB': 'Abzan',
    'URW': 'Jeskai',
    'UBG': 'Sultai',
    'RWB': 'Mardu',
    'UGR': 'Temur',
    'WUBR': 'C16 Esper',
    'UBRG': 'C16 Grixis',
    'URGW': 'C16 Jeskai',
    'WGRU': 'C16 Bant',
    'WUBRG': 'Five-color',
}


def ensure_collection(document_path):
    try:
        doc_ref = firestore_client.document(document_path)
        doc_ref.create({})
    except Exception as e:
        pass  

def get_card_data(document_path):
    try:
        doc_ref = firestore_client.document(document_path)
        doc_data = doc_ref.get().to_dict()
        return doc_data
    except Exception as e:
        print(f"Error getting card data for {document_path}: {e}")
        return None

def extract_primary_type(type_line):
    return type_line.split(' ', 1)[0].lower()

def update_winners_losers_collections():
    ensure_collection("Biggest_winners")
    ensure_collection("Biggest_losers")

for percentage_change, card in winners:
        firestore_client.collection("Biggest_winners").document(card['id']).set(card, merge=True)

for percentage_change, card in losers:
        firestore_client.collection("Biggest_losers").document(card['id']).set(card, merge=True)

for cmc in range(0, 2): 
    page = 1

    while True:
        api_url = base_api_url.format(cmc=cmc, page=page)
        response = requests.get(api_url)

        if response.status_code == 200:
            card_data = response.json()
            cards_on_page = card_data.get('data', [])

            if not cards_on_page:
                print(f"No more cards to scan for cmc {cmc}.")
                break

            for card in cards_on_page:
                if card.get("legalities", {}).get("alchemy") == "legal":
                    continue

                colors = card.get('colors', [])
                card_cmc = str(card.get('cmc', 'Unknown'))

                # Use color_identity if colors are not available
                if not colors:
                    colors = card.get('color_identity', [])
                    # If still no colors, it's colorless
                    if not colors:
                        color_folder = '0_color'
                        color = 'colorless'
                    else:
                        # Dynamic folder structure for multi-colored cards
                        color_folder = f"{len(colors)}_color"
                        color = color_mapping.get(''.join(sorted(colors)), 'Unknown')

                else:
                    color_folder = color_mapping.get(''.join(sorted(colors)), 'Unknown')
                    color = color_folder 

                if len(colors) > 1:
                    color_folder = f"{len(colors)}_color"
                    color = color_mapping.get(''.join(sorted(colors)), 'Unknown')

                if len(colors) == 1:
                    color_folder = '1_color'
                    color = color_mapping.get(''.join(sorted(colors)), 'Unknown')

                # Extract the primary type from type_line
                card_type = extract_primary_type(card.get('type_line', 'Unknown'))

                document_path = f"All_Cards/{color_folder}/{color}/{cmc}/{card_type}/{card['id']}"

                db_card_data = get_card_data(document_path)

                if db_card_data is None:
                    percentage_change = 0
                else:
                    # Update the "type" field to be an array
                    card['type_line'] = card.get('type_line', '').split() if 'type_line' in card else []

                    current_price = card['prices']['usd']
                    previous_price = db_card_data.get('prices', {}).get('usd', 0)

                    if previous_price != 0 and previous_price != current_price:
                        percentage_change = ((float(current_price) - float(previous_price)) / float(previous_price)) * 100
                    else:
                        previous_price = current_price
                        percentage_change = 0

                ensure_collection(f"All_Cards/{color_folder}/{color}/{cmc}/{card_type}")

                firestore_client.collection(f"All_Cards/{color_folder}/{color}/{cmc}/{card_type}").document(card['id']).set(card, merge=True)

                if percentage_change > 0:
                    winners.append((percentage_change, card))
                    winners.sort(reverse=True)
                    winners = winners[:40]
                elif percentage_change < 0:
                    losers.append((percentage_change, card))
                    losers.sort()
                    losers = losers[:40]

                cards_inserted_count += 1

            page += 1
        else:
            break

update_winners_losers_collections()

print(f"{cards_inserted_count} documents inserted into Firestore.")
print(f"Top winners: {winners}")
print(f"Top losers: {losers}")

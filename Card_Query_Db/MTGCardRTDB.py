import requests
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import date, timedelta

# Need sdk key and its location to do this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/zakkilpatrick/Desktop/sinuous-vortex-411619-firebase-adminsdk-bw0qd-c1be07e436.json'

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://sinuous-vortex-411619-default-rtdb.firebaseio.com'
})

# Mapping of colors
color_mapping = {
    'W': 1,
    'U': 1,
    'B': 1,
    'R': 1,
    'G': 1,
}

base_api_url = "https://api.scryfall.com/cards/search"

def fetch_and_upload_cards(batch_size=10):
    page = 1

    while True:
        params = {
            "q": "game:paper",
            "page": page,
            "format": "json",
            "unique": "prints",
            "game": "paper"
        }
        response = requests.get(base_api_url, params=params)

        if response.status_code == 200:
            card_data = response.json()
            cards_on_page = card_data.get('data', [])

            if not cards_on_page:
                print(f"No more cards on page {page}.")
                break

            # Batch processing
            for i in range(0, len(cards_on_page), batch_size):
                batch = cards_on_page[i:i + batch_size]
                process_batch(batch)

            page += 1
        else:
            print(f"Error fetching cards. Status Code: {response.status_code}")
            break

def process_batch(cards):
    for card in cards:
        # Check if the card has a flip side
        if 'card_faces' in card:
            for face in card['card_faces']:
                print_extracted_data(face)
                upload_to_firestore(face)
        else:
            print_extracted_data(card)
            upload_to_firestore(card)

def print_extracted_data(card):
    # This function prints the extracted data for debugging purposes
    card_name = card.get("name", "Unnamed Card").strip()  # Remove leading and trailing spaces
    first_letter = card_name[0].lower()

    # Check if the card has double-sided faces
    if 'card_faces' in card:
        # Use the name of the first face as the card name
        card_name = card['card_faces'][0].get('name', card_name)

    # Replace "." in card name with a space
    card_name = card_name.replace(".", " ")

    # Remove or replace illegal characters in card name this is because firebase doesn't allow them
    # For example, replacing '?' and '!' with '_'
    card_name = card_name.replace("?", "_").replace("!", "_")

    # Get additional card details needed for actual db
    colors = card.get('colors', [])
    mana_cost = card.get("mana_cost", "N/A")
    converted_mana_cost = calculate_converted_mana_cost(mana_cost)
    type_line = card.get("type_line", "N/A").split(" — ")  # Convert type_line to array
    card_id = card.get("id")
    set_code = card.get("set")
    color_identity = card.get("color_identity")
    prices = {
        "usd": card.get("prices", {}).get("usd", None),
        "usd_foil": card.get("prices", {}).get("usd_foil", None),
        "usd_etched": card.get("prices", {}).get("usd_etched", None)
    }

    # print(f"Card Name: {card_name}")
    # print(f"Colors: {colors}")
    # print(f"Mana Cost: {mana_cost}")
    # print(f"Converted Mana Cost: {converted_mana_cost}")
    # print(f"Type of Card: {type_line}")
    # print(f"Card ID: {card_id}")
    # print(f"Set Code: {set_code}")
    # print(f"Color identity: {color_identity}")
    # print(f"Prices: {prices}")
    # print("-" * 30)

def upload_to_firestore(card):
    # This function uploads the card data to Firebase
    card_name = card.get("name", "Unnamed Card").strip()  # Remove leading and trailing spaces
    first_letter = card_name[0].lower()

    if 'card_faces' in card:
        card_name = card['card_faces'][0].get('name', card_name)

    card_name = card_name.replace(".", " ")
    card_name = card_name.replace("?", "_").replace("!", "_")
    card_name = card_name.replace("/", "-").replace("#", "-") 

    colors = card.get('colors', [])
    mana_cost = card.get("mana_cost", "N/A")
    converted_mana_cost = calculate_converted_mana_cost(mana_cost)
    type_line = card.get("type_line", "N/A").split(" — ")
    card_id = card.get("id")
    set_code = card.get("set")
    color_identity = card.get("color_identity")
    collector_num = card.get("collector_number")
    prices = {
        "usd": card.get("prices", {}).get("usd", None),
        "usd_foil": card.get("prices", {}).get("usd_foil", None),
        "usd_etched": card.get("prices", {}).get("usd_etched", None)
    }

    ref = db.reference(f"/mtg_names/{first_letter}/cards/{card_name}/{set_code}_{collector_num}")

    existing_card = ref.get()
    if existing_card:
        # print(f"Updating {card_name} in Firestore under /mtg_names/{first_letter}/cards.")
        # Compare and update prices
        compare_prices(card_name, set_code, prices, ref)  # Pass ref to update the data
    else:
        # print(f"Adding {card_name} to Firestore under /mtg_names/{first_letter}/cards.")
        ref.set({
            "name": card_name,
            "colors": colors,
            "mana_cost": mana_cost,
            "converted_mana_cost": converted_mana_cost,
            "type_of_card": type_line,
            "id": card_id,
            "set_code": set_code,
            "color_identity": color_identity,
            "prices": prices,
            "collector_number":collector_num
        })

        # print(f"Uploaded {card_name} to Firestore under /mtg_names/{first_letter}/cards.")

    # Store prices under Prices/All_cards/
    store_prices_all_cards(card_name, set_code, prices, collector_num)

def calculate_converted_mana_cost(mana_cost):
    # This function calculates the converted mana cost of a card
    total_cost = 0
    for char in mana_cost:
        if char.isdigit():
            total_cost += int(char)
        elif char in color_mapping:
            total_cost += color_mapping[char]
    
    return total_cost

def store_prices_all_cards(card_name, set_code, prices, collector_num):

    first_letter = card_name[0].lower()
    # This function stores prices for all cards
    ref = db.reference(f"/Prices/All_cards/{first_letter}/{card_name}/{set_code}_{collector_num}")

    # Get today's date
    today = date.today().isoformat()

    # Get existing prices
    existing_prices = ref.get() or {}

    # Add today's prices
    existing_prices[today] = {
        "usd": prices.get("usd", None),
        "usd_foil": prices.get("usd_foil", None),
        "usd_etched": prices.get("usd_etched", None),
        "set_name": set_code,
        "collector_number": collector_num,
    }

    # Add today's prices
    existing_prices[today] = prices

    # Keep prices for a week
    week_ago = (date.today() - timedelta(days=7)).isoformat()
    for date_key in list(existing_prices.keys()):
        if date_key < week_ago:
            del existing_prices[date_key]

    ref.set(existing_prices)

    # Compare today's prices with yesterday's prices and update top differences
    compare_and_update_top_differences(card_name, set_code, today, prices, existing_prices, collector_num)

def compare_and_update_top_differences(card_name, set_code, today, new_prices, existing_prices, collector_num):
    # This function compares and updates top differences in prices
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Get yesterday's prices
    yesterday_prices = existing_prices.get(yesterday, {})

    # Compare with yesterday's prices
    if yesterday_prices:
        for price_type, new_price in new_prices.items():
            if new_price is not None:
                yesterday_price = yesterday_prices.get(price_type, None)
                if yesterday_price is not None:
                    # Convert to floating-point numbers
                    new_price = float(new_price)
                    yesterday_price = float(yesterday_price)
                    
                    price_diff = new_price - yesterday_price
                    percentage_change = ((new_price - yesterday_price) / yesterday_price) * 100 if yesterday_price != 0 else 0

                    # Update top positive and negative differences
                    update_top_differences(card_name, set_code, price_type, price_diff, percentage_change, collector_num)

def update_top_differences(card_name, set_code, price_type, price_diff, percentage_change, collector_num):
    # This function updates top differences in prices
    positive_diff_ref = db.reference("/Prices/Top50/Positive")
    negative_diff_ref = db.reference("/Prices/Top50/Negative")

    positive_differences = positive_diff_ref.get() or []
    negative_differences = negative_diff_ref.get() or []

    if price_diff > 0:
        positive_differences.append({
            "card_name": card_name,
            "set_code": set_code,
            "price_type": price_type,
            "price_diff": price_diff,
            "percentage_change": percentage_change,
            "collector_number":collector_num
        })
        positive_differences = sorted(positive_differences, key=lambda x: x["price_diff"], reverse=True)[:50]
        positive_diff_ref.set(positive_differences)
    elif price_diff < 0:
        negative_differences.append({
            "card_name": card_name,
            "set_code": set_code,
            "price_type": price_type,
            "price_diff": price_diff,
            "percentage_change": percentage_change,
            "collector_number":collector_num
        })
        negative_differences = sorted(negative_differences, key=lambda x: x["price_diff"])[:50]
        negative_diff_ref.set(negative_differences)

def compare_prices(card_name, set_code, new_prices, ref):
    # This function compares new prices with existing prices and updates the database
    today = date.today().isoformat()

    # Get existing prices
    existing_prices = ref.get() or {}

    print(existing_prices)

    # Get yesterday's date
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Get yesterday's prices
    yesterday_prices = existing_prices.get(yesterday, {})

    # Compare with yesterday's prices
    if yesterday_prices:
        for price_type, new_price in new_prices.items():
            if new_price is not None:
                yesterday_price = yesterday_prices.get(price_type, None)
                if yesterday_price is not None:
                    new_price = float(new_price)
                    yesterday_price = float(yesterday_price)
                    price_diff = new_price - yesterday_price
                    percentage_change = ((new_price - yesterday_price) / yesterday_price) * 100 if yesterday_price != 0 else 0
                    print(f"{price_type} for {card_name} ({set_code}):")
                    print(f"  Yesterday: {yesterday_price}")
                    print(f"  Today: {new_price}")
                    print(f"  Change: {price_diff}")
                    print(f"  Percentage Change: {percentage_change:.2f}%")
                    print("-" * 30)

                    # Update in the card reference
                    update_card_prices(ref, price_type, today, new_price, price_diff, percentage_change)

def update_card_prices(ref, price_type, date, new_price, price_diff, percentage_change):
    # This function updates the card prices in the database
    ref.update({
        f"prices/{date}/{price_type}": new_price,
        f"price_diff/{date}/{price_type}": price_diff,
        f"percentage_change/{date}/{price_type}": percentage_change
    })


def weekly_top_winners_losers():
    # Function to find weekly top winners and losers
    today = date.today()

    # If today is not Sunday, exit function
    if today.weekday() != 6:  # Sunday is 6
        print("Today is not Sunday. Exiting function.")
        return

    # Get the date for last Sunday
    last_sunday = today - timedelta(days=today.weekday() + 7)
    last_sunday_str = last_sunday.isoformat()

    # Get prices for the last week
    ref = db.reference("/Prices/All_cards")
    all_cards_prices = ref.get() or {}

    # Filter out prices only for the last week
    prices_last_week = {}
    for card_name, card_prices in all_cards_prices.items():
        for date_key, prices in card_prices.items():
            date_obj = date.fromisoformat(date_key)
            if date_obj >= last_sunday:
                prices_last_week[card_name] = prices

    # Calculate the total change for each card in the last week
    card_changes = {}
    for card_name, card_prices in prices_last_week.items():
        total_change = 0
        for price_type, price_value in card_prices.items():
            if price_type != "percentage_change":  # Skip percentage_change
                total_change += price_value.get("usd", 0) - price_value.get("usd_foil", 0)
        card_changes[card_name] = total_change

    # Get top 50 winners and losers
    top_winners_losers = sorted(card_changes.items(), key=lambda x: x[1], reverse=True)
    top_winners = top_winners_losers[:50]
    top_losers = top_winners_losers[-50:]

    # Store the results in the database
    winners_ref = db.reference("/Prices/Top50Weekly/Winners")
    losers_ref = db.reference("/Prices/Top50Weekly/Losers")
    winners_ref.set(top_winners)
    losers_ref.set(top_losers)

    print("Weekly Top 50 Winners:")
    for i, (card, change) in enumerate(top_winners, start=1):
        print(f"{i}. {card} - Change: {change}")

    print("\nWeekly Top 50 Losers:")
    for i, (card, change) in enumerate(top_losers, start=1):
        print(f"{i}. {card} - Change: {change}")

if __name__ == "__main__":
    fetch_and_upload_cards()
    weekly_top_winners_losers()

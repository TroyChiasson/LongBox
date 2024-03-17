import csv

# Define the input CSV string (for demonstration purposes, replace this with your actual CSV string)
with open("cardData/cards.csv", 'r') as file:
    csv_data = file.read()

# Specify the columns to keep
columns_to_keep = ['name', 'setCode', 'uuid', 'colors', 'colorIdentity', 'manaCost', 'manaValue', 'finishes']

# Use StringIO to simulate reading from a file
from io import StringIO

# Simulate file reading and writing
input_file = StringIO(csv_data)
output_file = StringIO()  # This will store the output CSV data


# Create a CSV reader and writer
reader = csv.DictReader(csv_data)
writer = csv.DictWriter(output_file, fieldnames=columns_to_keep)

# Write the header to the output file
writer.writeheader()

# Iterate through each row in the input CSV, filter out the columns, and write to the output CSV
for row in reader:
    
    if 'nonfoil' in row['finishes'].lower():
        filtered_row = {key: row[key] for key in columns_to_keep}
        writer.writerow(filtered_row)

output = output_file.getvalue()
with open("cardData/cardsPertData.csv", 'w') as file:
    file.write(output)
# For demonstration, print the output CSV data
# print(output)

# Remember to close the StringIO objects if you're done with them
input_file.close()
output_file.close()

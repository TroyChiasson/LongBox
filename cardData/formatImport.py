import re
import csv

# Sample text data (replace this with reading from your actual text file)
with open("import.txt", 'r') as file:
    text = file.read()

# Regular expression to match card details
pattern = r'(\d+)\s+([^\[]+)\s+\[([^\]]+)\]'

# Open a new CSV file to write
with open('importFormatted.csv', 'w', newline='') as csvfile:
    # Define the CSV writer
    writer = csv.writer(csvfile)
    # Write the header row
    writer.writerow(['quantity', 'name', 'setCode'])
    
    # Process each line in the text data
    for line in text.split('\n'):
        # Skip the first line which contains the total
        if line.startswith('TOTAL'):
            continue
        
        # Search for matches using the regular expression
        match = re.search(pattern, line)
        if match:
            # Extract the matched groups
            quantity, name, setCode = match.groups()
            # Write the extracted details to the CSV file
            writer.writerow([quantity, name.strip(), setCode])

# Note: In a real scenario, replace `text_data` with reading from your text file.
# For example, use `with open('yourfile.txt', 'r') as file: text_data = file.read()`

from collections import Counter
import re

# Sample texts from your OCR runs
texts = []

with open("card_scans.txt", 'r') as file:
    scans = file.read()
    texts = scans.split("\n")

# Normalize and tokenize the text
def normalize_and_tokenize(text):
    # Convert to lowercase
    text = text.lower()
    # Remove non-alphanumeric characters (keep spaces and letters)
    text = re.sub(r'[^a-z\s]', '', text)
    # Split into words
    words = text.split()
    return words

# Count the frequency of each word across all texts
word_counts = Counter()
for text in texts:
    words = normalize_and_tokenize(text)
    word_counts.update(words)

# Determine the maximum frequency
max_frequency = word_counts.most_common(1)[0][1] if word_counts else 0

# Set an adaptive threshold as a fraction of the maximum frequency
adaptive_threshold = max_frequency * 0.5  # 50% of the maximum frequency

# Filter words based on the adaptive threshold
filtered_words = [word for word, count in word_counts.items() if count > adaptive_threshold]

# Display filtered words
print("Filtered words based on adaptive threshold:")
for word in filtered_words:
    print(word)

# Reconstruct the probable card name from filtered words
card_name = " ".join(filtered_words).strip('f')
print("\nProbable Card Name:", card_name)
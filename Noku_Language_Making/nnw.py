"""
    New Noku Words. (nnw.py)
    Nokutoka Momiji.

    This is just a script that allows me to add new words I make with pre-existing ones in order to make it easier
    for me to add them to the dictionary document.

    Serves no real purpose for most people but yeah.
    Maybe ya can learn something from my very bad, written-in-less-than-an-hour code.
"""
import json
from os import system

system("cls") # Yeah, I use Windows. Don't @ me.

# Paths to the files. You might need to change them.
DATA_PATH: str = "data.json"
NEW_WORDS_PATH: str = "NewWords.txt"

# Dictionaries to store the data.
word_data: dict[str] = {}
new_word_data: dict[str] = {}

# Info stored as a JSON File.
with open(DATA_PATH, "r", encoding="utf-8") as data:
    word_data = json.load(data)

with open(NEW_WORDS_PATH, "r", encoding="utf-8") as new_words:
    for num, line in enumerate(new_words):
        # I store new words in the following format: Definition -> Word
        # So we split using the " -> "
        line_data: list[str] = line.replace("\n", "").split(" -> ")

        # Sometimes I have words I have not made the translation for. So we skip them and give a reminder
        #   that it still hasn't been added.
        if len(line_data) < 2:
            print(f"[ERROR]: Missing data in line {num}: {line_data}")
            continue
        
        # Check if the word already exists. Maybe I add an extra definition, so...
        if line_data[1] not in new_word_data.keys():
            new_word_data[line_data[1]] = []

        # Add definition to word definition list.
        new_word_data[line_data[1]].append(line_data[0])
        print("Added word \"" + line_data[1] + " | " + line_data[0])

print(new_word_data)
# Merging new words with existing words so that I can make the full list.
# I could just export the new words, but I want to have some reference of where they go on the dictionary.
for word in new_word_data:
    # Data stored in the data.json file by my "nlutil" script (you should check if out if you're interested
    # in parsing) is stored following the following hierarchy:
    #   Letter -> List of Words -> Individual Word Data.
    # So, I just grab the first letter of the word and use it as the letter key.
    letter = word[0].upper()
    letter_sect = word_data[letter]
    print(f"Letter: {letter}")

    # Creating the word data. The examples array is empty because examples are added manually on the Google Docs
    # document. There is no need for it right now.
    # Also, I know that most verbs will start with "to" at the beginning.
    # So, I can add the verb thing and save a bit of typing.
    letter_sect["words"].append({"word": word, "type": ("Verb" if word.lower().startswith("to") else "-"), "definitions": new_word_data[word], "examples": []})

# Export data into txt file.
# Using utf-8 for now. Damn you Python and the ANSI standard.
with open("export.txt", "w", encoding="utf-8") as export_file:
    for letter in word_data:
        export_file.write("[============================================]\n")
        words = word_data[letter]["words"]
        
        # I want the dictionary to be in alphabetical order, but doing that manually is very time-consuming
        # Plus, I can make mistakes. So, I just leave it to Python to sort the words out for export.
        words = sorted(words, key=lambda _words: _words["word"].lower())
        in_new = False  # Little flag for headers.
        for word in words:
            # In order to easily sort the new words from already existing ones, I add these little section
            # headers.
            if word["word"] in new_word_data.keys() and in_new == False:
                export_file.write("[============[START OF NEW]============]\n")
                in_new = True
            elif word["word"] not in new_word_data.keys() and in_new == True:
                export_file.write("[=============[END OF NEW]=============]\n")
                in_new = False
            
            # Whenever I dunno how to name a variable or the variable name I want is already in use, I just add "the_"
            # at the beginning. It's kinda funny.
            the_word = word["word"]
            the_type = word["type"]
            the_defs = word["definitions"]
            print(f"Writing {the_word} ({the_type}):")
            export_file.write(f"{the_word} ({the_type}): ")
            # Could use a range with the list length, but this is easier and just gives me immediate access to
            # what I need.
            for _index, _def in enumerate(the_defs):
                print(f"    - {_index}: \"{_def}\"")
                # This is just to properly write the definitions. I don't want a remaining comma and space that
                # aren't needed. It just looks bad.
                if _index != len(the_defs) - 1:
                    export_file.write(f"\"{_def}\", ")
                else:
                    export_file.write(f"\"{_def}\"\n")

print("Exported.")
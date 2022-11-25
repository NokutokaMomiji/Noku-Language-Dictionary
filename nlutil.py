import json
import gdown
import pypandoc
import os
import socket
import traceback

def create_nonexistent_directory(directory_name: str) -> None:
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)

def open_file_to_list(file_path: str) -> list:
    # Currently using utf-8.
    with open(file_path, "r", encoding="utf-8") as data_file:
        return data_file.readlines()

def load_saved_data():
    with open("build/data.json") as stored_data_file:
        return json.load(stored_data_file)

def array_remove_empty_lines(array: list) -> list:
    final_array = []
    for index in range(len(array)):
        line = array[index]

        # Remove new lines and replace the weird quotation marks with the standard ones.
        line = line.replace("\n", "")
        line = line.replace("“", "\"")
        line = line.replace("”", "\"")

        # Check if string is empty by removing special characters.
        if len(''.join(char for char in line if char not in ["\n", "_"]).replace("\n", "")) == 0:
           continue
        
        # Line is clear, so we add it to our final array.
        final_array.append(line) 
    return final_array

def word_info_to_dict(info_line: str) -> dict:
    # Words and their definitions are stored in the following format:
    #   Word (Type): "Definitions..."
    # So we split them by the colon.
    line_contents = info_line.split(":")

    word = ""
    word_type = ""
    word_definitions = []
    current_definition = ""
    in_quotations = False

    in_word = True
    in_info = False

    # Reading word and type.
    for char in line_contents[0]:
        if char != "(" and in_word and char != " ":
            word += char
            continue
        
        if char == "(" and in_word:
            in_word = False
            in_info = True
            continue

        if char != ")" and in_info:
            word_type += char
            continue

        if char == ")" and in_info:
            in_info = False

    # Reading definitions and adding them to a definitions array.
    for char in line_contents[1]:
        if char == " " and not in_quotations:
            continue

        if char == "\"":
            in_quotations = not in_quotations
            continue

        if (char == "," and in_quotations) or char != ",":
            current_definition += char
            continue
        
        if char == "," and not in_quotations:
            word_definitions.append(current_definition)
            print(f"Current Definition: {current_definition}")
            current_definition = ""

    # Appending residue.
    word_definitions.append(current_definition)
    print(f"Current Definition: {current_definition}")

    print(f"Word: \"{word}\"")
    print(f"Type: \"{word_type}\"")
    print(f"Definitions: \"{word_definitions}\"")
    return {"word": word, "type": word_type, "definitions": word_definitions}

def can_advance_index(index: int, limit: int) -> bool:
    return ((index + 1) < limit)

def parse_words_to_json(file_path: str) -> dict:
    print("[JSON Parser]: Parsing to JSON...")
    SEPARATOR = "________________"

    content = open_file_to_list(file_path)
    content = array_remove_empty_lines(content)

    print(content)
    data_dict = {}
    current_letter = ""
    content_length = len(content)
    index = 0

    print(f"[JSON Parser]: There are {content_length} lines.")

    while index < content_length:
        line = content[index]
        print(f"[JSON Parser]: Current index: {index}")
        print(f"[JSON Parser]: Current line: {line}")
        print(f"[JSON Parser]: Current line length: {len(line)}")
        print("[JSON Parser]: Is letter: ", line in ["ABCDEFGHIJKLMNOPQRSTUVWXYZ"])
        # Probably a letter, which indicates a new section.
        if len(line) == 1:
            print("[JSON Parser]: Line is separator.")
            current_letter = line
            print(f"[JSON Parser]: New letter '{current_letter}'")
            if not can_advance_index(index, content_length):
                break
            index += 1
            print("[JSON Parser]: Creating new dictionary.")
            data_dict[current_letter] = {}
            data_dict[current_letter]["description"] = content[index]
            data_dict[current_letter]["words"] = []
            temp = data_dict[current_letter]["description"]
            print(f"[JSON Parser]: Letter Description: \"{temp}\".")
            index += 1
            continue
        
        if current_letter == "":
            index += 1
            continue

        # Examples are automatically extracted after finding the definition for a word. 
        # So, if we find ourselves at an example, it is orphan and an error.
        # So, we report it.
        if line[:2].lower() == "ex":
            print(f"[ERROR]: Orphan example \"{line}\".")
            index += 1
            continue

        word_info = word_info_to_dict(line)
        word_info["examples"] = []
        if not can_advance_index(index, content_length):
            break
        index += 1
        line = content[index]
        line_length = len(line)

        while line[:3].lower() == "ex:":
            in_english = True
            skip_spaces = True
            current_example = ""
            subindex = 4

            while subindex < line_length:
                char = line[subindex]
                next_char = ""
                if can_advance_index(subindex, line_length):
                    next_char = line[subindex + 1]

                if char == " " and skip_spaces:
                    if not can_advance_index(subindex, line_length):
                        break
                    subindex += 1
                    continue
                
                if char == "-" and next_char == ">":
                    word_info["examples"].append(current_example)
                    print(f"current_example: {current_example}")
                    current_example = ""
                    if not can_advance_index(subindex, line_length):
                        break
                    subindex += 3
                    skip_spaces = True
                    continue

                if char != " " or (char == " " and not skip_spaces and next_char != "-"):
                    skip_spaces = False
                    current_example += char

                if not can_advance_index(subindex, line_length):
                    break

                subindex += 1
            print(f"current_example: \"{current_example}\"")
            word_info["examples"].append(current_example)
            if not can_advance_index(index, content_length):
                break
            index += 1
            line = content[index]
            line_length = len(line)

        print(f"Remaining line: {line}")
        print(f"Removing line.")
        index -= 1

        data_dict[current_letter]["words"].append(word_info)
        if not can_advance_index(index, content_length):
            break
        index += 1

    return data_dict
  

if __name__ == "__main__":
    print("======[Noku Language]======")
    print(" · For official document, check the following link: ")
    print("   -> https://docs.google.com/document/d/1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx/edit?usp=sharing&ouid=113385481694575437883&rtpof=true&sd=true")
    
    create_nonexistent_directory("src")
    create_nonexistent_directory("build")
    create_nonexistent_directory("build/html")

    URL = "https://drive.google.com/uc?id=1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx"
    
    TEMP_NAME = "src/temp.docx"
    OUTPUT_NAME = "src/noku_language_words.txt"
    DATA_NAME = "build/data.json"
    BACKUP_NAME = "src/backup.txt"

    exported_data = {}

    try:
        print("[Info]: Downloading online dictionary.")
        gdown.download(URL, TEMP_NAME, quiet=False)

        pypandoc.ensure_pandoc_installed()
        pypandoc.convert_file(TEMP_NAME, "plain", outputfile=OUTPUT_NAME)
    except socket.gaierror:
        print("[ERROR]: (11001) Failed to get address info.")
        with open("traceback.txt", "w") as tb_file:
            tb_file.write(traceback.format_exc())

        print("[ERROR]: Traceback exported.")
    except:
        print("[ERROR]: An error ocurred while downloading the data from the online version.")
        with open("traceback.txt", "w") as tb_file:
            tb_file.write(traceback.format_exc())

        print("[ERROR]: Traceback exported.")
    finally:
        if os.path.exists(DATA_NAME):
            print("[Info]: Data file detected. Loading...")
            exported_data = load_saved_data()
        elif os.path.exists(BACKUP_NAME):
            print("[Info]: Backup file detected. Parsing...")
            exported_data = parse_words_to_json(BACKUP_NAME)
        else:
            print("[ERROR]: Data file not found. Exiting...")
            exit(1)
   

    try:
        if len(exported_data) == 0:
            exported_data = parse_words_to_json(OUTPUT_NAME)
    except:
        print("[ERROR]: An error ocurred while parsing the data from the online version.")
        if os.path.exists(DATA_NAME):
            print("[Info]: Data file detected. Loading...")
            exported_data = load_saved_data()
        elif os.path.exists(BACKUP_NAME):
            print("[Info]: Backup file detected. Parsing...")
            exported_data = parse_words_to_json(BACKUP_NAME)
        else:
            print("[ERROR]: Data file not found. Exiting...")
            exit(1)
    

    with open(DATA_NAME, "w") as export_data:
        json.dump(exported_data, export_data)

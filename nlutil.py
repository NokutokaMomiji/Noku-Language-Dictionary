import json
import gdown
import pypandoc
import os
import socket
import traceback
import time
import calendar

log = []

def clog(info: type):
    log.append(str(info) + "\n")
    print(str(info))

def clog_export():
    with open("process.log", "w", encoding="utf-8") as log_file:
        log_file.writelines(log)

def create_nonexistent_directory(directory_name: str) -> None:
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)

def open_file_to_list(file_path: str) -> list:
    # Currently using utf-8.
    with open(file_path, "r", encoding="utf-8") as data_file:
        return data_file.readlines()

def load_saved_data(data_path):
    with open(data_path) as stored_data_file:
        return json.load(stored_data_file)

def array_remove_empty_lines(array: list) -> list:
    final_array = []
    for index in range(len(array)):
        line = array[index]

        # Remove new lines and replace the weird quotation marks with the standard ones.
        line = line.replace("\n", "")
        line = line.replace("        ", "")
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
    in_parenthesis = False

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

        if char == "\"" and not in_parenthesis:
            in_quotations = not in_quotations
            continue

        if char == "(":
            in_parenthesis = True
            current_definition += char
            continue

        if char == ")":
            in_parenthesis = False
            current_definition += char
            continue
        
        if (char == "," and in_quotations and not in_parenthesis) or char != ",":
            current_definition += char
            continue
        
        if char == "," and not in_quotations:
            word_definitions.append(current_definition)
            clog(f"Current Definition: {current_definition}")
            current_definition = ""

    # Appending residue.
    word_definitions.append(current_definition)
    clog(f"Current Definition: {current_definition}")

    if word_type == "" or word_type == " ":
        word_type = "-"

    clog(f"Word: \"{word}\"")
    clog(f"Type: \"{word_type}\"")
    clog(f"Definitions: \"{word_definitions}\"")
    return {"word": word, "type": word_type, "definitions": word_definitions}

def can_advance_index(index: int, limit: int) -> bool:
    return ((index + 1) < limit)

def parse_words_to_json(file_path: str, metadata: dict) -> dict:
    clog("[JSON Parser]: Parsing to JSON...")
    SEPARATOR = "________________"

    content = open_file_to_list(file_path)
    content = array_remove_empty_lines(content)

    #clog(content)
    data_dict = {}
    current_letter = ""
    content_length = len(content)
    index = 0

    clog(f"[JSON Parser]: There are {content_length} lines.")

    metadata["num_of_words"] = 0
    metadata["timestamp"] = calendar.timegm(time.gmtime()) #time.time() #datetime.timestamp(datetime.now())

    while index < content_length:
        line = content[index]
        clog(SEPARATOR)
        clog(f"[JSON Parser]: Current index: {index}")
        clog(f"[JSON Parser]: Current line: \"{line}\".")
        clog(f"[JSON Parser]: Current line length: {len(line)}")
        clog("[JSON Parser]: Is letter: " + str(line in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
        # A work around. I really should figure out why this happens.
        if line == "consonant.":
            data_dict[current_letter]["description"] += " " + line
            continue

        # Probably a letter, which indicates a new section.
        if len(line) == 1 and line in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
            clog("[JSON Parser]: Line is separator.")
            current_letter = line
            clog(f"[JSON Parser]: New letter '{current_letter}'")
            if not can_advance_index(index, content_length):
                break
            index += 1
            clog("[JSON Parser]: Creating new dictionary.")
            data_dict[current_letter] = {}
            data_dict[current_letter]["description"] = content[index]
            data_dict[current_letter]["words"] = []
            temp = data_dict[current_letter]["description"]
            clog(f"[JSON Parser]: Letter Description: \"{temp}\".")
            index += 1
            continue
        
        if current_letter == "":
            index += 1
            continue

        # Examples are automatically extracted after finding the definition for a word. 
        # So, if we find ourselves at an example, it is orphan and an error.
        # So, we report it.
        if line[:2].lower() == "ex" and current_letter != "":
            clog(f"[ERROR]: Orphan example \"{line}\".")
            index += 1
            continue
        elif line[:2].lower() == "ex" and current_letter == "":
            continue

        word_info = word_info_to_dict(line)
        metadata["num_of_words"] += 1
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
                clog("Skip spaces: " + str(skip_spaces))
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
                    clog(f"current_example: {current_example}")
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
            clog(f"current_example: \"{current_example}\"")
            word_info["examples"].append(current_example)
            if not can_advance_index(index, content_length):
                break
            index += 1
            line = content[index]
            line_length = len(line)

        clog(f"Remaining line: {line}")
        clog(f"Removing line.")
        index -= 1

        data_dict[current_letter]["words"].append(word_info)
        if not can_advance_index(index, content_length):
            break
        index += 1

    try:
        os.remove("src/noku_language_words.txt")
    except:
        clog("Failed to remove txt file.")

    clog("CONVERSION FINISHED!")
    return data_dict
  

if __name__ == "__main__":
    clog("======[Noku Language]======")
    clog(" · For official document, check the following link: ")
    clog("   -> https://docs.google.com/document/d/1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx/edit?usp=sharing&ouid=113385481694575437883&rtpof=true&sd=true")
    
    create_nonexistent_directory("src")
    create_nonexistent_directory("docs")
    create_nonexistent_directory("docs/data")

    URL = "https://drive.google.com/uc?format=txt&id=1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx"
    
    URL = "https://docs.google.com/document/u/0/export?format=txt&id=1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx&token=AC4w5Vjof-bYw24DXGihuEPY71rZLN781g%3A1670151312967&includes_info_params=true&cros_files=false&inspectorResult=%7B%22pc%22%3A59%2C%22lplc%22%3A19%7D"

    OUTPUT_NAME = "src/noku_language_words.txt"
    DATA_NAME = "docs/data/data.json"
    METADATA_NAME = "docs/data/metadata.json"
    BACKUP_NAME = "src/backup.txt"

    exported_data = {}
    metadata = {}
    exception_happened = False
    try:
        clog("[Info]: Downloading online dictionary.")
        gdown.download(URL, OUTPUT_NAME, quiet=False)
    except socket.gaierror:
        exception_happened = True
        clog("[ERROR]: (11001) Failed to get address info.")
        with open("traceback.txt", "w") as tb_file:
            tb_file.write(traceback.format_exc())

        clog("[ERROR]: Traceback exported.")
    except:
        exception_happened = True
        clog("[ERROR]: An error ocurred while downloading the data from the online version.")
        with open("traceback.txt", "w") as tb_file:
            tb_file.write(traceback.format_exc())

        clog("[ERROR]: Traceback exported.")

    if exception_happened:
        if os.path.exists(DATA_NAME):
            clog("[Info]: Data file detected. Loading...")
            exported_data = load_saved_data(DATA_NAME)
        elif os.path.exists(BACKUP_NAME):
            clog("[Info]: Backup file detected. Parsing...")
            exported_data = parse_words_to_json(BACKUP_NAME, metadata)
        else:
            clog("[ERROR]: Data file not found. Exiting...")
            exit(1)
   

    try:
        if len(exported_data) == 0:
            exported_data = parse_words_to_json(OUTPUT_NAME, metadata)
    except:
        clog("[ERROR]: An error ocurred while parsing the data from the online version.")
        clog(traceback.format_exc())
        with open("traceback.txt", "w") as tb_file:
            tb_file.write(traceback.format_exc())

        clog("[ERROR]: Traceback exported.")

        if os.path.exists(DATA_NAME):
            clog("[Info]: Data file detected. Loading...")
            exported_data = load_saved_data(DATA_NAME)
        elif os.path.exists(BACKUP_NAME):
            clog("[Info]: Backup file detected. Parsing...")
            exported_data = parse_words_to_json(BACKUP_NAME, metadata)
        else:
            clog("[ERROR]: Data file not found. Exiting...")
            exit(1)
    

    with open(DATA_NAME, "w") as export_data:
        json.dump(exported_data, export_data)

    with open(METADATA_NAME, "w") as export_metadata:
        json.dump(metadata, export_metadata)

    clog("Dumped data.")
    clog_export()

import json

def open_file_to_list(file_path: str) -> list:
    with open(file_path, "r", encoding="utf-8") as data_file:
        return data_file.readlines()

def array_remove_empty_lines(array: list) -> list:
    for index in range(len(array)):
        line = array[index]
        line = str.replace("\n", "")
        if len(''.join(char for char in line if line.isalnum())) == 0:
            array.pop(index)
    return array

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

    for char in line_contents[0]:
        if char != "(" and in_word:
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

    for char in line_contents[1]:
        if char == " " and not in_quotations:
            continue

        if char == "\"":
            in_quotations = not in_quotations
            continue

        if char == "," and in_quotations:
            current_definition += char
            continue
        
        if char == "," and not in_quotations:
            word_definitions.append(current_definition)
            current_definition = ""

    return {"word": word, "type": word_type, "definitions": word_definitions}
    
        

def parse_words_to_json() -> dict:
    print("Running...")
    SEPARATOR = "________________"

    content = open_file_to_list("src/noku_language_words.txt")
    
    print(content)
    array_remove_empty_lines(content)

    data_dict = {}
    current_letter = "A"

    for index in range(len(content)):
        line = content[index]
        print("line: ", line)
        # Separators indicate the beginning of a new section of words.
        if line == SEPARATOR:
            index += 1
            current_letter = content[index]
            index += 1
            data_dict[current_letter]["description"] = content[index]
            data_dict[current_letter]["words"] = []
            continue
        
        # Examples are automatically extracted after finding the definition for a word. 
        # So, if we find ourselves at an example, it is orphan and an error.
        # So, we report it.
        if line[:2].lower() == "ex":
            print(f"[ERROR]: Orphan example \"{line}\".")
            continue

        word_info = word_info_to_dict(line)
        word_info["examples"] = []

        index += 1
        line = content[index]

        while line[:2].lower() == "ex":
            in_english = True
            skip_spaces = True
            current_example = ""

            for subindex in range(3, len(line)):
                char = line[subindex]
                if char == " " and skip_spaces:
                    continue
                
                if char == "-" and line[subindex + 1] == ">":
                    word_info["examples"].append(current_example)
                    current_example = ""
                    subindex += 1
                    continue

                if char != " " or (char == " " and not skip_spaces):
                    skip_spaces = False
                    current_example += ""

            word_info["examples"].append(current_example)

        data_dict[current_letter]["words"].append(word_info)

    return data_dict
        

if __name__ == "__main__":
    print("======[Noku Language]======")
    print(" · For official document, check the following link: ")
    print("   -> https://docs.google.com/document/d/1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx/edit?usp=sharing&ouid=113385481694575437883&rtpof=true&sd=true")

    exported_data = parse_words_to_json()
#as
    with open("data.json", "w") as export_data:
        json.dump(exported_data, export_data)

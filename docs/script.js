var dictionaryData = {};

fetch("data/data.json").then(response => response.json())
                       .then(data => Setup(data))
                       .catch(error => console.error(error));

console.log(dictionaryData);

function Setup(data) {
    dictionaryData = data;
    setLetterList();
    setWordList();
    setWordPage();
}

function getLetters() {
    return Object.keys(dictionaryData);
}

function setLetterList() {
    console.log(dictionaryData);
    if (dictionaryData.length == 0) {
        return setLetterList();
    }

    var letters = getLetters();
    var letterList = document.getElementById("letter-list");

    if (letterList == undefined) {
        return;
    }

    for (var i = 0; i < letters.length; i++) {
        var newItem = document.createElement("li");
        var newItemLink = document.createElement("a");
        newItemLink.textContent = letters[i];
        newItemLink.href = "words.html?letter=" + letters[i];
        newItem.appendChild(newItemLink);
        letterList.appendChild(newItem);
    }
}

function getDictionary() {
    return dictionaryData;
}

function setWordList() {
    var letter = new URLSearchParams(window.location.search).get("letter");
    if (letter == null) {
        console.error("Letter returned null.");
        return setWordList();
    }

    var words = dictionaryData[letter]["words"];
    var wordTitle = document.getElementById("current-letter");
    var wordDescription = document.getElementById("letter-description");
    var wordList = document.getElementById("word-list");

    if (wordTitle == undefined || wordDescription == undefined || wordList == undefined) {
        return;
    }

    document.title = "Noku Language - " + letter;
    wordTitle.innerText = letter;
    wordDescription.innerText = dictionaryData[letter]["description"];
    console.log(words);
    for (var i = 0; i < words.length; i++) {
        var newWord = document.createElement("li");
        var newWordLink = document.createElement("a");
        var newWordSpan = document.createElement("span");
        newWordSpan.textContent = "(" + words[i]["type"] + ")";
        newWordLink.textContent = words[i]["word"] + " ";
        newWordLink.href = "word.html?letter=" + letter + "&word=" + words[i]["word"];
        newWordLink.appendChild(newWordSpan);
        newWord.appendChild(newWordLink);
        wordList.appendChild(newWord);
    }
}

function setWordPage() {
    var letter = new URLSearchParams(window.location.search).get("letter");
    var word = new URLSearchParams(window.location.search).get("word");
    var words = dictionaryData[letter]["words"];
    var wordData = undefined;

    var wordTitle = document.getElementById("word-title");
    var wordType = document.getElementById("word-type");
    var possibleVerbForms = document.getElementById("possible-verb-forms");
    var wordDefinitions = document.getElementById("word-definitions");
    var wordExamples = document.getElementById("word-examples");
    var contentBefore = document.getElementById("before-text");
    var contentAfter = document.getElementById("after-text");

    for (var i = 0; i < words.length; i++) {
        if (words[i]["word"] == word) {
            wordData = words[i];
            wordTitle.textContent = word;
            wordType.textContent = wordData["type"];
            if (wordData["type"].includes("Verb")) {
                possibleVerbForms.innerHTML = "Past: <span>" + word + "anon" + "</span> | Future: <span>" + word + "rian" + "</span> | Imperative: <span>" + word.slice(0, 2) + word.toLowerCase() + "</span>"
            }
            for (var n = 0; n < wordData["definitions"].length; n++) {
                var newDefinition = document.createElement("li");
                newDefinition.textContent = "\"" + wordData["definitions"][n] + "\"";
                wordDefinitions.appendChild(newDefinition);
            }

            for (var n = 0; n < wordData["examples"].length; n++) {
                var newExample = document.createElement("li");
                var newBreak = document.createElement("br");
                var newTranslated = document.createElement("span");
                newTranslated.textContent = wordData["examples"][n];
                if (n + 1 < wordData["examples"].length) {
                    newExample.textContent = wordData["examples"][++n];
                }

                newExample.appendChild(newBreak)
                newExample.appendChild(newTranslated);
                wordExamples.appendChild(newExample);
            }

            if (i != 0) {
                contentBefore.textContent = words[i - 1]["word"];
                contentBefore.href = "word.html?letter=" + letter + "&word=" + words[i - 1]["word"];
            }
            else {
                contentBefore.remove();
            }
            
            if (i != words.length - 1) {
                contentAfter.textContent = words[i + 1]["word"];
                contentAfter.href = "word.html?letter=" + letter + "&word=" + words[i + 1]["word"];
            }
            else {
                contentAfter.remove();
            }

            break;
        }
    }
}
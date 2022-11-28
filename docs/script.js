var dictionaryData = {};

fetch("data/data.json").then(response => response.json())
                       .then(data => dictionaryData = data)
                       .catch(error => console.error(error));

console.log(dictionaryData);

function getLetters() {
    return Object.keys(dictionaryData);
}

function setLetterList() {
    var letters = getLetters();
    var letterList = document.getElementById("letter-list");
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
        return;
    }

    var words = dictionaryData[letter]["words"];
    var wordTitle = document.getElementById("current-letter");
    var wordDescription = document.getElementById("letter-description");
    var wordList = document.getElementById("word-list");
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
}
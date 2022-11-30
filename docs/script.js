var dictionaryData = {};
var hasLoaded = false;

fetch("data/data.json").then(response => response.json())
                       .then(data => Setup(data))
                       .catch(error => console.error(error));

console.log(dictionaryData);

function Setup(data) {
    console.log("Setup called!")
    dictionaryData = data;
    setLetterList();
    setWordList();
    setWordPage();
    hasLoaded = true;
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
        return;
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

    if (letter == undefined || word == undefined) {
        return;
    }

    var words = dictionaryData[letter]["words"];
    var wordData = undefined;

    var wordTitle = document.getElementById("word-title");
    var wordType = document.getElementById("word-type");
    var possibleVerbForms = document.getElementById("possible-verb-forms");
    var wordDefinitions = document.getElementById("word-definitions");
    var wordExamples = document.getElementById("word-examples");
    var contentBefore = document.getElementById("content-before");
    var contentAfter = document.getElementById("content-after");
    var beforeText = document.getElementById("before-text");
    var afterText = document.getElementById("after-text");

    for (var i = 0; i < words.length; i++) {
        if (words[i]["word"] == word) {
            wordData = words[i];
            wordTitle.textContent = word;
            wordType.textContent = wordData["type"];
            if (wordData["type"].includes("Verb")) {
                possibleVerbForms.innerHTML = "Past: <span>" + word + ((word.endsWith("a")) ? "non" : "anon") + "</span> | Future: <span>" + word + "rian" + "</span> | Imperative: <span>" + word.slice(0, 2) + word.toLowerCase() + "</span>"
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
            
            var backArrow = "<ion-icon name=\"chevron-back\"></ion-icon> ";
            var forwardArrow = " <ion-icon name=\"chevron-forward\"></ion-icon>";

            if (i != 0) {
                beforeText.innerHTML = backArrow + words[i - 1]["word"];
                beforeText.href = "word.html?letter=" + letter + "&word=" + words[i - 1]["word"];
            }
            else {
                contentBefore.innerHTML = "";
                contentBefore.remove();
            }
            
            if (i != words.length - 1) {
                afterText.innerHTML = words[i + 1]["word"] + forwardArrow;
                afterText.href = "word.html?letter=" + letter + "&word=" + words[i + 1]["word"];
            }
            else {
                contentAfter.innerHTML = "";
                contentAfter.remove();
            }

            break;
        }
    }
}

function onlySpaces(str) {
    return str.trim().length === 0;
}

function fullSearch() {
    fullSearchData("full-search-input", "matching-noku", "matching-english", "no-matches-noku", "no-matches-english");
}

function fullSearchMobile() {
    fullSearchData("full-search-input-mobile", "matching-noku-mobile", "matching-english-mobile", "no-matches-noku-mobile", "no-matches-english-mobile");
}

function fullSearchData(search_bar, matching_noku, matching_english, no_matches_noku, no_matches_english) {
    console.log("Full Search Called...")
    if (!hasLoaded) {
        console.log("Dictionary Data hasn't loaded yet.")
        return;
    }
    const searchBar = document.getElementById(search_bar);
    console.log("Search Bar Value: \"" + searchBar.value + "\"");

    document.getElementById("full-search-input").value = searchBar.value;
    document.getElementById("full-search-input-mobile").value = searchBar.value;

    const matchingNokuList = document.getElementById(matching_noku);
    const matchingEnglishList = document.getElementById(matching_english);
    const noMatchesNoku = document.getElementById(no_matches_noku);
    const noMatchesEnglish = document.getElementById(no_matches_english);
    const didntFind = document.getElementById("didnt-find");

    const letters = getLetters();

    matchingNokuList.innerHTML = "";

    matchingEnglishList.innerHTML = "";

    if (onlySpaces(searchBar.value) || searchBar.value == "") {
        console.log("Empty.")
        noMatchesNoku.style.display = "initial";
        noMatchesEnglish.style.display = "initial";
        didntFind.style.display = "block";
        return;
    }

    var matchedNoku = false;

    for (var i = 0; i < letters.length; i++) {
        var words = dictionaryData[letters[i]]["words"];
        for (var n = 0; n < words.length; n++) {
            var currentWordData = words[n];

            if (currentWordData["word"].toLowerCase().startsWith(searchBar.value.toLowerCase())) {
                var newSearchItem = document.createElement("li");
                var newSearchLink = document.createElement("a");
                newSearchLink.innerHTML = currentWordData["word"] + " <span>(" + currentWordData["type"] + ")</span>";
                newSearchLink.href = "word.html?letter=" + letters[i] + "&word=" + currentWordData["word"];
                newSearchItem.appendChild(newSearchLink);
                matchingNokuList.appendChild(newSearchItem);

                matchedNoku = true;
            }
        }
    }

    if (!matchedNoku) {
        noMatchesNoku.style.display = "initial";
        //didntFind.style.display = "block";
    }
    else {
        noMatchesNoku.style.display = "none";
        //didntFind.style.display = "none";
    }

    var matchedEnglish = false;

    for (var i = 0; i < letters.length; i++) {
        var words = dictionaryData[letters[i]]["words"];
        for (var n = 0; n < words.length; n++) {
            var currentWordData = words[n];

            for (var j = 0; j < currentWordData["definitions"].length; j++) {
                var currentDefinition = currentWordData["definitions"][j];

                if (new RegExp("\\b" + searchBar.value.toLowerCase() + "\\b").test(currentDefinition.toLowerCase()) || currentDefinition.toLowerCase().startsWith(searchBar.value.toLowerCase())) {
                    console.log("Match: " + currentDefinition);
                    var newSearchItem = document.createElement("li");
                    var newSearchLink = document.createElement("a");
                    newSearchLink.innerHTML = currentWordData["word"] + " <span>(" + currentWordData["type"] + ")</span>  -> <span>\"" + currentDefinition + "\"</span>";
                    newSearchLink.href = "word.html?letter=" + letters[i] + "&word=" + currentWordData["word"];
                    newSearchItem.appendChild(newSearchLink);
                    matchingEnglishList.appendChild(newSearchItem);

                    matchedEnglish = true;
                }
            }
        }
    }

    if (!matchedEnglish) {
        noMatchesEnglish.style.display = "initial";
        //didntFind.style.display = "block";
    }
    else {
        noMatchesEnglish.style.display = "none";
        //didntFind.style.display = "none";
    }
}

function smallSearch() {
    
}
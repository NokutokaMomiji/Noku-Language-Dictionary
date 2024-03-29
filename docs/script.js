/*
    script.js
    Nokutoka Momiji
    
    Copyright (C) 2023 Nokutoka Momiji

    This is the single JavaScript file that powers the entire Noku Language Dictionary webpage.
    It is a huge undocumented mess. Enjoy!  qs
*/

var dictionaryData = {};
var Metadata = {};
var hasLoaded = false;
var hasLoadedMeta = false;

fetch("data/data.json").then(response => response.json())
                       .then(data => Setup(data))
                       .catch(error => console.error(error));

fetch("data/metadata.json").then(response => response.json())
                        .then(data => otherSetup(data))
                        .catch(error => console.error(error));

console.log(dictionaryData);

function otherSetup(data) {
    console.log("Other Setup Called!")
    Metadata = data;
    hasLoadedMeta = true;
    RealSetter();
}

function Setup(data) {
    console.log("Setup called!")
    dictionaryData = data;
    hasLoaded = true;
    RealSetter();
}

function RealSetter() {
    console.log("Real setter...");
    if (hasLoaded && hasLoadedMeta) {
        console.log("EVERYTHING IN ORDER!");
        setLetterList();
        setWordList();
        setWordPage();
        setCategoriesList();
        setCategoryList();
    }
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
        letter = "A";
    }

    var words = dictionaryData[letter]["words"];
    var wordTitle = document.getElementById("current-letter");
    var wordDescription = document.getElementById("letter-description");
    var wordList = document.getElementById("word-list");
    var wordCounter = document.getElementById("word-counter");
    var lastUpdate = document.getElementById("last-update");

    if (wordTitle == undefined || wordDescription == undefined || wordList == undefined) {
        return;
    }

    if (hasLoadedMeta) {
        wordCounter.innerText = "There are currently " + Metadata["num_of_words"] + " words in the Noku Dictionary."
        console.log("Metadata timestamp: " + String(Metadata["timestamp"]))
        var date = new Date(Metadata["timestamp"] * 1000);
        var actualMonth = date.getMonth() + 1;
        var actualDate = date.getDate();
        lastUpdate.innerText = "Last updated on " + date.getFullYear() + "/" + (actualMonth < 10 ? "0" + actualMonth : actualMonth) + "/" + (actualDate < 10 ? "0" + actualDate : actualDate);
    }

    document.title = letter + " | Noku Language";
    wordTitle.innerText = letter;
    wordDescription.innerText = dictionaryData[letter]["description"];
    console.log(words);
    for (var i = 0; i < words.length; i++) {
        var newWord = document.createElement("li");
        var newWordLink = document.createElement("a");
        var newWordSpan = document.createElement("span");
        var currentDefinition = words[i]["definitions"][0];
        newWordSpan.textContent = "(" + words[i]["type"] + ") -> \"" + currentDefinition + "\" (...)";
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
    var pageTitle = document.getElementById("page-title-word");

    for (var i = 0; i < words.length; i++) {
        if (words[i]["word"] == word) {
            wordData = words[i];
            pageTitle.textContent = word + " | " + "Noku Language";
            wordTitle.textContent = word;
            wordType.textContent = wordData["type"];
            if (wordData["type"].includes("Verb")) {
                var possibleImperative = word.slice(0, 2);
                console.log("Possible imperative: " + possibleImperative);
                var pILower = possibleImperative.toLowerCase();
                var theCheck = (!pILower.includes("a") && !pILower.includes("e") && 
                                !pILower.includes("i") && !pILower.includes("o") && 
                                !pILower.includes("u"));
                if (theCheck)
                    possibleImperative = word.slice(0, 3) + word.slice(1, word.length);
                else
                    possibleImperative += word.toLowerCase();
                console.log(theCheck);
                possibleVerbForms.innerHTML = "Past: <span>" + word + ((word.endsWith("a")) ? "non" : "anon") + "</span> | Future: <span>" + word + "rian" + "</span> | Imperative: <span>" + possibleImperative + "</span>"
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

            if (wordData["examples"].length == 0) {
                wordExamples.innerHTML = "";
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
                var currentDefinition = currentWordData["definitions"][0];
                var newSearchItem = document.createElement("li");
                var newSearchLink = document.createElement("a");
                newSearchLink.innerHTML = currentWordData["word"] + " <span>(" + currentWordData["type"] + ")</span>  -> <span>\"" + currentDefinition + "\" (...)</span>";
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
    var matchedStart = [];
    var matchedRegex = [];
    var matchedStartDef = [];
    var matchedRegexDef = [];

    for (var i = 0; i < letters.length; i++) {
        var words = dictionaryData[letters[i]]["words"];
        for (var n = 0; n < words.length; n++) {
            var currentWordData = words[n];

            for (var j = 0; j < currentWordData["definitions"].length; j++) {
                var currentDefinition = currentWordData["definitions"][j];
                if (currentDefinition.toLowerCase().startsWith(searchBar.value.toLowerCase())) {
                    console.log("Match: " + currentDefinition);
                    matchedStart.push(currentWordData);
                    matchedStartDef.push(currentDefinition);
                    matchedEnglish = true;
                    continue;
                }

                if (new RegExp("\\b" + searchBar.value.toLowerCase() + "\\b").test(currentDefinition.toLowerCase())) {
                    console.log("Match: " + currentDefinition);
                    matchedRegex.push(currentWordData);
                    matchedRegexDef.push(currentDefinition);
                    matchedEnglish = true;
                }
            }
        }
    }

    var totalLength = matchedStart.length + matchedRegex.length;
    console.log("Total Length: " + totalLength);
    for (var i = 0; i < totalLength; i++) {
        var n = i - matchedStart.length;
        var currentWordData = (n < 0) ? matchedStart[i] : matchedRegex[n];
        var currentDefinition = (n < 0) ? matchedStartDef[i] : matchedRegexDef[n];
        var letter = currentWordData["word"].toUpperCase().slice(0, 1);
        letter = (letter == "-") ? currentWordData["word"].toUpperCase().slice(1, 2) : letter;

        var newSearchItem = document.createElement("li");
        var newSearchLink = document.createElement("a");
        newSearchLink.innerHTML = currentWordData["word"] + " <span>(" + currentWordData["type"] + ")</span>  -> <span>\"" + currentDefinition + "\"</span>";
        newSearchLink.href = "word.html?letter=" + letter + "&word=" + currentWordData["word"];
        newSearchItem.appendChild(newSearchLink);
        matchingEnglishList.appendChild(newSearchItem);
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

function setLetterList() {
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

function setCategoriesList() {
    console.log("Setting the list that contains all the categories...")
    var categories = Metadata["categories"];
    var categoriesList = document.getElementById("categories-list");

    if (categoriesList == undefined)
        return;

    for (var i = 0; i < categories.length; i++) {
        var newItem = document.createElement("li");
        var newItemLink = document.createElement("a");
        newItemLink.textContent = categories[i];
        newItemLink.href = "categories.html?category=" + i;
        newItem.appendChild(newItemLink);
        categoriesList.appendChild(newItem);
    }
}

function setCategoryList() {
    console.log("Category list called...")

    if (!hasLoadedMeta)
        return;

    var category = new URLSearchParams(window.location.search).get("category");
    if (category == null) {
        console.error("Category returned null.");
        category = Metadata["categories"][0];
    }
    else
    {
        category = Metadata["categories"][category];
    }

    var wordTitle = document.getElementById("current-category");
    var wordList = document.getElementById("category-list");

    document.getElementById("page-title").innerText = category + " | " + "Noku Language";
    wordTitle.innerText = category;
    var letters = getLetters();
    for (var l = 0; l < letters.length; l++) {
        var letter = letters[l];
        var words = dictionaryData[letter]["words"];
        for (var i = 0; i < words.length; i++) {
            var hasType = words[i]["type"].includes(category);
            if (category == "Fix")
                hasType = (words[i]["type"].includes("Suffix") || words[i]["type"].includes("Prefix"))
            if (!hasType) {
                continue;
            }

            var newWord = document.createElement("li");
            var newWordLink = document.createElement("a");
            var newWordSpan = document.createElement("span");
            var currentDefinition = words[i]["definitions"][0];
            newWordSpan.textContent = "(" + words[i]["type"] + ") -> \"" + currentDefinition + "\" (...)";
            newWordLink.textContent = words[i]["word"] + " ";
            newWordLink.href = "word.html?letter=" + letter + "&word=" + words[i]["word"];
            newWordLink.appendChild(newWordSpan);
            newWord.appendChild(newWordLink);
            wordList.appendChild(newWord);
        }
    }
}
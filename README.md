# **Noku Language**

## Introduction
Welcome to the **Official Noku to English Dictionary Website Repository** , made by yours truly. 

Noku Language is a simple, spoken / written language created by [Nokutoka Momiji](https://www.github.com/NokutokaMomiji). It was created as an attempt to create a simpler, new language with sensible and simple rules and structure.

The base dictionary document can be found [here](https://docs.google.com/document/d/1o37wxGVKjD7Y0m-wSIY2T8IX4aHma1fx/edit?usp=sharing&ouid=113385481694575437883&rtpof=true&sd=true). The language is still growing every day with more words and more information. Comments and suggestions are encouraged.

This repository contains all of the files used in making the website and app versions of the dictionary found above.

## Usage
The Noku Language Utilities file (`nlutil.py`) serves to parse the data from the online Google Docs document and create the `data.json` file that powers the website. It serves no other utility outside of its main purpose, but I guess it could aid in the design of a parser or something.
1. Clone repository.<br>
```git pull https://github.com/NokutokaMomiji/Noku-Language-Dictionary.git```
1. Install dependencies.<br>
To install the dependencies, use the requirements.txt file.<br>
```pip install -r requirements.txt```<br>
Otherwise, manually install gdown.<br>
```pip install gdown```
1. Simply run the main script.<br>
```python nlutil.py```<br>
This will create the directories `src`, `docs` and `docs/data`.
Will also create a `docs/data/data.json` file containing the word data from the online dictionary.


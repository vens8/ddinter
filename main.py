import os
import sqlite3
from flask import Flask, render_template
from flask import jsonify


global pdata

pdata="a"
global graph
graph=1
drugsList, sortedInteractionDictionary = {}, {}

app = Flask(__name__)
app.secret_key = "secret key"


@app.route('/')
def dd_inter():
    fetch_process_drugs()
    # Rendering the ddinter html and returning the dictionaries
    return render_template('ddinter.html', drugsList=drugsList, interactionDictionary=sortedInteractionDictionary)


def fetch_process_drugs():
    global drugsList, sortedInteractionDictionary
    # Pull and process data here for faster and efficient query handling

    # Connect to database
    conn = sqlite3.connect("dashdata.db")
    c = conn.cursor()

    # Fetch the values of the 'drugsList' table from the SQLITE database
    c.execute("SELECT * FROM drugsList")

    # Get the results and store to dictionary
    rows = c.fetchall()
    drugsList = {}

    # Iterate over the rows and create key-value pairs for each row
    for row in rows:
        drugsList[row[0]] = row[1]

    # print(drugsList)

    # Fetch results from 'interactionTable' table on SQLITE
    c.execute("SELECT * FROM interactionTable")
    rows = c.fetchall()

    sortedInteractionDictionary = {}
    interactionDictionary = {}

    if (len(rows) > 0):
        for row in rows:
            temp = {}
            temp[row[1]] = row[2]
            if row[0] not in interactionDictionary.keys():
                interactionDictionary[row[0]] = []
            interactionDictionary[row[0]].append(temp)

    sortedInteractionDictionary = dict(sorted(interactionDictionary.items()))

    conn.commit()
    c.close()
    # print(sortedInteractionDictionary)


@app.route('/getDrugsList')
def getDrugsList():
    global drugsList
    print(jsonify(drugsList))
    return jsonify(drugsList)


@app.route('/getInteractionTable')
def getInteractionTable():
    global sortedInteractionDictionary
    print(jsonify(sortedInteractionDictionary))
    return jsonify(sortedInteractionDictionary)

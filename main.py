import sqlite3
from flask import Flask, render_template, request
from flask import jsonify
import configparser
from logging import FileHandler,WARNING

drugsList, sortedInteractionDictionary = {}, {}
# config = configparser.ConfigParser()
# config.read('.config')
# app.secret_key = config.get('Section', 'flaskKey')
# file_handler = FileHandler('errorlog.txt')
# file_handler.setLevel(WARNING)

app = Flask(__name__, template_folder='templates')


@app.route('/')
def dd_inter():
    fetch_process_drugs()
    # Rendering the ddinter html and returning the dictionaries
    return render_template('ddinter.html', drugsList=drugsList, interactionDictionary=sortedInteractionDictionary)


@app.route('/testing')
def testing():
    print('called')
    return render_template('test.html')


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

    if len(rows) > 0:
        for row in rows:
            temp = {row[1]: row[2]}
            if row[0] not in interactionDictionary.keys():
                interactionDictionary[row[0]] = []
            interactionDictionary[row[0]].append(temp)

    sortedInteractionDictionary = dict(sorted(interactionDictionary.items()))

    conn.commit()
    c.close()
    # print(sortedInteractionDictionary)


@app.route('/getDrugsList')
def getDrugsList():
    print('called')
    global drugsList
    print(jsonify(drugsList))
    return jsonify(drugsList)


# Very inefficient approach (huge amount of data to be sent to front end)
@app.route('/getInteractionTable')
def getInteractionTable():
    global sortedInteractionDictionary
    print(jsonify(sortedInteractionDictionary))
    return jsonify(sortedInteractionDictionary)


@app.route('/getInteractions', methods=['POST'])
def getInteractions():
    print(request.json)
    data = request.json
    drugIDs = [int(x) for x in data['drugIDs']]
    interactions = []
    interactionSet = set()  # Use a set to avoid duplicates
    # Loop through each pair of drug IDs in the list
    for i in range(len(drugIDs)):
        drugID = int(drugIDs[i])
        # Check if the first drug ID is in the interaction table
        if drugID in sortedInteractionDictionary:
            # Loop through each interaction of the first drug ID
            for interaction in sortedInteractionDictionary[drugID]:
                # Check if the interacting drug is in the drug IDs list
                for id in interaction.keys():
                    if id in drugIDs:
                        # Generate a unique key for the interaction
                        key = "{}|{}|{}".format(drugID, id, interaction[id])
                        # Add the interaction to the set if it's unique
                        if key not in interactionSet:
                            interactionSet.add(key)
                            # Add the interaction to the list
                            interactions.append({
                                "drug1": drugsList[drugID],
                                "drug2": drugsList[id],
                                "severity": interaction[id]
                            })

    print('interactions', interactions)
    return jsonify(interactions=interactions)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)

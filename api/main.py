# TavLab, IIITD
# | Authors |
# Rahul Maddula (github.com/vens8)
# Vatsal Lakhmani (github.com/mitsreese)
import base64
import sqlite3

import nxviz
from flask import Flask, render_template, request, send_from_directory
from flask import jsonify
import networkx as nx
import csv

# import configparser
# from logging import FileHandler,WARNING

drugsList, sortedInteractionDictionary, drugSynonyms = {}, {}, {}
# config = configparser.ConfigParser()
# config.read('.config')
# app.secret_key = config.get('Section', 'flaskKey')
# file_handler = FileHandler('errorlog.txt')
# file_handler.setLevel(WARNING)

app = Flask(__name__)


@app.route('/')
def dd_inter():
	fetch_process_drugs()
	# Rendering the ddinter html and returning the dictionaries
	return render_template('ddinter.html', drugsList=drugsList)


def fetch_process_drugs():
	global drugsList, sortedInteractionDictionary, drugSynonyms
	# Pull and process data here for faster and efficient query handling

	# Connect to database
	conn = sqlite3.connect("dashdata.db")  # Use this path for Vercel deployment, not working on local, need to fix
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

	# Execute the query to retrieve drugs and their synonyms
	c.execute('SELECT drugsList.name, GROUP_CONCAT(synonyms.synonym, ", ") AS synonyms '
			  'FROM drugsList '
			  'LEFT JOIN synonyms ON drugsList.id = synonyms.drugID '
			  'GROUP BY drugsList.id')

	conn.commit()

	# Fetch all the results
	results = c.fetchall()

	# Create the dictionary
	for row in results:
		drug_name, synonyms = row
		if synonyms:
			drugSynonyms[drug_name] = synonyms.split(', ')
		else:
			drugSynonyms[drug_name] = None

	conn.close()


# print(sortedInteractionDictionary)


@app.route('/getDrugsList', methods=['GET'])
def getDrugsList():
	global drugsList
	return jsonify(drugsList)


@app.route('/getSynonyms', methods=['GET'])
def getSynonyms():
	global drugSynonyms
	return jsonify(drugSynonyms)


# Very inefficient approach (huge amount of data to be sent to front end)
@app.route('/getInteractionTable')
def getInteractionTable():
	global sortedInteractionDictionary
	return jsonify(sortedInteractionDictionary)


@app.route('/getInteractions', methods=['POST'])
def getInteractions():
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

	return jsonify(interactions=interactions)


def rescale(l, newmin, newmax):
	arr = list(l)
	min_val = min(arr)
	max_val = max(arr)
	return [((x - min_val) / (max_val - min_val)) * (newmax - newmin) + newmin for x in arr]


def retrieve_data():
	date = request.form.get('date')
	severity = request.form.get('severity')
	print('received date', date)
	print('received severity', severity)

	interactions = []
	with open('static/sample.csv', 'r') as csvfile:
		csvreader = csv.reader(csvfile)
		header = next(csvreader)  # Skip the header row
		for row in csvreader:
			interactions.append(dict(zip(header, row)))

	print(interactions)
	# filtered_interactions = []
	# for interaction in interactions:
	# 	print(interaction['Date'], date, interaction['Date'] == date)
	# 	print(interaction['Severity'], severity, interaction['Severity'] == severity)
	# 	if interaction['Date'] == date and interaction['Severity'] == severity:
	# 		filtered_interactions.append(interaction)
	# 		print(filtered_interactions)
	filtered_interactions = [interaction for interaction in interactions if
							 interaction['Date'] == date and interaction['Severity'] == severity]

	print('filtered interactions', filtered_interactions)
	majorlist = [[interaction['Date'], interaction['Drug_1'], interaction['Drug_2'], interaction['AggregateValue']] for
				 interaction in filtered_interactions]

	print('major list', majorlist)

	G = nx.Graph(name='Drug-Drug Interaction Graph')
	for interaction in majorlist:
		a = interaction[1]
		b = interaction[2]
		w = int(float(interaction[3]) * 100)
		if w > 1:
			G.add_weighted_edges_from([(a, b, w)])

	nodelist = list(G.nodes())
	ws = []
	edgelist = []
	if G.number_of_edges() > 0:
		ws = rescale([w['weight'] for _, _, w in G.edges(data=True)], 1, 10)
		edgelist = [{'source': source, 'target': target, 'weight': weight} for (source, target, weight) in
					G.edges(data='weight')]

	response_data = {
		'nodelist': nodelist,
		'ws': ws,
		'edgelist': edgelist
	}
	print('sending', response_data)
	return jsonify(response_data)


import networkx as nx
import nxviz as nv
from nxviz import annotate
import matplotlib.pyplot as plt
import pandas as pd
import io


@app.route('/retrieveData', methods=['POST'])
def retrieveData():
	data = request.get_json()
	from_date = data['fromDate']
	till_date = data['toDate']
	severity = data['severity']
	if not all([from_date, till_date, severity]):
		# Return an error message if any input is missing
		return jsonify({'error': 'Please provide all the required input.'}), 400
	def generate_interaction_plot(from_date, till_date, severity):
		G = nx.Graph(name='Drug-Drug Interaction Graph')

		# Read interactions from CSV file
		interactions = pd.read_csv('static/sample.csv').values

		# Filter interactions based on date range and severity
		filtered_interactions = interactions[
			(interactions[:, 0] >= from_date) & (interactions[:, 0] <= till_date) & (interactions[:, 3] == severity)]

		# Aggregate interactions based on combination of interaction[1] and interaction[2]
		aggregated_interactions = {}
		for interaction in filtered_interactions:
			key = (interaction[1], interaction[2])
			if key in aggregated_interactions:
				aggregated_interactions[key] += 1
			else:
				aggregated_interactions[key] = 1

		for interaction, aggregated_value in aggregated_interactions.items():
			a, b = interaction
			w = int(aggregated_value * 100)  # score as weighted edge

			# To include all the weighted connections, uncomment the following line
			# G.add_weighted_edges_from([(a,b,w)])

			# To only keep high scoring edges, use the following lines
			if w > 1:  # only keep high scoring edges
				G.add_weighted_edges_from([(a, b, w)])

		# Function to rescale list of values to range [newmin,newmax]
		def rescale(l, newmin, newmax, rnd=False):
			arr = list(l)
			arr_min = min(arr)
			arr_max = max(arr)

			if arr_max == arr_min:
				return [newmin] * len(arr)

			return [round((x - arr_min) / (arr_max - arr_min) * (newmax - newmin) + newmin, 2) for x in arr]

		nodelist = [n for n in G.nodes]
		ws = rescale([float(G[u][v]['weight']) for u, v in G.edges], 1, 10)
		# alternative method below
		# ws = rescale([float(G[u][v]['weight'])**70 for u,v in G.edges],1,50)
		edgelist = [(str(u), str(v), {"weight": ws.pop(0)}) for u, v in G.edges]

		# Create new graph using nodelist and edgelist
		g = nx.Graph(name='Protein Interaction Graph')
		g.add_nodes_from(nodelist)
		g.add_edges_from(edgelist)

		# Go through nodes in graph G and store their degree as "class" in graph g
		for v in G:
			g.nodes[v]["class"] = G.degree(v)

		print('graph', g)
		nv.circos(
			g,
			edge_alpha_by="weight",
		)
		annotate.circos_group(g, group_by="class")
		# Save the plot to a BytesIO object
		img_bytes = io.BytesIO()
		plt.savefig(img_bytes, format='png')
		img_bytes.seek(0)
		# Return the BytesIO object
		return img_bytes

	try:
		# Call the function to generate the interaction plot
		img_bytes = generate_interaction_plot(from_date, till_date, severity)
	except Exception as e:
		# Return an error message if there's an error generating the plot
		return jsonify({'error': 'Error generating the interaction plot.'}), 500

	if not img_bytes:
		# Return a message if no interactions were found in the given date range
		return jsonify({'message': 'No interactions found in the given date range.'}), 200

	# Convert the plot BytesIO to base64
	img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')

	# Return the base64-encoded image as the response
	return img_base64


if __name__ == "__main__":
	retrieveData()
	app.run(debug=True, host='0.0.0.0', port=9000)

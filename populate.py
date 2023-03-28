import csv
import sqlite3

filename = "DDInterTable.csv"
dictionary = {}

with open(filename, "r") as csv_file:
	csv_reader = csv.DictReader(csv_file)
	for row in csv_reader:
		dictionary[int(row["DDInterID_A"].split("DDInter")[1])] = row["Drug_A"]
		dictionary[int(row["DDInterID_B"].split("DDInter")[1])] = row["Drug_B"]

sorted_dictionary = dict(sorted(dictionary.items()))

# print(sorted_dictionary)


# Connect to database
conn = sqlite3.connect("dashdata.db")
c = conn.cursor()

c.execute("DROP TABLE drugsList")
conn.commit()

# THE FOLLOWING CODE IS TO CREATE A TABLE AND INSERT THE VALUES FROM THE ABOVE DICTIONARY

c.execute("CREATE TABLE IF NOT EXISTS drugsList (id INTEGER PRIMARY KEY, name TEXT)")
conn.commit()

# # Insert the key-value pairs into the table
for key, value in dictionary.items():
	c.execute("INSERT INTO drugsList (id, name) VALUES (?, ?)", (key, value))

conn.commit()

# THE FOLLOWING CODE IS TO FETCH THE VALUES OF THE 'drugsList' TABLE FROM THE SQLITE DATABASE
c.execute("SELECT * FROM drugsList")
conn.commit()

# # Print the results
rows = c.fetchall()
# if len(rows) > 0:
#     print("The table has the following values:")
#     for row in rows:
#         print(row)
# else:
#     print("The table is empty.")


# DICTIONARY TO STORE THE FETCHED VALUES
drugsList = {}

# Iterate over the rows and create key-value pairs for each row
for row in rows:
	drugsList[row[0]] = row[1]

print(drugsList)

# PARSE THE DRUG INTERACTION TABLE
filename = "DDInterTable.csv"
interactionDictionary = {}

with open(filename, "r") as csv_file:
	csv_reader = csv.DictReader(csv_file)
	for row in csv_reader:
		temp = {int(row["DDInterID_B"].split("DDInter")[1]): row["Level"]}
		drugA_id = int(row["DDInterID_A"].split("DDInter")[1])
		if drugA_id not in interactionDictionary.keys():
			interactionDictionary[drugA_id] = []
		interactionDictionary[drugA_id].append(temp)

sortedInteractionDictionary = dict(sorted(interactionDictionary.items()))

# print(sortedInteractionDictionary)

c.execute("DROP TABLE interactionTable")
conn.commit()

# Create table interactionTable
c.execute('''CREATE TABLE IF NOT EXISTS interactionTable 
             (DDInterID_A INTEGER, DDInterID_B INTEGER, Level TEXT)''')

conn.commit()

# Clear the records from the interactionTable
# c.execute("DELETE FROM interactionTable")

# Get the current count of records in the interactionTable
c.execute("SELECT COUNT (*) FROM interactionTable")
conn.commit()
# print(c.fetchall())


# Insert data into the interactionTable (similar to DDInterTable.csv, but more concise)
for key, value in sortedInteractionDictionary.items():
	for item in value:
		for subkey, subvalue in item.items():
			# print(key, subkey, subvalue)
			c.execute("INSERT INTO interactionTable (DDInterID_A, DDInterID_B, Level) VALUES (?, ?, ?)",
					  (key, subkey, subvalue))

conn.commit()

c.execute("SELECT * FROM interactionTable")
conn.commit()
rows = c.fetchall()

sortedInteractionDictionary = {}

# Iterate over the rows and create key-value pairs for each row
# Format -> (Drug A, Drug B, Level)

# The DDInterTable.csv has been stored on the SQL table and can be extracted with the above code:
# Then the sorted interaction dictionary can be computed before the ddinter page is rendered
# This will then be sent as a request json to the front end which then can be used to efficiently find the drug interactions


# Some performance metrics:


# count = 0
# if len(rows) > 0:
#     print("The table has the following values:")
#     for row in rows:
#         # print(row)
#         count += 1
# else:
#     print("The table is empty.")


# print('count', count)


if len(rows) > 0:
	for row in rows:
		temp = {}
		temp[row[1]] = row[2]
		if row[0] not in interactionDictionary.keys():
			interactionDictionary[row[0]] = []
		interactionDictionary[row[0]].append(temp)

sortedInteractionDictionary = dict(sorted(interactionDictionary.items()))

print(sortedInteractionDictionary)

conn.commit()
c.close()

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def upload_form():
	return render_template('ddinter.html')


if __name__ == "__main__":
	app.run(host='127.0.0.1', debug=True, port=5001)

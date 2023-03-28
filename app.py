from flask import Flask, request, redirect, url_for, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def upload_form():
	return render_template('homepage.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0')

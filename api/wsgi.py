from waitress import serve
import webbrowser
import threading
from main import app


def open_browser():
    webbrowser.open_new_tab('http://localhost:8888')


if __name__ == '__main__':
    threading.Timer(1, open_browser).start()
    serve(app, host='0.0.0.0', port=8888)
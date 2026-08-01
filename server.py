from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


HOST = "127.0.0.1"
PORT = 4173
ROOT = Path(__file__).resolve().parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    server = ThreadingHTTPServer((HOST, PORT), NoCacheHandler)
    print(f"Serving {ROOT} at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()

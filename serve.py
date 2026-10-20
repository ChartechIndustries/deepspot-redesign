import http.server, sys, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "source"))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("", int(sys.argv[1]) if len(sys.argv)>1 else 8765), H).serve_forever()

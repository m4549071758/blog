from flask import Flask, request, abort
import subprocess

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def webhook():
    if request.method == "POST":
        i = 0
        while i < 5:
            subprocess.run("git pull", shell=True, cwd="/home/user/blog/")
            i += 1
        print("OK")
        return "Pull Complete, Success", 200
    else:
        return "Invalid request method", 405

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
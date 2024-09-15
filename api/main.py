from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route("/")
def hello_world():
    return jsonify({
        "problem": "There are 2009 positive integers less than 2010, of which 1005 are odd. If $\\frac{1}{n}$ is equal to a terminating decimal, then $n$ can only be divisible by 2 and 5. However, since we have the added restriction that $n$ is odd, $n$ must be a power of 5. There are five powers of 5 less than 2010. \\begin{align*}\n5^0 &= 1 \\\\\n5^1 &= 5 \\\\\n5^2 &= 25 \\\\\n5^3 &= 125 \\\\\n5^4 &= 625\n\\end{align*} Note that $5^5 = 3125$. Since there are five odd integers that satisfy our desired condition, the desired probability is $\\frac{5}{1005} = \\frac{1}{201}$. This is in simplest terms, so our answer is $1+201 = \\boxed{202}$.", 
        "level": "Level 5", 
        "type": "Intermediate Algebra", 
        "solution": "Let $r$ be a common root, so\n\\begin{align*}\n1988r^2 + br + 8891 &= 0, \\\\\n8891r^2 + br + 1988 &= 0.\n\\end{align*}Subtracting these equations, we get $6903r^2 - 6903 = 6903 (r^2 - 1) = 0,$ so $r = \\pm 1.$\n\nIf $r = 1,$ then $1988 + b + 8891 = 0,$ so $b = \\boxed{-10879}.$  If $r = -1,$ then $1988 - b + 8891 = 0,$ so $b = \\boxed{10879}.$", 
        "id": "test_intermediate_algebra_2089"
    })

if __name__ == "__main__":
    app.run(debug=True)
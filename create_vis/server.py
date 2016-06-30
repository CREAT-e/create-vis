from flask import Flask, render_template, request
import requests

app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/bar_chart")
def chart_test():
    #TODO: Parameterise API url via config files
    response = requests.get("http://localhost:4000/properties")
    properties = response.json()["properties"]

    field = request.args.get('field')

    if field:
        values_response = requests.get("http://localhost:4000/values?field=" + field)

        field_values = values_response.json()["values"]
        return render_template("chart.html", properties=properties, values=field_values, current_field=field)
    else:
        return render_template("chart.html", properties=properties, values = [])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])

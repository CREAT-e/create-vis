# create-vis
A web application that hosts dynamic, user-friendly copyright data visualisations.

## Quick Start

Create a configuration file:

```python
# See cfg/example.cfg for an example.
SECRET_KEY = ""
DEBUG = True
PORT = 3000
```

Set the environment variable `COPYRIGHT_EVIDENCE_API_CFG` to the path of your configuration file:

```shell
$ export CREATE_VIS_CFG=/home/user/copyright-evidence-api/cfg/development.cfg
```

Clone the repository:

```shell
$ git clone https://github.com/CREAT-e/create-vis
$ cd create-vis
```

Install the dependencies:

```shell
pip install -r requirements/development.txt
```

Run the server.

```shell
$ python create_vis/server.py
```

Open <http://localhost:3000>

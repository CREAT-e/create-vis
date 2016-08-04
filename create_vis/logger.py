import logging

DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


def init_logger(app):
    if "LOG_FILE" not in app.config:
        return
    if "LOG_LEVEL" not in app.config:
        app.config["LOG_LEVEL"] = DEFAULT_LOG_LEVEL
    if "LOG_FORMAT" not in app.config:
        app.config["LOG_FORMAT"] = DEFAULT_LOG_FORMAT
    handler = logging.FileHandler(app.config["LOG_FILE"])
    handler.setLevel(app.config["LOG_LEVEL"])
    formatter = logging.Formatter(app.config["LOG_FORMAT"])
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)

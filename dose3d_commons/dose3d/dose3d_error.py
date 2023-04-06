class Dose3DException(Exception):
    """Error of Dose3D job"""

    message = ""
    inner_exception = None

    def __init__(self, message, inner_exception=None):
        self.message = message
        self.inner_exception = inner_exception

    def __str__(self) -> str:
        return self.message
